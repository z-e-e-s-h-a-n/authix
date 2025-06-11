import dotenv from "dotenv";
dotenv.config();

export const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback)
    throw new Error(`Missing environment variable: ${key}`);
  return value || fallback!;
};

export const envConfig = {
  env: getEnv("NODE_ENV", "development"),
  jwt: {
    accessSecret: getEnv("JWT_ACCESS_SECRET"),
    refreshSecret: getEnv("JWT_REFRESH_SECRET"),
    accessExp: getEnv("ACCESS_TOKEN_EXP"),
    refreshExp: getEnv("REFRESH_TOKEN_EXP"),
  },
  google: {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
  },
  facebook: {
    clientId: getEnv("FACEBOOK_CLIENT_ID"),
    clientSecret: getEnv("FACEBOOK_CLIENT_SECRET"),
  },
  twilio: {
    accountSid: getEnv("TWILIO_ACCOUNT_SID"),
    authToken: getEnv("TWILIO_AUTH_TOKEN"),
    phone: getEnv("TWILIO_PHONE_NUMBER"),
  },
  nodemailer: {
    host: getEnv("EMAIL_HOST"),
    port: getEnv("EMAIL_PORT"),
    user: getEnv("EMAIL_USER"),
    pass: getEnv("EMAIL_PASS"),
    from: getEnv("EMAIL_FROM"),
  },
  ipStack: {
    apiKey: getEnv("IP_STACK_API_KEY"),
  },
  db: {
    uri: getEnv("DB_URI"),
  },
  app: {
    port: getEnv("APP_PORT", "5000"),
    endpoint: getEnv("APP_ENDPOINT"),
  },
  admin: {
    email: getEnv("ADMIN_EMAIL"),
    password: getEnv("ADMIN_PASSWORD"),
    name: getEnv("ADMIN_NAME"),
    orgName: getEnv("ADMIN_ORG_NAME"),
    projectName: getEnv("ADMIN_PROJECT_NAME"),
  },
};
