import { Hono } from 'hono';
import { connections } from './routes/connections.ts';

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ ok: true }));
app.route('/connections', connections);

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
};
