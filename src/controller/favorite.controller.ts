import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request } from "express";

import { CreateFavoriteDto } from "../dto/create-favorite.dto";
import { AuthGuard } from "../guard/auth.guard";
import { FavoriteService } from "../service/favorite.service";

type AuthenticatedRequest = Request & {
  memberId: number;
};

@ApiTags("즐겨찾기")
@ApiBearerAuth("bearerAuth")
@Controller("favorites")
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
  ) {}

  // 1. 즐겨찾기 등록
  @ApiOperation({
    summary: "즐겨찾기 등록",
    description:
      "로그인한 회원이 영화 ID를 이용해 즐겨찾기를 등록합니다. JWT 인증이 필요합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "즐겨찾기 등록 성공",
    schema: {
      example: {
        isSuccess: true,
        code: "COMMON201",
        message: "즐겨찾기를 등록했습니다.",
        result: {
          favoriteId: 1,
          movieId: 550,
          createdAt: "2026-09-13T21:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "토큰이 없거나 유효하지 않음",
    schema: {
      example: {
        isSuccess: false,
        code: "AUTH401_2",
        message: "로그인이 필요한 요청입니다.",
        result: null,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "이미 즐겨찾기한 영화",
    schema: {
      example: {
        isSuccess: false,
        code: "FAVORITE409_1",
        message: "이미 이 영화를 즐겨찾기하셨습니다.",
        result: null,
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateFavoriteDto,
  ) {
    const memberId = request.memberId;

    const result = await this.favoriteService.create(
      memberId,
      dto,
    );

    return {
      isSuccess: true,
      code: "COMMON201",
      message: "즐겨찾기를 등록했습니다.",
      result,
    };
  }

  // 2. 내 즐겨찾기 목록 조회
  @ApiOperation({
    summary: "내 즐겨찾기 목록 조회",
    description:
      "로그인한 회원이 등록한 즐겨찾기 영화 목록을 조회합니다. JWT 인증이 필요합니다.",
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyFavorites(
    @Req() request: AuthenticatedRequest,
  ) {
    const memberId = request.memberId;

    const result =
      await this.favoriteService.getMyFavorites(memberId);

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "내 즐겨찾기 목록을 조회했습니다.",
      result,
    };
  }

  // 3. 특정 영화 즐겨찾기 여부 조회
  @ApiOperation({
    summary: "특정 영화 즐겨찾기 여부 조회",
    description:
      "로그인한 회원이 특정 영화를 즐겨찾기했는지 확인합니다. JWT 인증이 필요합니다.",
  })
  @Get(":movieId")
  @HttpCode(HttpStatus.OK)
  async getStatus(
    @Req() request: AuthenticatedRequest,
    @Param("movieId", ParseIntPipe) movieId: number,
  ) {
    const memberId = request.memberId;

    const result = await this.favoriteService.getStatus(
      memberId,
      movieId,
    );

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "즐겨찾기 여부를 조회했습니다.",
      result,
    };
  }

  // 4. 즐겨찾기 해제
  @ApiOperation({
    summary: "즐겨찾기 해제",
    description:
      "로그인한 회원이 특정 영화의 즐겨찾기를 해제합니다. JWT 인증이 필요합니다.",
  })
  @Delete(":movieId")
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param("movieId", ParseIntPipe) movieId: number,
  ) {
    const memberId = request.memberId;

    await this.favoriteService.delete(
      memberId,
      movieId,
    );

    return {
      isSuccess: true,
      code: "COMMON200",
      message: "즐겨찾기를 해제했습니다.",
      result: null,
    };
  }
}