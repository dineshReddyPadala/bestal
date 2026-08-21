import 'dotenv/config';
import type { FastifyInstance } from 'fastify';
import { loadConfig } from './config/index.js';
import { buildApp } from './app.js';
import { AdminRolesService } from './modules/admin/admin-roles.service.js';
import { CandidateImportService } from './modules/candidates/candidate-import.service.js';
import { LifecycleSchedulerService } from './services/lifecycle-scheduler.service.js';

function reportFatalStartupError(phase: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const code = 'code' in err ? String(err.code) : undefined;
  const lines = ['', `[bestal-api] Failed during ${phase}`, err.message];

  if (code === 'EADDRINUSE') {
    lines.push(
      '',
      'Another process is already using the API port.',
      'Stop the existing API/debug session, or free the port in PowerShell:',
      'Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }',
    );
  }

  if (err.stack) {
    lines.push('', err.stack);
  }

  console.error(lines.join('\n'));
}

async function start() {
  let app: FastifyInstance | undefined;
  let lifecycle: LifecycleSchedulerService | undefined;

  try {
    const config = loadConfig();
    app = await buildApp(config);
    lifecycle = new LifecycleSchedulerService(app);

    const shutdown = async (signal: string) => {
      app!.log.info({ signal }, 'Received shutdown signal');
      try {
        lifecycle?.stop();
        await app!.close();
        process.exit(0);
      } catch (error) {
        app!.log.error({ err: error }, 'Error during shutdown');
        reportFatalStartupError('shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));

    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(
      { port: config.port, env: config.nodeEnv, docs: `${config.appUrl}/docs` },
      `${config.appName} API server started`,
    );

    const importService = new CandidateImportService(app);
    void importService.reclaimOrphanedBatches().catch((error) => {
      app!.log.error({ err: error }, 'Failed to reclaim orphaned import batches');
    });

    const rolesService = new AdminRolesService(app);
    void rolesService.ensureSystemRolesSeeded().catch((error) => {
      app!.log.error({ err: error }, 'Failed to ensure system roles / CLIENT deploy permission');
    });

    lifecycle.start();
    app.log.info('Lifecycle scheduler started (deployments/trials/reminders)');
  } catch (error) {
    app?.log.error({ err: error }, 'Failed to start server');
    reportFatalStartupError(app ? 'server startup' : 'application bootstrap', error);
    process.exit(1);
  }
}

start().catch((error) => {
  reportFatalStartupError('uncaught startup', error);
  process.exit(1);
});
