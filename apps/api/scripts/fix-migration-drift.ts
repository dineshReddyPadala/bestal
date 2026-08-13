/**
 * One-off repair for staging DB migration drift on database "bestal".
 * Reads DATABASE_URL from .env and swaps the database name to TARGET_DB.
 *
 * Usage: tsx scripts/fix-migration-drift.ts [--dry-run]
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

const TARGET_DB = 'bestal';
const GHOST_MIGRATION = '20260807062524_n8n_workflows';
const FAILED_MIGRATION = '20260810085719_n8n';

const dryRun = process.argv.includes('--dry-run');
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

config();

function targetDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set in .env');
  const url = new URL(raw);
  url.pathname = `/${TARGET_DB}`;
  return url.toString();
}

function runPrisma(args: string): void {
  const env = { ...process.env, DATABASE_URL: targetDatabaseUrl() };
  console.log(`> prisma ${args}`);
  if (dryRun) return;
  execSync(`npx prisma ${args}`, {
    cwd: apiRoot,
    env,
    stdio: 'inherit',
    shell: true,
  });
}

async function tryBackup(): Promise<void> {
  console.log('=== Step 0: Backup (pg_dump) ===');
  try {
    execSync('pg_dump --version', { stdio: 'pipe' });
  } catch {
    console.warn('pg_dump not found — skipping backup. Take a manual backup if needed.');
    return;
  }

  const url = new URL(targetDatabaseUrl());
  const backupFile = path.join(
    apiRoot,
    `bestal-backup-${new Date().toISOString().slice(0, 10)}.dump`,
  );
  const pgPassword = decodeURIComponent(url.password);
  const cmd = [
    'pg_dump',
    `-h ${url.hostname}`,
    `-p ${url.port || '5432'}`,
    `-U ${decodeURIComponent(url.username)}`,
    `-d ${url.pathname.slice(1)}`,
    '-F c',
    `-f "${backupFile}"`,
  ].join(' ');

  console.log(`> ${cmd.replace(pgPassword, '***')}`);
  if (dryRun) return;

  execSync(cmd, {
    env: { ...process.env, PGPASSWORD: pgPassword },
    stdio: 'inherit',
    shell: true,
  });
  console.log(`Backup written to ${backupFile}`);
}

async function main() {
  const databaseUrl = targetDatabaseUrl();
  console.log(`Target database: ${TARGET_DB}`);
  console.log(`Dry run: ${dryRun}\n`);

  await tryBackup();

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    console.log('\n=== Current migration rows ===');
    const before = await prisma.$queryRaw<
      Array<{
        migration_name: string;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }>
    >`
      SELECT migration_name, finished_at, rolled_back_at
      FROM "_prisma_migrations"
      WHERE migration_name IN (${GHOST_MIGRATION}, ${FAILED_MIGRATION})
      ORDER BY migration_name
    `;
    if (before.length === 0) {
      console.log('No ghost/failed migration rows found.');
    } else {
      console.log(JSON.stringify(before, null, 2));
    }

    console.log('\n=== Step 1: Remove ghost migration record ===');
    if (dryRun) {
      console.log(`Would DELETE ghost migration '${GHOST_MIGRATION}'`);
    } else {
      const ghost = await prisma.$executeRaw`
        DELETE FROM "_prisma_migrations"
        WHERE migration_name = ${GHOST_MIGRATION}
      `;
      console.log(`Removed ${ghost} ghost row(s).`);
    }

    console.log('\n=== Step 2: Clear failed n8n migration row if unfinished ===');
    if (dryRun) {
      console.log(`Would DELETE unfinished row for '${FAILED_MIGRATION}' if present`);
    } else {
      const failed = await prisma.$executeRaw`
        DELETE FROM "_prisma_migrations"
        WHERE migration_name = ${FAILED_MIGRATION}
          AND finished_at IS NULL
      `;
      console.log(`Removed ${failed} failed row(s).`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Step 3: Mark n8n migration as applied ===');
  runPrisma(`migrate resolve --applied ${FAILED_MIGRATION}`);

  console.log('\n=== Step 4: Deploy pending migrations ===');
  runPrisma('migrate deploy');

  console.log('\n=== Step 5: Verify status ===');
  runPrisma('migrate status');

  console.log('\n=== Step 6: Regenerate Prisma client ===');
  if (!dryRun) {
    execSync('npm run prisma:generate', { cwd: apiRoot, stdio: 'inherit', shell: true });
  }

  console.log('\nDone. Restart the API process on the staging server.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
