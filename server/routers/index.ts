/**
 * routers/index.ts
 * Root tRPC router — assembles all sub-routers.
 */

import { router } from "./trpc";
import { repRouter }              from "./rep";
import { commissionRouter }       from "./commission";
import { attributionRouter }      from "./attribution";
import { agentSelfRegRouter }     from "./agentSelfReg";
import { repUpgradeRouter }       from "./repUpgrade";
import { certificationRouter }    from "./certification";
import { agentVerificationRouter } from "./agentVerification";

export const appRouter = router({
  rep:               repRouter,
  commission:        commissionRouter,
  attribution:       attributionRouter,
  agentSelfReg:      agentSelfRegRouter,
  repUpgrade:        repUpgradeRouter,
  certification:     certificationRouter,
  agentVerification: agentVerificationRouter,
});

export type AppRouter = typeof appRouter;
