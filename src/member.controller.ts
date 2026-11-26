
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

import { AuthGuard } from './guard/auth.guard';
import { MemberService } from './member.service';
import { CreateMemberDto } from './create-member.dto';
import { CreateRatingDto } from './create-rating.dto';
import { UpdateRatingDto } from './update-rating.dto';
import { MemberUpdateRequestDto } from './member-update-request.dto';

@ApiTags('회원')
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

  // 유저별 평점 조회 - 공개 API
  @ApiOperation({
    summary: '유저별 평점 조회',
    description:
      '특정 회원이 작성한 평점 목록을 조회합니다. JWT 토큰이 필요 없는 공개 API입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저별 평점 조회 성공',
  })
  @Get(':memberId/ratings')
  async getMemberRatings(
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return await this.memberService.getMemberRatings(memberId);
  }

  // 6주차 - 회원가입
  @ApiOperation({
    summary: '회원가입',
    description:
      '이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다.',
  })
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

  // 6주차 - 기존 회원별 평점 등록 경로
  @Post(':memberId/ratings')
  @HttpCode(HttpStatus.CREATED)
  async createRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateRatingDto,
  ) {
    const ratingId = await this.memberService.createRating(
      memberId,
      dto,
    );

    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점 등록에 성공했습니다.',
      result: ratingId,
    };
  }

  // 6주차 - 기존 회원별 평점 수정 경로
  @Patch(':memberId/ratings/:ratingId')
  @HttpCode(HttpStatus.OK)
  async updateRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    await this.memberService.updateRating(
      ratingId,
      memberId,
      dto,
    );

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점 수정에 성공했습니다.',
      result: null,
    };
  }

  // 6주차 - 기존 회원별 평점 삭제 경로
  @Delete(':memberId/ratings/:ratingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRating(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.memberService.deleteRating(
      ratingId,
      memberId,
    );
  }

  // 7주차 - 내 정보 조회
  @ApiOperation({
    summary: '내 정보 조회',
    description:
      'JWT 토큰으로 인증한 회원의 정보를 조회합니다. 로그인이 필요합니다.',
  })
  @ApiBearerAuth('bearerAuth')
  @ApiResponse({
    status: 200,
    description: '내 정보 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없는 경우',
    schema: {
      example: {
        isSuccess: false,
        code: 'AUTH401_2',
        message: '로그인이 필요한 요청입니다.',
        result: null,
      },
    },
  })
  @Get('me')
  @UseGuards(AuthGuard)
  async getMyInfo(
    @Req() request: Request & { memberId: number },
  ) {
    const memberId = request.memberId;
    const result = await this.memberService.getMyInfo(memberId);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '회원 정보를 조회했습니다.',
      result,
    };
  }

  // 7주차 - 내 정보 수정
  @ApiOperation({
    summary: '내 정보 수정',
    description:
      'JWT 토큰으로 인증한 회원의 프로필 정보를 수정합니다. 로그인이 필요합니다.',
  })
  @ApiBearerAuth('bearerAuth')
  @ApiResponse({
    status: 200,
    description: '내 정보 수정 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없는 경우',
    schema: {
      example: {
        isSuccess: false,
        code: 'AUTH401_2',
        message: '로그인이 필요한 요청입니다.',
        result: null,
      },
    },
  })
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyInfo(
    @Req() request: Request & { memberId: number },
    @Body() dto: MemberUpdateRequestDto,
  ) {
    const memberId = request.memberId;

    const result = await this.memberService.updateMyInfo(
      memberId,
      dto,
    );

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '회원 정보를 수정했습니다.',
      result,
    };
  }
}
