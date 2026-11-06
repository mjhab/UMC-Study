
import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from './member.entity';
import { Rating } from './rating.entity';
import { CreateMemberDto } from './create-member.dto';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  // 1. 닉네임 중복 체크
  async checkNickname(nickname: string) {
    const member = await this.memberRepository.findOne({
      where: { nickname },
    });
    return { available: !member };
  }

  // 2. 이메일 중복 체크
  async checkEmail(email: string) {
    const member = await this.memberRepository.findOne({
      where: { email },
    });
    return { available: !member };
  }

  // 3. 유저별 평점 조회
  async getMemberRatings(memberId: number) {
    return await this.ratingRepository.find({
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
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const existingNickname = await this.memberRepository.findOneBy({
      nickname: dto.nickname,
    });

    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const member = this.memberRepository.create({
      email: dto.email,
      password: hashedPassword,
      nickname: dto.nickname,
    });

    const savedMember = await this.memberRepository.save(member);

    return {
      memberId: savedMember.memberId,
      email: savedMember.email,
      nickname: savedMember.nickname,
    };
  }

  // 5. 평점 등록
  async createRating(memberId: number, dto: CreateRatingDto) {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const existing = await this.ratingRepository.findOne({
      where: {
        member: { memberId },
        movieId: dto.movieId,
      },
    });

    if (existing) {
      throw new ConflictException(
        '이미 이 영화에 평점을 남기셨습니다.',
      );
    }

    const rating = this.ratingRepository.create({
      member,
      movieId: dto.movieId,
      score: dto.score,
      comment: dto.comment ?? null,
    });

    const saved = await this.ratingRepository.save(rating);

    return saved.ratingId;
  }

  // 6. 평점 수정
  async updateRating(
    ratingId: number,
    memberId: number,
    dto: UpdateRatingDto,
  ) {
    const rating = await this.findOwnedRating(ratingId, memberId);

    rating.score = dto.score;
    rating.comment = dto.comment ?? null;

    await this.ratingRepository.save(rating);
  }

  // 7. 평점 삭제
  async deleteRating(ratingId: number, memberId: number) {
    const rating = await this.findOwnedRating(ratingId, memberId);

    await this.ratingRepository.remove(rating);
  }

  // 8. 평점 소유자 확인
  private async findOwnedRating(
    ratingId: number,
    memberId: number,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { ratingId },
      relations: { member: true },
    });

    if (!rating) {
      throw new NotFoundException('존재하지 않는 평점입니다.');
    }

    if (rating.member.memberId !== memberId) {
      throw new ForbiddenException(
        '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
      );
    }

    return rating;
  }
}
