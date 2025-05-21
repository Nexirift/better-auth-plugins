import type { BetterAuthClientPlugin } from "better-auth";
import type { vortex } from "./server";

export const vortexClient = () => {
  return {
    id: "vortex",
    $InferServerPlugin: {} as ReturnType<typeof vortex>,
    pathMethods: {
      "/vortex/create-violation": "POST",
      "/vortex/list-violations": "GET",
      "/vortex/update-violation": "POST",
    },
  } satisfies BetterAuthClientPlugin;
};
