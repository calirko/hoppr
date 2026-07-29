import { Hono } from 'hono';
import { prisma } from '../lib/prisma.ts';
import type { TokenPayload } from '../lib/token.ts';

type Variables = {
  user: TokenPayload['user'];
  token: string;
};

export const sessions = new Hono<{ Variables: Variables }>();

sessions.get('/', async (c) => {
  const userId = c.get('user').id;
  const currentToken = c.get('token');
  const items = await prisma.userSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      expiresAt: true,
      token: true,
    },
  });
  return c.json(
    items.map(({ token, ...session }) => ({
      ...session,
      isCurrent: token === currentToken,
    })),
  );
});

sessions.delete('/:id', async (c) => {
  const userId = c.get('user').id;
  const { count } = await prisma.userSession.deleteMany({
    where: { id: c.req.param('id'), userId },
  });
  if (count === 0) return c.notFound();
  return c.body(null, 204);
});
