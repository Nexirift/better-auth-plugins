import type {
  BetterAuthPlugin,
  GenericEndpointContext,
  User,
} from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  getSessionFromCtx,
} from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import { z } from "zod";
import type { Invitation } from "./schema";
import { schema } from "./schema";
import { INVITATION_ERROR_CODES } from "./error-codes";

export const generateInviteCode = () =>
  `nexirift-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * Configuration options for the invitation plugin
 */
export interface InvitationOptions {
  bypassCode?: string;
  maxInvitations?: number;
  schema?: {
    invitation?: {
      modelName: string;
    };
  };
}

export const invitation = <O extends InvitationOptions>(options?: O) => {
  const maxInvitations = options?.maxInvitations ?? 3;

  const validateSession = async (ctx: GenericEndpointContext) => {
    const session = await getSessionFromCtx(ctx);
    if (!session?.user) {
      throw new APIError("UNAUTHORIZED", {
        message: INVITATION_ERROR_CODES.UNAUTHORIZED,
      });
    }
    return session.user;
  };

  return {
    id: "invitation",
    schema,
    endpoints: {
      create: createAuthEndpoint(
        "/invitation/create",
        {
          method: "POST",
          metadata: {
            openapi: {
              summary: "Create invitation",
              description: "Create a new invitation code",
              responses: {
                200: {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          invitation: {
                            $ref: "#/components/schemas/Invitation",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const user = await validateSession(ctx);

          const invitations = await ctx.context.adapter.findMany<Invitation>({
            model: "invitation",
            where: [
              {
                field: "creatorId",
                operator: "eq",
                value: user.id,
              },
            ],
          });

          if (invitations.length >= maxInvitations) {
            throw new APIError("FORBIDDEN", {
              message: INVITATION_ERROR_CODES.MAX_INVITATIONS_REACHED,
            });
          }

          const now = new Date();
          const invitation = await ctx.context.adapter.create<Invitation>({
            model: "invitation",
            data: {
              code: generateInviteCode(),
              creatorId: user.id,
              createdAt: now,
              updatedAt: now,
            },
          });

          if (!invitation) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: INVITATION_ERROR_CODES.INVITATION_FAILED,
            });
          }

          return ctx.json({ invitation });
        },
      ),
      get: createAuthEndpoint(
        "/invitation/get",
        {
          method: "GET",
          query: z.object({
            invitationId: z.string().min(1).max(255),
          }),
          metadata: {
            openapi: {
              summary: "Get invitation",
              description: "Get details of a specific invitation",
              parameters: [
                {
                  name: "invitationId",
                  in: "query",
                  required: true,
                  schema: {
                    type: "string",
                  },
                  description: "ID of the invitation to retrieve",
                },
              ],
              responses: {
                200: {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          invitation: {
                            $ref: "#/components/schemas/Invitation",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const { invitationId } = ctx.query;

          try {
            let invitation = await ctx.context.adapter.findOne<Invitation>({
              model: "invitation",
              where: [{ field: "code", operator: "eq", value: invitationId }],
            });

            if (!invitation) {
              invitation = await ctx.context.adapter.findOne<Invitation>({
                model: "invitation",
                where: [{ field: "id", operator: "eq", value: invitationId }],
              });
            }

            if (!invitation) {
              throw new APIError("NOT_FOUND", {
                message: INVITATION_ERROR_CODES.INVITATION_NOT_FOUND,
              });
            }

            const creator = await ctx.context.adapter.findOne<User>({
              model: "user",
              where: [
                { field: "id", operator: "eq", value: invitation.creatorId },
              ],
            });

            if (!creator) {
              throw new APIError("NOT_FOUND", {
                message: INVITATION_ERROR_CODES.INVITATION_NOT_FOUND,
              });
            }

            return ctx.json({
              invitation: {
                ...invitation,
                creator: { name: creator.name, image: creator.image },
              },
            });
          } catch (error) {
            if (!(error instanceof APIError)) {
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: INVITATION_ERROR_CODES.GET_INVITATION_FAILED,
                cause: error,
              });
            }
            throw error;
          }
        },
      ),
      getUserInvitations: createAuthEndpoint(
        "/invitation/my-invites",
        {
          method: "GET",
          metadata: {
            openapi: {
              summary: "Get user invitations",
              description:
                "Retrieve all invitations created by the current user",
              responses: {
                200: {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          invitations: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/Invitation",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const user = await validateSession(ctx);

          try {
            const invitations = await ctx.context.adapter.findMany<Invitation>({
              model: "invitation",
              where: [
                {
                  field: "creatorId",
                  operator: "eq",
                  value: user.id,
                },
              ],
            });

            return ctx.json({ invitations });
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: INVITATION_ERROR_CODES.FETCH_INVITES_FAILED,
              cause: error,
            });
          }
        },
      ),
      revokeInvitation: createAuthEndpoint(
        "/invitation/revoke",
        {
          method: "POST",
          body: z.object({
            invitationId: z.string().min(1).max(255),
          }),
          metadata: {
            openapi: {
              summary: "Revoke invitation",
              description: "Revoke an unused invitation code that you created",
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        invitationId: {
                          type: "string",
                          description: "ID of the invitation to revoke",
                        },
                      },
                      required: ["invitationId"],
                    },
                  },
                },
              },
              responses: {
                200: {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          success: {
                            type: "boolean",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          // const user = await validateSession(ctx);
          const { invitationId } = ctx.body;

          const invitation = await ctx.context.adapter.findOne<Invitation>({
            model: "invitation",
            where: [{ field: "id", operator: "eq", value: invitationId }],
          });

          if (!invitation) {
            throw new APIError("NOT_FOUND", {
              message: INVITATION_ERROR_CODES.INVITATION_NOT_FOUND,
            });
          }

          // if (invitation.creatorId !== user.id) {
          //   throw new APIError("FORBIDDEN", {
          //     message: INVITATION_ERROR_CODES.REVOKE_UNAUTHORIZED,
          //   });
          // }

          if (invitation.userId) {
            throw new APIError("BAD_REQUEST", {
              message:
                INVITATION_ERROR_CODES.INVITATION_ALREADY_USED_CANT_REVOKE,
            });
          }

          await ctx.context.adapter.delete({
            model: "invitation",
            where: [{ field: "id", operator: "eq", value: invitationId }],
          });

          const stillExists = await ctx.context.adapter.findOne<Invitation>({
            model: "invitation",
            where: [{ field: "id", operator: "eq", value: invitationId }],
          });

          if (stillExists) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: INVITATION_ERROR_CODES.REVOKE_FAILED,
            });
          }

          return ctx.json({ success: true });
        },
      ),
    },
    hooks: {
      before: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.body.invitation === options?.bypassCode) {
              // we bypass the invitation code
              return { context: ctx };
            }

            try {
              if (!ctx.body?.invitation) {
                throw new APIError("BAD_REQUEST", {
                  message: INVITATION_ERROR_CODES.INVITE_CODE_REQUIRED,
                });
              }

              const inviteCode = ctx.body.invitation.trim();
              const invitation = await ctx.context.adapter.findOne<Invitation>({
                model: "invitation",
                where: [{ field: "code", operator: "eq", value: inviteCode }],
              });

              if (!invitation || invitation.userId) {
                throw new APIError("BAD_REQUEST", {
                  message: INVITATION_ERROR_CODES.INVALID_INVITE_CODE,
                });
              }

              ctx.body.fullInvitation = invitation;
              return { context: ctx };
            } catch (error) {
              if (!(error instanceof APIError)) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: INVITATION_ERROR_CODES.PROCESS_FAILED,
                  cause: error,
                });
              }
              throw error;
            }
          }),
        },
      ],
      after: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.body.invitation === options?.bypassCode) {
              // we bypass the invitation code
              return { context: ctx };
            }

            try {
              const { email, fullInvitation } = ctx.body;
              const invitationId = fullInvitation.id;

              const user = await ctx.context.adapter.update<User>({
                model: "user",
                where: [{ field: "email", operator: "eq", value: email }],
                update: {
                  invitation: invitationId,
                },
              });

              if (!user) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: INVITATION_ERROR_CODES.UPDATE_USER_FAILED,
                });
              }

              const invitation = await ctx.context.adapter.update<Invitation>({
                model: "invitation",
                where: [{ field: "id", operator: "eq", value: invitationId }],
                update: {
                  userId: user.id,
                  updatedAt: new Date(),
                },
              });

              if (!invitation) {
                throw new APIError("CONFLICT", {
                  message: INVITATION_ERROR_CODES.INVITATION_ALREADY_USED,
                });
              }
            } catch (error) {
              if (!(error instanceof APIError)) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: INVITATION_ERROR_CODES.PROCESS_FAILED,
                  cause: error,
                });
              }
              throw error;
            }
          }),
        },
      ],
    },
    $ERROR_CODES: INVITATION_ERROR_CODES,
  } satisfies BetterAuthPlugin;
};
