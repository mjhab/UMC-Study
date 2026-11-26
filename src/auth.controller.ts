import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginRequestDto } from './login-request.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: '이메일 로그인',
    description:
      '이메일과 비밀번호로 로그인하고 Access Token을 발급받습니다. ' +
      '발급받은 토큰은 Swagger의 Authorize 버튼에 입력해 인증이 필요한 API를 호출할 수 있습니다.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto) {
    const result = await this.authService.login(dto);

    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '로그인에 성공했습니다.',
      result,
    };
  }
}