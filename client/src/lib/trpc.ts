/**
 * client/src/lib/trpc.ts
 * tRPC client setup.
 *
 * AppRouter type is imported as a type-only import — erased at build time.
 * Rollup never bundles server code; only the type shape is used for inference.
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers/index";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        fetch: (url, options) =>
          fetch(url, { ...options, credentials: "include" }),
      }),
    ],
  });
}
