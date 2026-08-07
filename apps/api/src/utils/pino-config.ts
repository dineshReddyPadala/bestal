import type { AppConfig } from '../config/index.js';

type PinoTransportTarget = {
  target: string;
  options?: Record<string, unknown>;
  level?: string;
};

/**
 * Fastify/Pino logger options — writes to a log file by default.
 * Set LOG_CONSOLE=true to also mirror logs to the terminal (pretty-printed in dev).
 */
export function buildFastifyLoggerConfig(config: AppConfig): {
  level: AppConfig['logLevel'];
  transport?: { targets: PinoTransportTarget[] };
} {
  if (config.nodeEnv === 'test') {
    return { level: 'silent' as AppConfig['logLevel'] };
  }

  const targets: PinoTransportTarget[] = [
    {
      target: 'pino/file',
      options: {
        destination: config.logFile,
        mkdir: true,
      },
      level: config.logLevel,
    },
  ];

  if (config.logConsole) {
    targets.push({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: config.logLevel,
    });
  }

  return {
    level: config.logLevel,
    transport: { targets },
  };
}
