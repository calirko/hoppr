import { sign, verify } from 'hono/jwt';

export interface TokenPayload {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  iat: number;
  exp: number;
  [key: string]: unknown;
}

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const Token = {
  nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  },

  async generate(user: TokenPayload['user']): Promise<string> {
    const iat = this.nowInSeconds();
    const payload: TokenPayload = {
      user,
      iat,
      exp: iat + EXPIRATION_SECONDS,
    };
    return sign(payload, SECRET, 'HS256');
  },

  verify(token: string): Promise<TokenPayload> {
    return verify(token, SECRET, 'HS256') as Promise<TokenPayload>;
  },
};
