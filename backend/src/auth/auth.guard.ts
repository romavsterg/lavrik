import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const cookies = cookieHeader.split(';').map((c) => c.trim().split('='));
  for (const [key, value] of cookies) {
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const cookieHeader = request.headers?.cookie;
    const token = cookieHeader ? getCookieValue(cookieHeader, 'token') : undefined;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const user = this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    request['user'] = user;
    return true;
  }
}
