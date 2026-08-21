import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly keyLength = 64;
  private readonly tokens = new Map<
    string,
    { username: string; expiresAt: Date }
  >();

  constructor(private readonly configService: ConfigService) {}

  validateCredentials(username: string, password: string): boolean {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPasswordHash = this.configService.get<string>(
      'ADMIN_PASSWORD_HASH',
    );
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    let isPasswordValid = false;

    if (adminPasswordHash) {
      const [salt, expectedHash] = adminPasswordHash.trim().split(':');

      if (!salt || !expectedHash) {
        return false;
      }

      const actualHash = crypto
        .scryptSync(password, salt, this.keyLength)
        .toString('hex');

      const expectedBuffer = Buffer.from(expectedHash, 'hex');
      const actualBuffer = Buffer.from(actualHash, 'hex');

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      isPasswordValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } else if (adminPassword) {
      isPasswordValid = password === adminPassword;
    } else {
      return false;
    }

    return (
      username.toLowerCase() === adminUsername?.toLocaleLowerCase() &&
      isPasswordValid
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
