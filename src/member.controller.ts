
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './create-member.dto';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 5주차 - 닉네임 중복 체크
  @Get('nickname/:nickname')
  async checkNickname(@Param('nickname') nickname: string) {
    return await this.memberService.checkNickname(nickname);
  }

  // 5주차 - 이메일 중복 체크
  @Get('email/:email')
  async checkEmail(@Param('email') email: string) {
    return await this.memberService.checkEmail(email);
  }

  // 5주차 - 유저별 평점 조회
  @Get(':memberId/ratings')
  async getMemberRatings(
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return await this.memberService.getMemberRatings(memberId);
  }

  // 6주차 - 회원가입
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateMemberDto) {
    const result = await this.memberService.signUp(dto);

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '회원가입에 성공했습니다.',
      result,
    };
  }

  // 6주차 - 평점 등록
  @Post(':memberId/ratings')
  @HttpCode(HttpStatus.CREATED)
  async createRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateRatingDto,
  ) {
    const ratingId = await this.memberService.createRating(memberId, dto);

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점 등록에 성공했습니다.',
      result: ratingId,
    };
  }

  // 6주차 - 평점 수정
  @Patch(':memberId/ratings/:ratingId')
  @HttpCode(HttpStatus.OK)
  async updateRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    await this.memberService.updateRating(ratingId, memberId, dto);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 수정에 성공했습니다.',
      result: null,
    };
  }

  // 6주차 - 평점 삭제
  @Delete(':memberId/ratings/:ratingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.memberService.deleteRating(ratingId, memberId);
  }
}
