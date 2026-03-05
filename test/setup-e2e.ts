import { config } from 'dotenv';
import { join } from 'path';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { Client } from 'pg';

config({ path: join(__dirname, '..', '.env.test'), override: true });

const schemaId = randomUUID();

function generateUniqueDatabaseURL(schemaId: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Please provide a DATABASE_URL environment variable');
  }

  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schemaId);

  return url.toString();
}

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId);
  process.env.DATABASE_URL = databaseURL;

  execSync(`npx prisma db push --accept-data-loss --url "${databaseURL}"`, {
    env: { ...process.env },
    stdio: 'pipe',
  });
});

afterAll(async () => {
  const baseUrl = process.env.DATABASE_URL!;
  const originalUrl = new URL(baseUrl);
  originalUrl.searchParams.delete('schema');

  const pgClient = new Client({ connectionString: originalUrl.toString() });
  await pgClient.connect();
  await pgClient.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await pgClient.end();
});
