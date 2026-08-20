import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly tokens = new Map<
    string,
    { username: string; expiresAt: Date }
  >();

  constructor(private readonly configService: ConfigService) {}

  validateCredentials(username: string, password: string): boolean {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    return (
      username.toLowerCase() === adminUsername?.toLocaleLowerCase() &&
      password === adminPassword
    );
  }

  generateToken(username: string): string {
    const now = new Date();

    for (const [token, record] of this.tokens.entries()) {
      if (record.expiresAt < now) {
        this.tokens.delete(token);
      }
    }

    if (this.tokens.size >= 5) {
      const oldestToken = this.tokens.keys().next().value as string;
      this.tokens.delete(oldestToken);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    this.tokens.set(token, { username, expiresAt });
    return token;
  }

  validateToken(token: string): { username: string } | null {
    const record = this.tokens.get(token);
    if (!record) {
      return null;
    }
    if (record.expiresAt < new Date()) {
      this.tokens.delete(token);
      return null;
    }
    return { username: record.username };
  }

  revokeToken(token: string): void {
    this.tokens.delete(token);
  }
}
