import { config } from 'dotenv';
import { join } from 'path';

// Runs before any test module is imported.
// Does not override existing env vars, allowing CI (e.g. Jenkins) to set DATABASE_URL externally.
config({ path: join(__dirname, '..', '.env.test') });
