
import {
  Injectable,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from './member.entity';
import { Rating } from './rating.entity';

import { CreateMemberDto } from './create-member.dto';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';

import { MemberInfoResponseDto } from './member-info-response.dto';
import { MemberUpdateRequestDto } from './member-update-request.dto';
import { ApiException } from './exception/api.exception';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  // ==========================================
  // 5~6주차 기존 기능
  // ==========================================

  // 1. 닉네임 중복 확인
  async checkNickname(nickname: string) {
    const member = await this.memberRepository.findOne({
      where: { nickname },
    });

    return { available: !member };
  }

  // 2. 이메일 중복 확인
  async checkEmail(email: string) {
    const member = await this.memberRepository.findOne({
      where: { email },
    });

    return { available: !member };
  }

  // 3. 회원별 평점 조회 - 공개 API
  async getMemberRatings(memberId: number) {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }

    return this.ratingRepository.find({
      where: { member: { memberId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 4. 회원가입
  async signUp(dto: CreateMemberDto) {
    const existingEmail = await this.memberRepository.findOneBy({
      email: dto.email,
    });

    if (existingEmail) {
      throw new ConflictException(
        '이미 사용 중인 이메일입니다.',
      );
    }

    const existingNickname =
      await this.memberRepository.findOneBy({
        nickname: dto.nickname,
      });

    if (existingNickname) {
      throw new ConflictException(
        '이미 사용 중인 닉네임입니다.',
      );
    }

    // 비밀번호 해시 처리
    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const member = this.memberRepository.create({
      email: dto.email,
      password: hashedPassword,
      nickname: dto.nickname,
    });

    const savedMember =
      await this.memberRepository.save(member);

    return {
      memberId: savedMember.memberId,
      email: savedMember.email,
      nickname: savedMember.nickname,
    };
  }

  // ==========================================
  // 7주차 - 내 정보 조회 및 수정
  // ==========================================

  // 5. 내 정보 조회
  async getMyInfo(
    memberId: number,
  ): Promise<MemberInfoResponseDto> {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }

    // 비밀번호를 제외한 회원 정보 반환
    return MemberInfoResponseDto.from(member);
  }

  // 6. 내 정보 수정
  async updateMyInfo(
    memberId: number,
    dto: MemberUpdateRequestDto,
  ): Promise<MemberInfoResponseDto> {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }

    // 본인을 제외하고 닉네임 중복 확인
    const duplicated = await this.memberRepository.findOne({
      where: {
        nickname: dto.nickname,
        memberId: Not(memberId),
      },
    });

    if (duplicated) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'MEMBER409_1',
        '이미 사용 중인 닉네임입니다.',
      );
    }

    // 닉네임 변경 후 DB 저장
    member.nickname = dto.nickname;

    const savedMember =
      await this.memberRepository.save(member);

    return MemberInfoResponseDto.from(savedMember);
  }

  // ==========================================
  // 7주차 - JWT 기반 평점 API
  // ==========================================

  // 7. 평점 등록
  async createRating(
    memberId: number,
    dto: CreateRatingDto,
  ) {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }

    // 동일한 영화에 중복 등록 방지
    const existing = await this.ratingRepository.findOne({
      where: {
        member: { memberId },
        movieId: dto.movieId,
      },
    });

    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'RATING409_1',
        '이미 이 영화에 평점을 남기셨습니다.',
      );
    }

    const rating = this.ratingRepository.create({
      member,
      movieId: dto.movieId,
      score: dto.score,
      comment: dto.comment ?? null,
    });

    const savedRating =
      await this.ratingRepository.save(rating);

    // ratingId 숫자만 반환하지 않고
    // 평점 정보 전체를 반환
    return this.toRatingResponse(savedRating);
  }

  // 8. 평점 수정
  async updateRating(
    memberId: number,
    ratingId: number,
    dto: UpdateRatingDto,
  ) {
    // 평점 존재 여부 및 작성자 확인
    const rating = await this.findOwnedRating(
      memberId,
      ratingId,
    );

    rating.score = dto.score;
    rating.comment = dto.comment ?? null;

    const savedRating =
      await this.ratingRepository.save(rating);

    // 수정된 평점 정보 반환
    return this.toRatingResponse(savedRating);
  }

  // 9. 평점 삭제
  async deleteRating(
    memberId: number,
    ratingId: number,
  ): Promise<void> {
    // 본인이 작성한 평점인지 확인
    const rating = await this.findOwnedRating(
      memberId,
      ratingId,
    );

    await this.ratingRepository.remove(rating);
  }

  // 10. 평점 소유권 확인
  private async findOwnedRating(
    memberId: number,
    ratingId: number,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { ratingId },
      relations: { member: true },
    });

    // 존재하지 않는 평점
    if (!rating) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'RATING404_1',
        '해당 평점을 찾을 수 없습니다.',
      );
    }

    // 다른 회원이 작성한 평점
    if (rating.member.memberId !== memberId) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'RATING403_1',
        '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
      );
    }

    return rating;
  }

  // 11. 평점 응답 형식 통일
  private toRatingResponse(rating: Rating) {
    return {
      ratingId: rating.ratingId,
      movieId: rating.movieId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
    };
  }
}
