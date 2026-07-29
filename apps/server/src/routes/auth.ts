import { Hono } from 'hono';
import { auth } from '../lib/auth.ts';
import { Password } from '../lib/password.ts';
import { prisma } from '../lib/prisma.ts';
import { Token } from '../lib/token.ts';

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const emailOrName = body?.emailOrName as string | undefined;
  const password = body?.password as string | undefined;

  if (!emailOrName || !password) {
    return c.json({ error: 'Email/name and password are required' }, 400);
  }

  const user =
    (await prisma.user.findUnique({ where: { email: emailOrName } })) ??
    (await prisma.user.findFirst({ where: { name: emailOrName } }));

  if (!user || !(await Password.verify(password, user.passwordHash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await Token.generate({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  return c.json({ token });
});

authRoutes.get('/me', auth, (c) => {
  return c.json({ user: c.get('user') });
});
