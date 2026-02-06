import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  ORY_HYDRA_ADMIN_URL: z.string().min(1, 'ORY_HYDRA_ADMIN_URL is required'),
  ORY_HYDRA_ISSUER: z.string().min(1, 'ORY_HYDRA_ISSUER is required'),
  ORY_HYDRA_CLIENT_ID: z.string().min(1, 'ORY_HYDRA_CLIENT_ID is required'),
  ORY_HYDRA_CLIENT_SECRET: z.string().min(1, 'ORY_HYDRA_CLIENT_SECRET is required'),
  ORY_KRATOS_ADMIN_URL: z.string().min(1, 'ORY_KRATOS_ADMIN_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_URL: z.string().min(1, 'NEXTAUTH_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  ADMIN_EMAILS: z.string().transform((s) => s.split(',').map((e) => e.trim())),
});

const envValues = {
  NODE_ENV: process.env.NODE_ENV,
  ORY_HYDRA_ADMIN_URL: process.env.ORY_HYDRA_ADMIN_URL,
  ORY_HYDRA_ISSUER: process.env.ORY_HYDRA_ISSUER,
  ORY_HYDRA_CLIENT_ID: process.env.ORY_HYDRA_CLIENT_ID,
  ORY_HYDRA_CLIENT_SECRET: process.env.ORY_HYDRA_CLIENT_SECRET,
  ORY_KRATOS_ADMIN_URL: process.env.ORY_KRATOS_ADMIN_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || '',
};

const parsed = envSchema.safeParse(envValues);

logEnvSnapshot(Object.keys(envValues));

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');

  const tree = z.treeifyError(parsed.error);
  const issues = collectTreeErrors(tree);

  for (const issue of issues) {
    const topKey = issue.key.split('.')[0]; // in case you add nested objects later
    const rawValue = process.env[topKey as keyof NodeJS.ProcessEnv];

    console.error(`• ${topKey}`);
    console.error(`  value: ${redact(rawValue)}`);
    console.error(`  error: ${issue.messages.join(', ')}`);
    console.error('');
  }

  throw new Error('Invalid environment variables');
} else {
  process.env = {
    ...process.env,
    ...parsed.data,
  };
}

console.log('✅ Environment variables loaded\n');

function redact(v: unknown) {
  if (typeof v !== 'string' || v.length === 0) return '❌ MISSING';
  return `${v.slice(0, 5)}*****`;
}

function logEnvSnapshot(keys: readonly string[]) {
  console.log('🔐 Environment snapshot (redacted):');
  for (const key of keys) {
    const value = process.env[key as keyof NodeJS.ProcessEnv];
    console.log(`• ${key}: ${redact(value)}`);
  }
  console.log('');
}

function collectTreeErrors(
  node: any,
  path: string[] = [],
  out: Array<{ key: string; messages: string[] }> = [],
) {
  // node.errors is typically string[]
  if (Array.isArray(node?.errors) && node.errors.length > 0) {
    out.push({ key: path.join('.') || '(root)', messages: node.errors });
  }

  // node.properties is a map of child nodes
  const props = node?.properties;
  if (props && typeof props === 'object') {
    for (const [k, child] of Object.entries(props)) {
      collectTreeErrors(child, [...path, k], out);
    }
  }

  return out;
}
