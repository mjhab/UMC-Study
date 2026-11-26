
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { MemberService } from './member.service';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';
import { AuthGuard } from './guard/auth.guard';

type AuthenticatedRequest = Request & {
  memberId: number;
};

@ApiTags('평점')
@ApiBearerAuth('bearerAuth')
@ApiResponse({
  status: 401,
  description: 'JWT 토큰이 없어 로그인이 필요한 경우',
  schema: {
    example: {
      isSuccess: false,
      code: 'AUTH401_2',
      message: '로그인이 필요한 요청입니다.',
      result: null,
    },
  },
})
@Controller()
@UseGuards(AuthGuard)
export class RatingController {
  constructor(
    private readonly memberService: MemberService,
  ) {}

  // 1. 평점 등록
  @ApiOperation({
    summary: '평점 등록',
    description:
      '로그인한 회원이 영화에 평점과 리뷰를 등록합니다. JWT 인증이 필요합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '평점 등록 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 해당 영화에 평점을 등록한 경우',
    schema: {
      example: {
        isSuccess: false,
        code: 'RATING409_1',
        message: '이미 이 영화에 평점을 남기셨습니다.',
        result: null,
      },
    },
  })
  @Post('ratings')
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
  @ApiOperation({
    summary: '평점 수정',
    description:
      '로그인한 회원이 본인이 작성한 평점과 리뷰를 수정합니다. JWT 인증이 필요합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '평점 수정 성공',
  })
  @ApiResponse({
    status: 403,
    description: '다른 회원이 작성한 평점을 수정하려는 경우',
    schema: {
      example: {
        isSuccess: false,
        code: 'RATING403_1',
        message:
          '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
        result: null,
      },
    },
  })
  @Patch('ratings/:ratingId')
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
  @ApiOperation({
    summary: '평점 삭제',
    description:
      '로그인한 회원이 본인이 작성한 평점을 삭제합니다. JWT 인증이 필요합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '평점 삭제 성공',
  })
  @ApiResponse({
    status: 403,
    description: '다른 회원이 작성한 평점을 삭제하려는 경우',
    schema: {
      example: {
        isSuccess: false,
        code: 'RATING403_1',
        message:
          '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
        result: null,
      },
    },
  })
  @Delete('ratings/:ratingId')
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
      code: 'COMMON200',
      message: '평점을 삭제했습니다.',
      result: null,
    };
  }
}
