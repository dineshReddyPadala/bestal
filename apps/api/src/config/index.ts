import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    APP_NAME: z.string().default('bestal'),
    APP_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .default('info'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    COOKIE_SECRET: z.string().min(32),
    PASSWORD_RESET_EXPIRY: z.string().default('1h'),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    LOCAL_STORAGE_PATH: z.string().default('./uploads'),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    S3_PRESIGNED_URL_EXPIRY: z.coerce.number().int().positive().default(3600),
    CORS_ORIGINS: z.string().transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
    FROM_MAIL: z.string().email().optional(),
    FROM_MAIL_PASSWORD: z.string().optional(),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    WEB_APP_URL: z.string().url().default('http://localhost:5173'),
    AI_EXTRACTION_URL: z.string().url().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === 's3') {
      if (!env.AWS_REGION) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'AWS_REGION is required when STORAGE_DRIVER=s3',
          path: ['AWS_REGION'],
        });
      }
      if (!env.S3_BUCKET_NAME) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'S3_BUCKET_NAME is required when STORAGE_DRIVER=s3',
          path: ['S3_BUCKET_NAME'],
        });
      }
    }
  });

export type EnvSchema = z.infer<typeof envSchema>;

export interface AwsS3Config {
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  presignedUrlExpirySeconds: number;
}

export interface StorageConfig {
  driver: 'local' | 's3';
  localPath: string;
  aws?: AwsS3Config;
}

export interface MailConfig {
  from: string | null;
  password: string | null;
  host: string;
  port: number;
  enabled: boolean;
}

export interface AppConfig {
  nodeEnv: EnvSchema['NODE_ENV'];
  appName: string;
  appUrl: string;
  webAppUrl: string;
  port: number;
  logLevel: EnvSchema['LOG_LEVEL'];
  databaseUrl: string;
  jwt: {
    secret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  cookieSecret: string;
  passwordResetExpiry: string;
  storage: StorageConfig;
  corsOrigins: string[];
  mail: MailConfig;
  aiExtractionUrl: string | null;
  isProduction: boolean;
  isDevelopment: boolean;
}

function mapEnvToConfig(env: EnvSchema): AppConfig {
  const mailFrom = env.FROM_MAIL ?? null;
  const mailPassword = env.FROM_MAIL_PASSWORD ?? null;

  return {
    nodeEnv: env.NODE_ENV,
    appName: env.APP_NAME,
    appUrl: env.APP_URL,
    webAppUrl: env.WEB_APP_URL,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    jwt: {
      secret: env.JWT_SECRET,
      accessExpiry: env.JWT_ACCESS_EXPIRY,
      refreshExpiry: env.JWT_REFRESH_EXPIRY,
    },
    cookieSecret: env.COOKIE_SECRET,
    passwordResetExpiry: env.PASSWORD_RESET_EXPIRY,
    storage: {
      driver: env.STORAGE_DRIVER,
      localPath: env.LOCAL_STORAGE_PATH,
      ...(env.STORAGE_DRIVER === 's3' && env.AWS_REGION && env.S3_BUCKET_NAME
        ? {
            aws: {
              region: env.AWS_REGION,
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              bucket: env.S3_BUCKET_NAME,
              presignedUrlExpirySeconds: env.S3_PRESIGNED_URL_EXPIRY,
            },
          }
        : {}),
    },
    corsOrigins: env.CORS_ORIGINS,
    mail: {
      from: mailFrom,
      password: mailPassword,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      enabled: Boolean(mailFrom && mailPassword),
    },
    aiExtractionUrl: env.AI_EXTRACTION_URL ?? null,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
  };
}

export function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `${key}: ${errors?.join(', ')}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return mapEnvToConfig(parsed.data);
}
