import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGoogleOAuthRoutes } from "./google-oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import { runDiagnostics } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  // If port is 0, let the OS choose
  if (startPort === 0) return 0;
  
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return startPort; // Fallback to startPort if none found in range, listen() will throw if busy
}

async function startServer() {
  console.log("Starting server...");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  
  // Basic health check for required env vars
  if (!ENV.databaseUrl) {
    console.warn("[Warning] DATABASE_URL is not set. Database features will be unavailable.");
  } else {
    // Run database diagnostics on startup
    runDiagnostics().catch(err => console.error("Diagnostics failed:", err));
  }
  
  if (!ENV.jwtSecret) {
    console.warn("[Warning] JWT_SECRET is not set. Authentication might fail.");
  }

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerGoogleOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Render provides PORT env var, which is usually 10000 or similar
  const preferredPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
  // Only search for ports in development
  const port = process.env.NODE_ENV === "development" 
    ? await findAvailablePort(preferredPort)
    : preferredPort;

  server.listen(port, "0.0.0.0", () => {
    const address = server.address();
    const actualPort = typeof address === "string" ? address : address?.port;
    console.log(`Server running on port ${actualPort} (NODE_ENV=${process.env.NODE_ENV})`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
