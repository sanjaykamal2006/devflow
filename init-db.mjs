import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runSchema() {
  console.log('Connecting to Neon PostgreSQL and applying DevFlow schema...');
  const schemaPath = path.join('backend', 'src', 'main', 'resources', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split schema SQL into individual executable statements
  const statements = schemaSql
    .replace(/--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (err) {
      console.warn(`Notice on statement: ${statement.substring(0, 40)}... ->`, err.message);
    }
  }

  console.log('Verifying created tables in Neon database...');
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  console.log('Tables successfully verified:');
  for (const t of tables) {
    console.log(` - ${t.table_name}`);
  }
}

runSchema()
  .then(() => {
    console.log('Database initialization complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
