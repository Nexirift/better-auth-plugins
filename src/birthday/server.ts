import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import { BIRTHDAY_ERROR_CODES } from "./error-codes";
import { schema } from "./schema";

/**
 * Configuration options for the invitation plugin
 */
export interface BirthdayOptions {
  minimumAge?: number;
}

export const birthday = <O extends BirthdayOptions>(options?: O) => {
  const minimumAge = options?.minimumAge ?? 13;

  return {
    id: "birthday",
    schema,
    hooks: {
      before: [
        {
          matcher: (context) =>
            context.path === "/sign-up/email" ||
            context.path === "/update-user",
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.body?.birthday) {
              const birthday = new Date(ctx.body.birthday);
              const today = new Date();

              // Calculate age based only on date, not time
              const age = today.getFullYear() - birthday.getFullYear();
              const hasBirthdayOccurredThisYear =
                today.getMonth() > birthday.getMonth() ||
                (today.getMonth() === birthday.getMonth() &&
                  today.getDate() >= birthday.getDate());

              const adjustedAge = hasBirthdayOccurredThisYear ? age : age - 1;

              if (adjustedAge < minimumAge) {
                throw new APIError("BAD_REQUEST", {
                  message: BIRTHDAY_ERROR_CODES.MINIMUM_AGE_NOT_MET,
                });
              }
            } else {
              throw new APIError("BAD_REQUEST", {
                message: BIRTHDAY_ERROR_CODES.BIRTHDAY_REQUIRED,
              });
            }
          }),
        },
      ],
    },
    $ERROR_CODES: BIRTHDAY_ERROR_CODES,
  } satisfies BetterAuthPlugin;
};
