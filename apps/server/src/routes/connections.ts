import { Hono } from 'hono';
import { prisma } from '../lib/prisma.ts';
import type { TokenPayload } from '../lib/token.ts';

type Variables = {
  user: TokenPayload['user'];
};

export const connections = new Hono<{ Variables: Variables }>();

connections.get('/', async (c) => {
  const userId = c.get('user').id;
  const items = await prisma.connection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(items);
});

connections.post('/', async (c) => {
  const userId = c.get('user').id;
  const body = await c.req.json();
  const created = await prisma.connection.create({
    data: { ...body, userId },
  });
  return c.json(created, 201);
});

connections.get('/:id', async (c) => {
  const userId = c.get('user').id;
  const item = await prisma.connection.findUnique({
    where: { id: c.req.param('id'), userId },
  });
  if (!item) return c.notFound();
  return c.json(item);
});

connections.patch('/:id', async (c) => {
  const userId = c.get('user').id;
  const body = await c.req.json();
  const { userId: _ignored, ...data } = body;
  const { count } = await prisma.connection.updateMany({
    where: { id: c.req.param('id'), userId },
    data,
  });
  if (count === 0) return c.notFound();
  const updated = await prisma.connection.findUnique({
    where: { id: c.req.param('id') },
  });
  return c.json(updated);
});

connections.delete('/:id', async (c) => {
  const userId = c.get('user').id;
  const { count } = await prisma.connection.deleteMany({
    where: { id: c.req.param('id'), userId },
  });
  if (count === 0) return c.notFound();
  return c.body(null, 204);
});
