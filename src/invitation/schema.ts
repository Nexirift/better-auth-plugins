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
