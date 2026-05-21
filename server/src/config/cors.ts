import { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (Insomnia, curl)
    if (!origin) return callback(null, true);

    if (env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
