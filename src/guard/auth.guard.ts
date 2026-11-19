
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { Request } from 'express';
import { ApiException } from '../exception/api.exception';

const BEARER_PREFIX = 'Bearer ';

type AuthenticatedRequest = Request & {
  memberId?: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const header = request.headers.authorization;

    // 1. Authorization 헤더 확인
    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_2',
        '로그인이 필요한 요청입니다.',
      );
    }

    // 2. Bearer 부분을 제외하고 JWT만 추출
    const token = header.slice(BEARER_PREFIX.length);

    try {
      // 3. JWT 서명과 만료 시간 검증
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);

      // 4. 회원 ID 확인
      const memberId = Number(payload.sub);

      if (!Number.isSafeInteger(memberId) || memberId <= 0) {
        throw new Error('Invalid memberId');
      }

      // 5. 요청 객체에 회원 ID 저장
      request.memberId = memberId;

    } catch (error) {
      // 만료된 토큰
      if (error instanceof TokenExpiredError) {
        throw new ApiException(
          HttpStatus.UNAUTHORIZED,
          'AUTH401_4',
          '토큰이 만료되었습니다. 다시 로그인해주세요.',
        );
      }

      // 위조되었거나 유효하지 않은 토큰
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_3',
        '유효하지 않은 토큰입니다.',
      );
    }

    // 6. 인증 성공 시 요청 허용
    return true;
  }
}
