import { Hono } from 'hono';
import { auth } from './lib/auth.ts';
import { authRoutes } from './routes/auth.ts';
import { connections } from './routes/connections.ts';
import { users } from './routes/users.ts';

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ ok: true }));
app.route('/auth', authRoutes);
app.use('/connections/*', auth);
app.route('/connections', connections);
app.use('/users/*', auth);
app.route('/users', users);

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
};
