import { Password } from '../src/lib/password.ts';
import { prisma } from '../src/lib/prisma.ts';

const email = process.env.SEED_USER_EMAIL || 'root@hoppr.local';
const password = process.env.SEED_USER_PASSWORD || '123456';
const name = process.env.SEED_USER_NAME || 'root';

const passwordHash = await Password.hash(password);

const user = await prisma.user.upsert({
  where: { email },
  update: { passwordHash, name },
  create: { email, name, passwordHash },
});

console.log(`Seeded user ${user.email} (password: ${password})`);
