
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from './member.entity';
import { LoginRequestDto } from './login-request.dto';
import { LoginResponseDto } from './login-response.dto';
import { ApiException } from './exception/api.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. 이메일로 회원 찾기
    const member = await this.memberRepository.findOne({
      where: { email: dto.email },
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_1',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 2. 입력한 비밀번호와 저장된 해시 비교
    const isPasswordMatched = await bcrypt.compare(
      dto.password,
      member.password,
    );

    if (!isPasswordMatched) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_1',
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 3. 로그인 성공 -> JWT 발급
    const accessToken = await this.jwtService.signAsync({
      sub: String(member.memberId),
      email: member.email,
    });

    return {
      nickname: member.nickname,
      accessToken,
    };
  }
}
