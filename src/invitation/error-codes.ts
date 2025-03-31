/**
 * Error codes for the Invitation plugin
 * Organized by category for better maintainability
 */
export const INVITATION_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: "You must be logged in to create an invitation",
  MAX_INVITATIONS_REACHED:
    "You have reached the maximum limit of 3 invitations",

  // Invitation Creation & Validation
  INVITATION_FAILED: "Failed to create invitation. Please try again",
  INVITE_CODE_REQUIRED: "An invite code is required during the alpha stage",
  INVALID_INVITE_CODE:
    "The invitation code is invalid or has already been used",

  // User Updates
  UPDATE_USER_FAILED: "Unable to update user with invitation details",

  // Invitation Status
  INVITATION_ALREADY_USED:
    "This invitation has already been claimed by another user",
  PROCESS_FAILED: "Unable to process invitation. Please try again",
  INVITATION_NOT_FOUND: "The requested invitation could not be found",

  // Invitation Management
  REVOKE_UNAUTHORIZED: "You can only revoke invitations that you have created",
  REVOKE_FAILED: "Unable to revoke invitation. Please try again",
  INVITATION_ALREADY_USED_CANT_REVOKE:
    "This invitation has been claimed and cannot be revoked",

  // Retrieval Errors
  FETCH_INVITES_FAILED: "Unable to retrieve your invitations. Please try again",
  GET_INVITATION_FAILED:
    "Unable to retrieve invitation details. Please try again",
} as const;
