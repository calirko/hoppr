import { Hono } from 'hono';
import { auth } from './lib/auth.ts';
import { apiKeys } from './routes/api-keys.ts';
import { authRoutes } from './routes/auth.ts';
import { connections } from './routes/connections.ts';
import { sessions } from './routes/sessions.ts';
import { users } from './routes/users.ts';

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ ok: true }));
app.route('/auth', authRoutes);
app.use('/connections/*', auth);
app.route('/connections', connections);
app.use('/users/*', auth);
app.route('/users', users);
app.use('/sessions/*', auth);
app.route('/sessions', sessions);
app.use('/api-keys/*', auth);
app.route('/api-keys', apiKeys);

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
};
