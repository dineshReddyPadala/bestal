import type { FastifyBaseLogger } from 'fastify';

let rootLogger: FastifyBaseLogger | null = null;

export function setRootLogger(logger: FastifyBaseLogger): void {
  rootLogger = logger;
}

export function getLogger(context?: Record<string, unknown>): FastifyBaseLogger {
  if (!rootLogger) {
    throw new Error('Logger not initialized. Call setRootLogger first.');
  }

  return context ? rootLogger.child(context) : rootLogger;
}

export function createModuleLogger(module: string): FastifyBaseLogger {
  return getLogger({ module });
}
