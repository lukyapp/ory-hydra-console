declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    ORY_HYDRA_ADMIN_URL: string;
    ORY_HYDRA_ISSUER: string;
    ORY_HYDRA_CLIENT_ID: string;
    ORY_HYDRA_CLIENT_SECRET: string;
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    ADMIN_EMAILS: string[];
  }
}
