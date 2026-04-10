/**
 * trpc.ts
 * Thin tRPC hooks layer — no @trpc/react-query dependency.
 *
 * Uses the vanilla @trpc/client proxy + @tanstack/react-query directly.
 * Creates a recursive proxy that mirrors the createTRPCReact API:
 *   trpc.rep.me.useQuery()
 *   trpc.rep.login.useMutation({ onSuccess, onError })
 */

import {
  createTRPCProxyClient,
  httpBatchLink,
  type TRPCRequestOptions,
} from "@trpc/client";
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

// ─── Vanilla client (used server-side or for direct calls) ────────────────────
export const trpcClient = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch: (url, options) =>
        fetch(url as string, { ...(options as RequestInit), credentials: "include" }),
    }),
  ],
});

// ─── Proxy hook factory ───────────────────────────────────────────────────────
// Walks the path on the vanilla client and wraps in React Query hooks.

function buildProxy(path: string[]): any {
  return new Proxy(
    {},
    {
      get(_, key: string) {
        // useQuery — maps to tRPC query
        if (key === "useQuery") {
          return (input?: unknown, opts?: UseQueryOptions) => {
            const queryKey = [...path, input ?? null];
            return useQuery(
              queryKey,
              () => {
                let fn: any = trpcClient;
                for (const segment of path) fn = fn[segment];
                return fn.query(input);
              },
              opts as any
            );
          };
        }

        // useMutation — maps to tRPC mutation
        if (key === "useMutation") {
          return (opts?: UseMutationOptions<any, any, any>) => {
            return useMutation((input: unknown) => {
              let fn: any = trpcClient;
              for (const segment of path) fn = fn[segment];
              return fn.mutate(input);
            }, opts as any);
          };
        }

        // Recurse deeper into the path
        return buildProxy([...path, key]);
      },
    }
  );
}

// ─── Exported trpc object ─────────────────────────────────────────────────────
// Drop-in replacement for createTRPCReact<AppRouter>() result.
// No Provider needed — just wrap the app with QueryClientProvider.
export const trpc = buildProxy([]) as any;
