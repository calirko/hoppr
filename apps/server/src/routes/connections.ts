import { Hono } from 'hono';
import { prisma } from '../lib/prisma.ts';
import type { TokenPayload } from '../lib/token.ts';

type Variables = {
  user: TokenPayload['user'];
};

export const connections = new Hono<{ Variables: Variables }>();

function withLastLaunchedAt<T extends { launches: { lastLaunchedAt: Date }[] }>(
  connection: T,
) {
  const { launches, ...rest } = connection;
  return { ...rest, lastLaunchedAt: launches[0]?.lastLaunchedAt ?? null };
}

connections.get('/', async (c) => {
  const userId = c.get('user').id;
  const items = await prisma.connection.findMany({
    include: { launches: { where: { userId } } },
    orderBy: { createdAt: 'desc' },
  });
  const withLaunch = items.map(withLastLaunchedAt);
  withLaunch.sort((a, b) => {
    if (!a.lastLaunchedAt && !b.lastLaunchedAt) return 0;
    if (!a.lastLaunchedAt) return 1;
    if (!b.lastLaunchedAt) return -1;
    return b.lastLaunchedAt.getTime() - a.lastLaunchedAt.getTime();
  });
  return c.json(withLaunch);
});

connections.post('/', async (c) => {
  const userId = c.get('user').id;
  const body = await c.req.json();
  const created = await prisma.connection.create({
    data: { ...body, createdById: userId },
    include: { launches: { where: { userId } } },
  });
  return c.json(withLastLaunchedAt(created), 201);
});

connections.get('/:id', async (c) => {
  const userId = c.get('user').id;
  const item = await prisma.connection.findUnique({
    where: { id: c.req.param('id') },
    include: { launches: { where: { userId } } },
  });
  if (!item) return c.notFound();
  return c.json(withLastLaunchedAt(item));
});

connections.patch('/:id', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');
  const body = await c.req.json();
  const { createdById: _ignored, lastLaunchedAt, ...data } = body;

  if (lastLaunchedAt !== undefined) {
    await prisma.connectionLaunch.upsert({
      where: { userId_connectionId: { userId, connectionId: id } },
      create: { userId, connectionId: id, lastLaunchedAt },
      update: { lastLaunchedAt },
    });
  }

  if (Object.keys(data).length > 0) {
    const { count } = await prisma.connection.updateMany({
      where: { id },
      data,
    });
    if (count === 0) return c.notFound();
  }

  const updated = await prisma.connection.findUnique({
    where: { id },
    include: { launches: { where: { userId } } },
  });
  if (!updated) return c.notFound();
  return c.json(withLastLaunchedAt(updated));
});

connections.delete('/:id', async (c) => {
  const { count } = await prisma.connection.deleteMany({
    where: { id: c.req.param('id') },
  });
  if (count === 0) return c.notFound();
  return c.body(null, 204);
});
