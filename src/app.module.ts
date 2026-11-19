
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { Member } from "./member.entity";
import { Rating } from "./rating.entity";
import { Favorite } from "./entity/favorite.entity";

import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { RatingController } from "./rating.controller";

import { FavoriteController } from "./controller/favorite.controller";
import { FavoriteService } from "./service/favorite.service";

import { MovieRecordController } from "./controller/movie-record.controller";
import { MovieRecordService } from "./service/movie-record.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: process.env.DB_PASSWORD,
      database: "umc_study",
      entities: [Member, Rating, Favorite],
      synchronize: false,
    }),

    TypeOrmModule.forFeature([
      Member,
      Rating,
      Favorite,
    ]),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: Number(
            configService.get<string>(
              "JWT_ACCESS_EXPIRATION",
            ) ?? 3600,
          ),
        },
      }),
    }),
  ],

  controllers: [
    AppController,
    MemberController,
    AuthController,
    RatingController,
    FavoriteController,
    MovieRecordController,
  ],

  providers: [
    AppService,
    MemberService,
    AuthService,
    FavoriteService,
    MovieRecordService,
  ],
})
export class AppModule {}
