
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateFavoriteDto } from "../dto/create-favorite.dto";
import { FavoriteResponseDto } from "../dto/favorite-response.dto";
import { FavoriteStatusResponseDto } from "../dto/favorite-status-response.dto";

import { Favorite } from "../entity/favorite.entity";
import { Member } from "../member.entity";
import { ApiException } from "../exception/api.exception";

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 1. 즐겨찾기 등록
  async create(
    memberId: number,
    dto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    const member = await this.memberRepository.findOneBy({
      memberId,
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "MEMBER404_1",
        "해당 회원을 찾을 수 없습니다.",
      );
    }

    const existing = await this.favoriteRepository.findOne({
      where: {
        member: { memberId },
        movieId: dto.movieId,
      },
    });

    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        "FAVORITE409_1",
        "이미 이 영화를 즐겨찾기하셨습니다.",
      );
    }

    const saved = await this.favoriteRepository.save(
      this.favoriteRepository.create({
        member,
        movieId: dto.movieId,
      }),
    );

    return FavoriteResponseDto.from(saved);
  }

  // 2. 내 즐겨찾기 목록 조회
  async getMyFavorites(
    memberId: number,
  ): Promise<FavoriteResponseDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: {
        member: { memberId },
      },
      order: {
        favoriteId: "DESC",
      },
    });

    return favorites.map((favorite) =>
      FavoriteResponseDto.from(favorite),
    );
  }

  // 3. 특정 영화 즐겨찾기 여부 조회
  async getStatus(
    memberId: number,
    movieId: number,
  ): Promise<FavoriteStatusResponseDto> {
    const isFavorite = await this.favoriteRepository.exists({
      where: {
        member: { memberId },
        movieId,
      },
    });

    return FavoriteStatusResponseDto.from(isFavorite);
  }

  // 4. 즐겨찾기 삭제
  async delete(
    memberId: number,
    movieId: number,
  ): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        member: { memberId },
        movieId,
      },
    });

    if (!favorite) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        "FAVORITE404_1",
        "즐겨찾기한 영화를 찾을 수 없습니다.",
      );
    }

    await this.favoriteRepository.remove(favorite);
  }
}
