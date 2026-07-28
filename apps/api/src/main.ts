import 'dotenv/config';
import { loadConfig } from './config/index.js';
import { buildApp } from './app.js';
import { CandidateImportService } from './modules/candidates/candidate-import.service.js';

async function start() {
  const config = loadConfig();
  const app = await buildApp(config);

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Received shutdown signal');
    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(
      { port: config.port, env: config.nodeEnv, docs: `${config.appUrl}/docs` },
      `${config.appName} API server started`,
    );

    const importService = new CandidateImportService(app);
    void importService.reclaimOrphanedBatches().catch((error) => {
      app.log.error({ err: error }, 'Failed to reclaim orphaned import batches');
    });
  } catch (error) {
    app.log.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
