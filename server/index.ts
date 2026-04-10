/**
 * server/index.ts
 * Express entry point — tRPC adapter + webhook routes.
 */

import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import session from "express-session";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./routers/trpc";
import { env } from "./env";
import { handleGhlWebhook }                                        from "./webhooks/ghl";
import { handleScale360Webhook, handleScale360PaymentWebhook, handleKickstartProvision } from "./webhooks/scale360";

const app = express();

// Trust Railway's reverse proxy so req.secure reflects HTTPS correctly.
// Without this, express-session never sets the cookie when secure:true.
app.set("trust proxy", 1);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin:      env.APP_BASE_URL,
  credentials: true,
}));

// Raw body for signature verification (webhook routes must be registered before json())
app.use("/api/scale360/kickstart", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "2mb" }));

app.use(
  session({
    secret:            env.SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    cookie: {
      secure:   env.APP_BASE_URL.startsWith("https"),
      httpOnly: true,
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// ─── Webhook Routes (Express — NOT tRPC) ──────────────────────────────────────

app.post("/api/ghl/webhook",                    handleGhlWebhook);
app.post("/api/scale360/webhook",               handleScale360Webhook);
app.post("/api/scale360/payment-webhook",       handleScale360PaymentWebhook);
app.post("/api/scale360/kickstart/provision",   handleKickstartProvision);

// ─── tRPC ─────────────────────────────────────────────────────────────────────

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router:     appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] Error on ${path}:`, error.message);
    },
  })
);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_, res) => res.json({ ok: true }));

// ─── Static (client build) ────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "client/dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(process.cwd(), "client/dist/index.html"));
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`Wibiz Partner Portal running on port ${env.PORT}`);
});

export type { AppRouter } from "./routers";
