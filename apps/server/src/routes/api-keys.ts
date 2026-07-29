import { Hono } from 'hono';
import { Password } from '../lib/password.ts';
import { prisma } from '../lib/prisma.ts';
import type { TokenPayload } from '../lib/token.ts';

type Variables = {
  user: TokenPayload['user'];
};

export const apiKeys = new Hono<{ Variables: Variables }>();

apiKeys.get('/', async (c) => {
  const userId = c.get('user').id;
  const items = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return c.json(items);
});

apiKeys.post('/', async (c) => {
  const userId = c.get('user').id;
  const body = await c.req.json().catch(() => null);
  const name = body?.name as string | undefined;
  if (!name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const secret = crypto.randomUUID().replaceAll('-', '');
  const key = `hpr_${secret}`;
  const keyHash = await Password.hash(key);

  const created = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix: key.slice(0, 12),
    },
    select: { id: true, name: true, keyPrefix: true, createdAt: true },
  });

  return c.json({ ...created, key }, 201);
});

apiKeys.delete('/:id', async (c) => {
  const userId = c.get('user').id;
  const { count } = await prisma.apiKey.deleteMany({
    where: { id: c.req.param('id'), userId },
  });
  if (count === 0) return c.notFound();
  return c.body(null, 204);
});
