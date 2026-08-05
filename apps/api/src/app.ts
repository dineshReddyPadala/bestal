import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { AppConfig } from './config/index.js';
import { requestContext, requestLogger } from './middleware/request-context.middleware.js';
import { attachConfig } from './plugins/config.plugin.js';
import configPlugin from './plugins/config.plugin.js';
import prismaPlugin from './plugins/prisma.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import securityPlugin from './plugins/security.plugin.js';
import errorHandlerPlugin from './plugins/error-handler.plugin.js';
import multipartPlugin from './plugins/multipart.plugin.js';
import { registerRoutes } from './routes/index.js';
import { setRootLogger } from './utils/logger.js';
import { buildFastifyLoggerConfig } from './utils/pino-config.js';

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: buildFastifyLoggerConfig(config),
    trustProxy: config.isProduction,
    requestIdHeader: 'x-request-id',
    disableRequestLogging: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  attachConfig(app, config);
  setRootLogger(app.log);

  await app.register(configPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(securityPlugin);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);
  await app.register(multipartPlugin);
  await app.register(swaggerPlugin);

  app.addHook('onRequest', requestContext);
  app.addHook('onRequest', requestLogger);

  await registerRoutes(app);

  return app;
}
