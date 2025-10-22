// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport'; // Importa PassportModule
import { JwtStrategy } from './jwt/jwt.strategy'; // Importa tu estrategia
import { JwtInvitationStrategy } from './jwt/jwt-invitation.strategy';
import { JwtInvitationGuard } from './jwt/jwt-invitation.guard';
import { RolesGuard } from './roles.guard';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Añade esto
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtInvitationStrategy,
    JwtInvitationGuard,
    RolesGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}