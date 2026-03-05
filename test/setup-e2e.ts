import { config } from 'dotenv';
import { join } from 'path';
import { execSync } from 'node:child_process';

config({ path: join(__dirname, '..', '.env.test'), override: true });

beforeAll(async () => {
  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env },
    stdio: 'pipe',
  });
});
