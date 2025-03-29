import type { BetterAuthClientPlugin } from "better-auth";
import type { birthday } from "./server";

type BirthdayPlugin = typeof birthday;

export const birthdayClient = () => {
  return {
    id: "birthday",
    $InferServerPlugin: {} as ReturnType<BirthdayPlugin>,
  } satisfies BetterAuthClientPlugin;
};
