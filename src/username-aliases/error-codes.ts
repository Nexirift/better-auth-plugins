/**
 * Error codes for the Username Aliases plugin
 * Organized by category for better maintainability
 */
export const USERNAME_ALIASES_ERROR_CODES = {
  MAX_USERNAME_ALIASES_REACHED:
    "You have reached the maximum limit of username aliases",
  USERNAME_ALREADY_TAKEN_AS_ALIAS:
    "The username is already taken as an alias. Please try another.",
  USERNAME_ALIAS_ALREADY_TAKEN:
    "The username alias is already taken. Please try another.",
  USER_NOT_ALLOWED: "You are not allowed to have username aliases",
} as const;
