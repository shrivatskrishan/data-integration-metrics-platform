const DEFAULTS = { port: 3000, nodeEnv: 'development', logLevel: 'info' };
export const config = {
  port: Number(process.env.PORT ?? DEFAULTS.port),
  nodeEnv: process.env.NODE_ENV ?? DEFAULTS.nodeEnv,
  logLevel: process.env.LOG_LEVEL ?? DEFAULTS.logLevel,
  isProduction: (process.env.NODE_ENV ?? DEFAULTS.nodeEnv) === 'production',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    enabled: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
};