
import { HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { CreateMovieRecordDto } from "../dto/create-movie-record.dto";
import { FavoriteResponseDto } from "../dto/favorite-response.dto";
import { MovieRecordResponseDto } from "../dto/movie-record-response.dto";

import { Favorite } from "../entity/favorite.entity";
import { Member } from "../member.entity";
import { Rating } from "../rating.entity";
import { ApiException } from "../exception/api.exception";

@Injectable()
export class MovieRecordService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async create(
    memberId: number,
    dto: CreateMovieRecordDto,
  ): Promise<MovieRecordResponseDto> {

    return this.dataSource.transaction(async (manager) => {

      // 같은 트랜잭션의 Repository 사용
      const memberRepository = manager.getRepository(Member);
      const ratingRepository = manager.getRepository(Rating);
      const favoriteRepository = manager.getRepository(Favorite);

      // 1. 회원 확인
      const member = await memberRepository.findOneBy({
        memberId,
      });

      if (!member) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          "MEMBER404_1",
          "해당 회원을 찾을 수 없습니다.",
        );
      }

      // 2. 평점 중복 확인
      const existingRating = await ratingRepository.findOne({
        where: {
          member: { memberId },
          movieId: dto.movieId,
        },
      });

      if (existingRating) {
        throw new ApiException(
          HttpStatus.CONFLICT,
          "RATING409_1",
          "이미 이 영화에 평점을 남기셨습니다.",
        );
      }

      // 3. 즐겨찾기 중복 확인
      if (dto.addToFavorites) {
        const existingFavorite = await favoriteRepository.findOne({
          where: {
            member: { memberId },
            movieId: dto.movieId,
          },
        });

        if (existingFavorite) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            "FAVORITE409_1",
            "이미 이 영화를 즐겨찾기하셨습니다.",
          );
        }
      }

      // 4. 평점 저장
      const savedRating = await ratingRepository.save(
        ratingRepository.create({
          member,
          movieId: dto.movieId,
          score: dto.score,
          comment: dto.comment ?? "",
        }),
      );

      // 5. 즐겨찾기 저장
      let favoriteResponse: FavoriteResponseDto | null = null;

      if (dto.addToFavorites) {
        const savedFavorite = await favoriteRepository.save(
          favoriteRepository.create({
            member,
            movieId: dto.movieId,
          }),
        );

        favoriteResponse = FavoriteResponseDto.from(
          savedFavorite,
        );
      }

      // 6. 두 저장 결과 반환
      return MovieRecordResponseDto.of(
        {
          ratingId: savedRating.ratingId,
          movieId: savedRating.movieId,
          score: savedRating.score,
          comment: savedRating.comment,
        },
        favoriteResponse,
      );
    });
  }
}
