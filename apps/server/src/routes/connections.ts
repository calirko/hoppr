import { Hono } from 'hono';
import { prisma } from '../lib/prisma.ts';

export const connections = new Hono();

connections.get('/', async (c) => {
  const userId = c.req.query('userId');
  const items = await prisma.connection.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return c.json(items);
});

connections.post('/', async (c) => {
  const body = await c.req.json();
  const created = await prisma.connection.create({ data: body });
  return c.json(created, 201);
});

connections.get('/:id', async (c) => {
  const item = await prisma.connection.findUnique({
    where: { id: c.req.param('id') },
  });
  if (!item) return c.notFound();
  return c.json(item);
});

connections.patch('/:id', async (c) => {
  const body = await c.req.json();
  const updated = await prisma.connection.update({
    where: { id: c.req.param('id') },
    data: body,
  });
  return c.json(updated);
});

connections.delete('/:id', async (c) => {
  await prisma.connection.delete({ where: { id: c.req.param('id') } });
  return c.body(null, 204);
});
