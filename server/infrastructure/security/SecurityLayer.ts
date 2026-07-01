import { Application } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

export class SecurityLayer {
  public static apply(app: Application) {
    // Trust reverse proxy for correct IP
    app.set("trust proxy", 1);

    // Helmet for HTTP headers
    app.use(
      helmet({
        contentSecurityPolicy: false, // Disabled for dev/vite fallback
        crossOriginEmbedderPolicy: false,
      }),
    );

    // Strict limiter for heavy tasks (apply before general API limiter)
    const heavyLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100, // 100 AI executions per 15 min
      message: { error: "Too many AI executions, please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Rate Limiting
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per window
      message: { error: "Too many requests, please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply heavy limiter first for the specific execute endpoint
    app.use("/api/execute", heavyLimiter);
    app.use("/api", apiLimiter);

    // CORS
    app.use(cors());
  }
}
