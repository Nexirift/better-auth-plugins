import type { BetterAuthPlugin, User } from "better-auth";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import { schema } from "./schema";
import { USERNAME_ALIASES_ERROR_CODES } from "./error-codes";

/**
 * Configuration options for the username aliases plugin
 */
export interface UsernameAliasesOptions {
  maxUsernameAliases?: number;
  // eslint-disable-next-line autofix/no-unused-vars
  isUserAllowedToHaveAlias?: (user: User) => boolean | Promise<boolean>;
}

export const usernameAliases = <O extends UsernameAliasesOptions>(
  options?: O,
) => {
  const maxUsernameAliases = options?.maxUsernameAliases ?? 3;
  const isUserAllowedToHaveAlias =
    options?.isUserAllowedToHaveAlias ?? ((user) => user.id !== "1");
  return {
    id: "username-aliases",
    schema,
    hooks: {
      before: [
        {
          matcher: (context) =>
            context.path === "/sign-up/email" ||
            context.path === "/update-user",
          handler: createAuthMiddleware(async (ctx) => {
            const username = ctx.body.username?.toLowerCase();
            const usernameAliases = ctx.body.usernameAliases;

            if (!username && !usernameAliases) {
              return { context: ctx };
            }

            if (usernameAliases) {
              const session = await getSessionFromCtx(ctx);
              if (session?.user.id) {
                // Get existing aliases for the current user
                const currentUser = await ctx.context.adapter.findOne<
                  User & { usernameAliases: string[] }
                >({
                  model: "user",
                  where: [
                    {
                      field: "id",
                      operator: "eq",
                      value: session.user.id,
                    },
                  ],
                });

                if (
                  !currentUser ||
                  !(await isUserAllowedToHaveAlias(currentUser))
                ) {
                  throw new APIError("FORBIDDEN", {
                    message: USERNAME_ALIASES_ERROR_CODES.USER_NOT_ALLOWED,
                  });
                }

                const existingAliasCount =
                  currentUser?.usernameAliases?.length || 0;
                const newAliasCount = usernameAliases.length;

                if (existingAliasCount + newAliasCount > maxUsernameAliases) {
                  throw new APIError("UNPROCESSABLE_ENTITY", {
                    message:
                      USERNAME_ALIASES_ERROR_CODES.MAX_USERNAME_ALIASES_REACHED,
                  });
                }
              }
            }

            if (username) {
              const existing = await ctx.context.adapter.findOne<
                User & { usernameAliases: string[] }
              >({
                model: "user",
                where: [
                  {
                    field: "usernameAliases",
                    operator: "contains",
                    value: `"${username}"`,
                  },
                ],
              });

              if (existing) {
                throw new APIError("UNPROCESSABLE_ENTITY", {
                  message:
                    USERNAME_ALIASES_ERROR_CODES.USERNAME_ALREADY_TAKEN_AS_ALIAS,
                });
              }
            }

            if (usernameAliases) {
              const existing = await ctx.context.adapter.findOne<
                User & { usernameAliases: string[] }
              >({
                model: "user",
                where: [
                  {
                    field: "usernameAliases",
                    operator: "eq",
                    value: usernameAliases,
                  },
                ],
              });

              if (existing) {
                throw new APIError("UNPROCESSABLE_ENTITY", {
                  message:
                    USERNAME_ALIASES_ERROR_CODES.USERNAME_ALIAS_ALREADY_TAKEN,
                });
              }
            }

            return { context: ctx };
          }),
        },
      ],
    },
    $ERROR_CODES: USERNAME_ALIASES_ERROR_CODES,
  } satisfies BetterAuthPlugin;
};
