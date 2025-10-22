// src/auth/jwt/jwt-invitation.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtInvitationStrategy extends PassportStrategy(Strategy, 'jwt-invitation') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const secret = config.get<string>('JWT_INVITATION_SECRET');
    console.log('🔍 JwtInvitationStrategy - Secret configurado:', !!secret);
    
    if (!secret) {
      throw new Error('JWT_INVITATION_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = req.query.token;
          console.log('🔍 JwtInvitationStrategy - Token extraído:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔍 JwtInvitationStrategy - Payload recibido:', payload);
    
    if (!payload.sub) {
      console.log('❌ JwtInvitationStrategy - Payload sin sub (user id)');
      throw new Error('Token inválido: falta user id');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      console.log('❌ JwtInvitationStrategy - Usuario no encontrado para id:', payload.sub);
      throw new Error('Usuario no existe');
    }

    console.log('✅ JwtInvitationStrategy - Usuario válido encontrado:', user.email);
    
    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      hasPassword: !!user.password,
    };
  }
}