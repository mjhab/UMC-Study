
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { MemberService } from './member.service';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';
import { AuthGuard } from './guard/auth.guard';

type AuthenticatedRequest = Request & {
  memberId: number;
};

@Controller()
export class RatingController {
  constructor(
    private readonly memberService: MemberService,
  ) {}

  // 1. 평점 등록
  @Post('ratings')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRating(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateRatingDto,
  ) {
    const result = await this.memberService.createRating(
      request.memberId,
      dto,
    );

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점을 등록했습니다.',
      result,
    };
  }

  // 2. 평점 수정
  @Patch('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateRating(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const result = await this.memberService.updateRating(
      request.memberId,
      ratingId,
      dto,
    );

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 수정했습니다.',
      result,
    };
  }

  // 3. 평점 삭제
  @Delete('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRating(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.memberService.deleteRating(
      request.memberId,
      ratingId,
    );

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 삭제했습니다.',
      result: null,
    };
  }
}
