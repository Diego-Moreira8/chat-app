import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não definida");
}

export const env = {
  port: process.env.PORT || "3000",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
};
