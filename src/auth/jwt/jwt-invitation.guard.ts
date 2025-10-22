// src/auth/jwt/jwt-invitation.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInvitationGuard extends AuthGuard('jwt-invitation') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;
    
    console.log('🔍 JwtInvitationGuard - Token recibido:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    console.log('🔍 JwtInvitationGuard - Token length:', token?.length);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔍 JwtInvitationGuard - handleRequest:', {
      err: err?.message,
      user: user ? `User ID: ${user.sub}, Email: ${user.email}` : 'NO USER',
      info: info?.message
    });

    if (err || !user) {
      throw new UnauthorizedException('Token de invitación inválido');
    }
    return user;
  }
}