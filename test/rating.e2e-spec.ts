
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

import { RatingController } from "../src/rating.controller";
import { MemberService } from "../src/member.service";
import { Member } from "../src/member.entity";
import { Rating } from "../src/rating.entity";
import { HttpExceptionFilter } from "../src/http-exception.filter";

describe("평점 API 통합 테스트", () => {
  let app: INestApplication;
  let memberRepository: Repository<Member>;
  let authorization: string;

  beforeAll(async () => {
    // SQL.js 테스트 DB에서 timestamp 타입 호환 처리
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
          // 실제 MySQL이 아닌 테스트용 메모리 DB
          TypeOrmModule.forRoot({
            type: "sqljs",
            autoSave: false,
            entities: [Member, Rating],
            synchronize: true,
          }),

          TypeOrmModule.forFeature([
            Member,
            Rating,
          ]),

          JwtModule.register({
            global: true,
            secret: "test-secret-for-rating-e2e",
            signOptions: {
              expiresIn: 3600,
            },
          }),
        ],

        controllers: [RatingController],
        providers: [MemberService],
      }).compile();

    app = moduleFixture.createNestApplication();

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

    // 테스트용 회원 생성
    const member = await memberRepository.save(
      memberRepository.create({
        email: "rating-e2e@example.com",
        password: "test-password",
        nickname: "평점테스트",
      }),
    );

    // 테스트용 로그인 토큰 발급
    const jwtService = moduleFixture.get(JwtService);

    const token = jwtService.sign({
      sub: String(member.memberId),
      email: member.email,
    });

    authorization = `Bearer ${token}`;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // 테스트 1: 인증 없이 평점 등록
  it("토큰 없이 POST /ratings를 요청하면 401과 AUTH401_2를 반환한다", async () => {
    const response = await request(app.getHttpServer())
      .post("/ratings")
      .send({
        movieId: 550,
        score: 5,
        comment: "재미있는 영화입니다.",
      })
      .expect(401);

    expect(response.body.isSuccess).toBe(false);
    expect(response.body.code).toBe("AUTH401_2");
  });

  // 테스트 2: 인증 후 정상 평점 등록
  it("유효한 토큰으로 POST /ratings를 요청하면 201과 COMMON201을 반환한다", async () => {
    const response = await request(app.getHttpServer())
      .post("/ratings")
      .set("Authorization", authorization)
      .send({
        movieId: 550,
        score: 5,
        comment: "재미있는 영화입니다.",
      })
      .expect(201);

    expect(response.body.isSuccess).toBe(true);
    expect(response.body.code).toBe("COMMON201");
    expect(response.body.result.movieId).toBe(550);
  });
});
