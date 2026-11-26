
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { ApiException } from "../exception/api.exception";
import { Favorite } from "../entity/favorite.entity";
import { Member } from "../member.entity";
import { FavoriteService } from "./favorite.service";

describe("FavoriteService 단위 테스트", () => {
  let favoriteService: FavoriteService;

  // 실제 DB 대신 사용할 가짜 Repository
  const favoriteRepository = {
    findOne: jest.fn<() => Promise<Favorite | null>>(),
    create: jest.fn<() => Favorite>(),
    save: jest.fn<() => Promise<Favorite>>(),
  };

  const memberRepository = {
    findOneBy: jest.fn<() => Promise<Member | null>>(),
  };

  const member = {
    memberId: 1,
    nickname: "영화조아",
  } as Member;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FavoriteService,
          {
            provide: getRepositoryToken(Favorite),
            useValue: favoriteRepository,
          },
          {
            provide: getRepositoryToken(Member),
            useValue: memberRepository,
          },
        ],
      }).compile();

    favoriteService =
      module.get<FavoriteService>(FavoriteService);
  });

  // 테스트 1: 즐겨찾기 정상 등록
  it("아직 즐겨찾기하지 않은 영화면 정상적으로 저장한다", async () => {
    // given: 회원이 존재하고 즐겨찾기하지 않은 상태
    memberRepository.findOneBy.mockResolvedValue(member);
    favoriteRepository.findOne.mockResolvedValue(null);

    favoriteRepository.create.mockReturnValue({
      member,
      movieId: 550,
    } as Favorite);

    favoriteRepository.save.mockResolvedValue({
      favoriteId: 1,
      member,
      movieId: 550,
      createdAt: new Date("2026-11-26T12:00:00.000Z"),
      updatedAt: new Date("2026-11-26T12:00:00.000Z"),
    } as Favorite);

    // when: 즐겨찾기를 등록하면
    const result = await favoriteService.create(1, {
      movieId: 550,
    });

    // then: 영화 ID가 반환되고 저장이 한 번 호출된다
    expect(result.movieId).toBe(550);
    expect(favoriteRepository.save).toHaveBeenCalledTimes(1);
  });

  // 테스트 2: 즐겨찾기 중복 등록
  it("이미 즐겨찾기한 영화면 FAVORITE409_1 예외가 발생하고 저장하지 않는다", async () => {
    // given: 회원이 이미 550번 영화를 즐겨찾기한 상태
    memberRepository.findOneBy.mockResolvedValue(member);

    favoriteRepository.findOne.mockResolvedValue({
      favoriteId: 1,
      member,
      movieId: 550,
    } as Favorite);

    // when & then: 예외가 발생해야 한다
    await expect(
      favoriteService.create(1, { movieId: 550 }),
    ).rejects.toThrow(ApiException);

    // 중복 등록이므로 저장 함수가 실행되면 안 된다
    expect(favoriteRepository.save).not.toHaveBeenCalled();
  });
});
