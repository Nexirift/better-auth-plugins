import type { AuthPluginSchema } from "better-auth";

export const schema = {
  user: {
    fields: {
      usernameAliases: {
        type: "string",
        required: false,
        unique: false,
        references: undefined,
      },
    },
  },
} satisfies AuthPluginSchema;
