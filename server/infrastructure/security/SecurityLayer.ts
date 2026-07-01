import { Application } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

export class SecurityLayer {
  public static apply(app: Application) {
    // Trust reverse proxy only if explicitly configured
    const trustProxy = process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true";
    if (trustProxy) app.set("trust proxy", 1);

    app.use(helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
    }));

    // General API rate limiter
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_API) || 1000,
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Heavy operations limiter (AI executions) - attach to messages endpoint
    const heavyLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_AI) || 100,
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use("/api", apiLimiter);
    // apply heavyLimiter on the route that triggers orchestrator
    app.use("/api/conversations/:conversationId/messages", heavyLimiter);

    // CORS: restrict in production using env var CORS_ORIGIN, fallback to allow all in dev
    const corsOrigin = process.env.CORS_ORIGIN;
    app.use(cors(corsOrigin ? { origin: corsOrigin, credentials: true } : undefined));
  }
}
