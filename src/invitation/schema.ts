import type { AuthPluginSchema } from "better-auth";
import { generateId } from "better-auth";
import { z } from "zod";

export const invitationSchema = z.object({
  id: z.string().default(generateId).optional(),
  code: z.string(),
  creatorId: z.string(),
  userId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invitation = z.infer<typeof invitationSchema>;

export type InvitationWithCreator = Invitation & {
  creator: { name: string; image: string };
};

export const schema = {
  user: {
    fields: {
      invitation: {
        type: "string",
        required: false,
        unique: true,
        returned: true,
      },
    },
  },
  nexiriftInvitation: {
    fields: {
      code: {
        type: "string",
        required: true,
        unique: true,
      },
      creatorId: {
        type: "string",
        required: true,
        references: {
          model: "user",
          field: "id",
          onDelete: "cascade",
        },
      },
      userId: {
        type: "string",
        required: false,
        references: {
          model: "user",
          field: "id",
          onDelete: "cascade",
        },
      },
      createdAt: {
        type: "date",
        required: true,
      },
      updatedAt: {
        type: "date",
        required: true,
      },
    },
  },
} satisfies AuthPluginSchema;
