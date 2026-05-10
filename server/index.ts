import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { connectToDatabase } from "./db";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ── ANSI color helpers (Vite-style) ──────────────────────────────────────────
const clr = {
  dim:    "\x1b[2m",
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  cyan:   "\x1b[36m",
  blue:   "\x1b[34m",
  magenta:"\x1b[35m",
};

function colorMethod(method: string) {
  const map: Record<string, string> = {
    GET:    clr.green,
    POST:   clr.blue,
    PUT:    clr.yellow,
    PATCH:  clr.cyan,
    DELETE: clr.red,
  };
  return (map[method] ?? clr.dim) + method.padEnd(6) + clr.reset;
}

function colorStatus(status: number) {
  if (status >= 500) return clr.red    + status + clr.reset;
  if (status >= 400) return clr.yellow + status + clr.reset;
  if (status >= 300) return clr.dim    + status + clr.reset;
  return clr.green + status + clr.reset;
}

// Routes too noisy to log every hit
const SKIP_LOG_PATHS = new Set([
  "/api/analytics/pageview",
]);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const tag = source === "express"
    ? `${clr.cyan}[express]${clr.reset}`
    : `${clr.dim}[${source}]${clr.reset}`;
  console.log(`${clr.dim}${formattedTime}${clr.reset} ${tag} ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    // Skip non-API paths, silenced routes, and 304 (not-modified — nothing changed)
    if (!path.startsWith("/api")) return;
    if (SKIP_LOG_PATHS.has(path)) return;
    if (res.statusCode === 304) return;

    const duration = Date.now() - start;
    const status   = colorStatus(res.statusCode);
    const method   = colorMethod(req.method);
    const durationStr = `${clr.dim}${duration}ms${clr.reset}`;
    log(`${method} ${path} ${status} ${durationStr}`);
  });

  next();
});

// Temporary healthcheck handler that responds 200 while app initializes
let appReady = false;
const healthcheckMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  if (!appReady && _req.path === "/") {
    return res.status(200).send("OK");
  }
  next();
};
app.use(healthcheckMiddleware);

// Start the server immediately so healthchecks work
const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    log(`serving on port ${port}`);
  },
);

// Initialize database and routes asynchronously after server starts
(async () => {
  try {
    await connectToDatabase();
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    appReady = true;
    log("Database and routes initialized successfully");
  } catch (error) {
    log(`Initialization error: ${error}`, "express");
    console.error("Failed to initialize application:", error);
  }
})();
