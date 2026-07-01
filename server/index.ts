import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { SecurityLayer } from "./infrastructure/security/SecurityLayer";
import { createServer as createViteServer } from "vite";
import apiRouter from "./api/routes";
import { logger } from "./services/LoggingEngine";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  const app = express();

  SecurityLayer.apply(app);

  // Increase body size limit for file content transfers
  app.use(express.json({ limit: process.env.EXPRESS_JSON_LIMIT || "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: process.env.EXPRESS_JSON_LIMIT || "2mb" }));

  // API Routes
  app.use("/api", apiRouter);

  // API error handler to prevent HTML responses
  app.use(
    "/api",
    (
      err: any,
      req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      logger.error("API Error:", err?.message || err);
      res.status(500).json({ error: err?.message || "Internal Server Error" });
    },
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
