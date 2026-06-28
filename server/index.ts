import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { SecurityLayer } from "./infrastructure/security/SecurityLayer";
import { createServer as createViteServer } from "vite";
import apiRouter from "./api/routes";
import { logger } from "./services/LoggingEngine";

const PORT = 3000;

async function startServer() {
  const app = express();

  // Security Middleware
  SecurityLayer.apply(app);

  app.use(express.json());

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
      logger.error("API Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
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

startServer();
