
import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { MemberService } from "./member.service";
import { Member } from "./member.entity";
import { Rating } from "./rating.entity";
import { ApiException } from "./exception/api.exception";

describe("MemberService 평점 단위 테스트", () => {
  let memberService: MemberService;

  // 실제 DB 대신 사용할 Mock Repository
  const memberRepository = {
    findOneBy: jest.fn<() => Promise<Member | null>>(),
  };

  const ratingRepository = {
    findOne: jest.fn<() => Promise<Rating | null>>(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const member = {
    memberId: 1,
    email: "member1@example.com",
    nickname: "회원1",
  } as Member;

  const otherMember = {
    memberId: 2,
    email: "member2@example.com",
    nickname: "회원2",
  } as Member;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          MemberService,
          {
            provide: getRepositoryToken(Member),
            useValue: memberRepository,
          },
          {
            provide: getRepositoryToken(Rating),
            useValue: ratingRepository,
          },
        ],
      }).compile();

    memberService =
      module.get<MemberService>(MemberService);
  });

  // 테스트 1: 평점 중복 등록
  it("같은 영화에 평점을 중복 등록하면 409와 RATING409_1 예외가 발생한다", async () => {
    // given: 1번 회원이 550번 영화에 평점을 등록한 상태
    memberRepository.findOneBy.mockResolvedValue(member);

    ratingRepository.findOne.mockResolvedValue({
      ratingId: 10,
      member,
      movieId: 550,
      score: 4,
      comment: "좋아요",
    } as Rating);

    // when: 같은 영화에 다시 평점을 등록하면
    let caughtError: unknown;

    try {
      await memberService.createRating(1, {
        movieId: 550,
        score: 5,
        comment: "재등록",
      });
    } catch (error) {
      caughtError = error;
    }

    // then: HTTP 409 및 RATING409_1 확인
    expect(caughtError).toBeInstanceOf(ApiException);

    const error = caughtError as ApiException;

    expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(error.code).toBe("RATING409_1");

    // 중복 등록이므로 DB 저장을 시도하지 않아야 함
    expect(ratingRepository.save).not.toHaveBeenCalled();
  });

  // 테스트 2: 다른 회원의 평점 수정
  it("다른 회원의 평점을 수정하면 403과 RATING403_1 예외가 발생한다", async () => {
    // given: 2번 회원이 작성한 평점
    ratingRepository.findOne.mockResolvedValue({
      ratingId: 20,
      member: otherMember,
      movieId: 550,
      score: 3,
      comment: "원래 리뷰",
    } as Rating);

    // when: 1번 회원이 2번 회원의 평점을 수정하면
    let caughtError: unknown;

    try {
      await memberService.updateRating(1, 20, {
        score: 5,
        comment: "수정 시도",
      });
    } catch (error) {
      caughtError = error;
    }

    // then: HTTP 403 및 RATING403_1 확인
    expect(caughtError).toBeInstanceOf(ApiException);

    const error = caughtError as ApiException;

    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(error.code).toBe("RATING403_1");

    // 다른 회원의 평점은 저장되면 안 됨
    expect(ratingRepository.save).not.toHaveBeenCalled();
  });
});
