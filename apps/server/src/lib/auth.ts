import type { Context, Next } from 'hono';
import { prisma } from './prisma.ts';
import { Token, type TokenPayload } from './token.ts';

type Variables = {
  user: TokenPayload['user'];
  token: string;
};

export const auth = async (
  c: Context<{ Variables: Variables }>,
  next: Next,
) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = await Token.verify(token);
    const session = await prisma.userSession.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.user.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', user);
    c.set('token', token);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
