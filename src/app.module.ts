import { RatingController } from './rating.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Member } from './member.entity';
import { Rating } from './rating.entity';

import { MemberController } from './member.controller';
import { MemberService } from './member.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: process.env.DB_PASSWORD,
      database: 'umc_study',
      entities: [Member, Rating],
      synchronize: false,
    }),

    TypeOrmModule.forFeature([Member, Rating]),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(
            configService.get<string>('JWT_ACCESS_EXPIRATION') ?? 3600,
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
],

  providers: [
    AppService,
    MemberService,
    AuthService,
  ],
})
export class AppModule {}
