import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

function getCookieValue(
  cookieHeader: string,
  name: string,
): string | undefined {
  const cookies = cookieHeader.split(';').map((c) => c.trim().split('='));
  for (const [key, value] of cookies) {
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const { username, password } = body;
    if (!this.authService.validateCredentials(username, password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = this.authService.generateToken(username);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ message: 'Login successful' });
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res() res: Response) {
    res.clearCookie('token');
    return res.json({ message: 'Logout successful' });
  }

  @Get('me')
  @HttpCode(200)
  me(@Req() req: Request) {
    const cookieHeader = req.headers?.cookie;
    const token = cookieHeader
      ? getCookieValue(cookieHeader, 'token')
      : undefined;
    if (!token) {
      return { user: null };
    }
    const user = this.authService.validateToken(token);
    return { user: user ? { username: user.username } : null };
  }
}
