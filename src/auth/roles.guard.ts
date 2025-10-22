// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('🔍 Required roles for route:', requiredRoles);

    if (!requiredRoles) {
      console.log('⚠️ No roles required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('👤 Request user:', request.user);

    if (!request.user) {
      console.log('❌ No user found on request');
      return false;
    }

    const hasRole = requiredRoles.includes(request.user.role);
    console.log(`🔑 User role is "${request.user.role}". Access allowed?`, hasRole);

    return hasRole;
  }
}
