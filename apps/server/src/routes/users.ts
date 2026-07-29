import { Hono } from 'hono';
import { Password } from '../lib/password.ts';
import { prisma } from '../lib/prisma.ts';
import type { TokenPayload } from '../lib/token.ts';

type Variables = {
  user: TokenPayload['user'];
};

export const users = new Hono<{ Variables: Variables }>();

const SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

users.get('/', async (c) => {
  const items = await prisma.user.findMany({
    select: SELECT,
    orderBy: { createdAt: 'desc' },
  });
  return c.json(items);
});

users.post('/', async (c) => {
  const body = await c.req.json();
  const { password, ...rest } = body;
  if (!password) {
    return c.json({ error: 'Password is required' }, 400);
  }
  const created = await prisma.user.create({
    data: { ...rest, passwordHash: await Password.hash(password) },
    select: SELECT,
  });
  return c.json(created, 201);
});

users.get('/:id', async (c) => {
  const item = await prisma.user.findUnique({
    where: { id: c.req.param('id') },
    select: SELECT,
  });
  if (!item) return c.notFound();
  return c.json(item);
});

users.patch('/:id', async (c) => {
  const body = await c.req.json();
  const { password, ...rest } = body;
  const updated = await prisma.user.update({
    where: { id: c.req.param('id') },
    data: {
      ...rest,
      ...(password ? { passwordHash: await Password.hash(password) } : {}),
    },
    select: SELECT,
  });
  return c.json(updated);
});

users.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (id === c.get('user').id) {
    return c.json({ error: 'You cannot delete your own account' }, 403);
  }
  await prisma.user.delete({ where: { id } });
  return c.body(null, 204);
});
