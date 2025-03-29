import type { BetterAuthClientPlugin } from "better-auth";
import type { invitation } from "./index";

export const invitationClient = () => {
  return {
    id: "invitation",
    $InferServerPlugin: {} as ReturnType<typeof invitation>,
    pathMethods: {
      "/invitation/create": "POST",
      "/invitation/get": "GET",
      "/invitation/my-invites": "GET",
      "/invitation/revoke": "POST",
    },
  } satisfies BetterAuthClientPlugin;
};
