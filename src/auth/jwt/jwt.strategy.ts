// src/auth/jwt/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    console.log('🔐 Validando JWT con payload:', payload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        password: true, // Necesario para verificar si completó registro
        role: true,
      },
    });

    console.log('👤 Usuario encontrado en validate:', user);

    if (!user) {
      throw new UnauthorizedException('Usuario no existe');
    }

    if (!user.password) {
      throw new UnauthorizedException('Debe completar su registro primero');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
