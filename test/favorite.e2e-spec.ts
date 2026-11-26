
import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import {
  TypeOrmModule,
  getRepositoryToken,
} from "@nestjs/typeorm";
import request from "supertest";
import {
  getMetadataArgsStorage,
  Repository,
} from "typeorm";

import { FavoriteController } from "../src/controller/favorite.controller";
import { Favorite } from "../src/entity/favorite.entity";
import { Rating } from "../src/rating.entity";
import { Member } from "../src/member.entity";
import { HttpExceptionFilter } from "../src/http-exception.filter";
import { FavoriteService } from "../src/service/favorite.service";

describe("즐겨찾기 API 통합 테스트", () => {
  let app: INestApplication;

  let memberRepository: Repository<Member>;
  let favoriteRepository: Repository<Favorite>;

  let authorization: string;

  beforeAll(async () => {
    // MySQL 전용 timestamp 타입을
    // 테스트용 SQL.js에서만 datetime으로 처리
    const columns = getMetadataArgsStorage().columns;

    for (const column of columns) {
      const isTestEntity =
        column.target === Member ||
        column.target === Rating;

      if (
        isTestEntity &&
        column.options.type === "timestamp"
      ) {
        column.options.type = "datetime";
      }
    }

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [
          // 개발용 MySQL이 아닌 메모리 DB
          TypeOrmModule.forRoot({
            type: "sqljs",
            autoSave: false,
            entities: [Member, Rating, Favorite],
            synchronize: true,
          }),

          TypeOrmModule.forFeature([
            Member,
            Rating,
            Favorite,
          ]),

          JwtModule.register({
            global: true,
            secret: "test-secret-for-e2e-only",
            signOptions: {
              expiresIn: 3600,
            },
          }),
        ],

        controllers: [FavoriteController],
        providers: [FavoriteService],
      }).compile();

    app = moduleFixture.createNestApplication();

    // 실제 서버와 동일한 검증 및 예외 처리
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    memberRepository = moduleFixture.get<
      Repository<Member>
    >(getRepositoryToken(Member));

    favoriteRepository = moduleFixture.get<
      Repository<Favorite>
    >(getRepositoryToken(Favorite));

    // 통합 테스트 전용 회원 생성
    const member = await memberRepository.save(
      memberRepository.create({
        email: "week9-e2e@example.com",
        password: "test-password",
        nickname: "통합테스트",
      }),
    );

    // 테스트 전용 JWT 토큰 생성
    const jwtService = moduleFixture.get(JwtService);

    const token = jwtService.sign({
      sub: String(member.memberId),
      email: member.email,
    });

    authorization = `Bearer ${token}`;
  });

  beforeEach(async () => {
    // 테스트 간 데이터가 영향을 주지 않도록 초기화
    await favoriteRepository.clear();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // 테스트 1
  it("토큰 없이 즐겨찾기를 등록하면 401과 AUTH401_2를 반환한다", async () => {
    const response = await request(app.getHttpServer())
      .post("/favorites")
      .send({ movieId: 550 })
      .expect(401);

    expect(response.body.isSuccess).toBe(false);
    expect(response.body.code).toBe("AUTH401_2");
  });

  // 테스트 2
  it("유효한 토큰으로 즐겨찾기를 등록하면 201과 영화 ID를 반환한다", async () => {
    const response = await request(app.getHttpServer())
      .post("/favorites")
      .set("Authorization", authorization)
      .send({ movieId: 550 })
      .expect(201);

    expect(response.body.isSuccess).toBe(true);
    expect(response.body.code).toBe("COMMON201");
    expect(response.body.result.movieId).toBe(550);
  });

  // 테스트 3
  it("이미 즐겨찾기한 영화를 중복 등록하면 409와 FAVORITE409_1을 반환한다", async () => {
    // given: 먼저 동일 영화를 즐겨찾기에 등록
    await request(app.getHttpServer())
      .post("/favorites")
      .set("Authorization", authorization)
      .send({ movieId: 550 })
      .expect(201);

    // when: 같은 영화를 다시 등록
    const response = await request(app.getHttpServer())
      .post("/favorites")
      .set("Authorization", authorization)
      .send({ movieId: 550 })
      .expect(409);

    // then: 중복 등록 오류 확인
    expect(response.body.isSuccess).toBe(false);
    expect(response.body.code).toBe("FAVORITE409_1");
  });

  // 테스트 4
  it("즐겨찾기하지 않은 영화를 조회하면 200과 isFavorite false를 반환한다", async () => {
    const response = await request(app.getHttpServer())
      .get("/favorites/550")
      .set("Authorization", authorization)
      .expect(200);

    expect(response.body.code).toBe("COMMON200");
    expect(response.body.result.isFavorite).toBe(false);
  });
});
