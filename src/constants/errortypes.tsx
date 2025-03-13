export const errorMessages = {
  // RegisterUser errors
  ERR_REG_PASSWORD_MISMATCH: "Passwords do not match.",
  ERR_REG_INVALID_EMAIL: "Invalid email format.",
  ERR_REG_INVALID_PASSWORD: "Password does not meet requirements.",
  ERR_REG_CREATION_FAILED: "Failed to create account. Please try again.",

  // LoginUser errors
  ERR_LOGIN_CRED_CHECK_FAILED: "Error checking credentials. Try again.",
  ERR_LOGIN_USER_NOT_FOUND: "User not found. Please register.",
  ERR_LOGIN_BAN_CHECK_FAILED: "Failed to verify account status.",
  ERR_LOGIN_ACCOUNT_BANNED: "Your account has been banned.",
  ERR_LOGIN_CRED_WRONG: "Incorrect email or password.",
  ERR_LOGIN_2FA_CHECK_FAILED: "Error verifying 2FA. Try again.",
  ERR_LOGIN_2FA_CODE_INVALID: "Invalid 2FA code.",
  ERR_LOGIN_NOT_VERIFIED: "Your account is not verified. Verify your email.",
  ERR_LOGIN_TOKEN_GEN_FAILED: "Failed to generate login token.",

  // LoginAdmin errors
  ERR_ADMIN_LOGIN_CRED_CHECK_FAILED: "Admin credentials check failed.",
  ERR_ADMIN_LOGIN_NOT_FOUND: "Admin account not found.",
  ERR_ADMIN_LOGIN_NO_PRIVILEGES: "You do not have admin privileges.",
  ERR_ADMIN_LOGIN_CRED_WRONG: "Incorrect admin credentials.",
  ERR_ADMIN_LOGIN_NOT_VERIFIED: "Admin account not verified.",
  ERR_ADMIN_LOGIN_TOKEN_FAILED: "Failed to generate admin login token.",

  // TokenRefresh errors
  ERR_TOKEN_REFRESH_INVALID: "Invalid refresh token.",
  ERR_TOKEN_REFRESH_FAILED: "Failed to refresh token. Login again.",

  // ResendEmailVerification errors
  ERR_EMAIL_RESEND_FAILED: "Failed to resend verification email.",

  // VerifyUser errors
  ERR_VERIFY_CHECK_FAILED: "Verification check failed.",
  ERR_VERIFY_TOKEN_INVALID: "Invalid verification token.",

  // ForgotPassword errors
  ERR_PW_FORGOT_INVALID_EMAIL: "Email not registered.",
  ERR_PW_FORGOT_INIT_FAILED: "Password reset request failed.",

  // FinishForgotPassword errors
  ERR_PW_RESET_MISMATCH: "Passwords do not match.",
  ERR_PW_RESET_INVALID_PASSWORD: "New password does not meet requirements.",

  // ChangePassword errors
  ERR_PW_CHANGE_MISMATCH: "Old and new passwords do not match.",
  ERR_PW_CHANGE_INVALID_PASSWORD: "Invalid new password format.",

  // UpdateProfile errors
  ERR_PROFILE_UPDATE_FAILED: "Profile update failed. Try again.",

  // UpdateProfileImage errors
  ERR_PROFILE_IMAGE_UPDATE_FAILED: "Profile image update failed.",

  // CheckBanStatus errors
  ERR_BAN_STATUS_CHECK_FAILED: "Error checking ban status.",
  ERR_BAN_STATUS_NOT_FOUND: "Ban status not found.",

  // FollowUser errors
  ERR_FOLLOW_ACTION_FAILED: "Failed to follow user.",

  // UnfollowUser errors
  ERR_UNFOLLOW_ACTION_FAILED: "Failed to unfollow user.",

  // GetFollowing errors
  ERR_FOLLOWING_LIST_FAILED: "Failed to fetch following list.",

  // GetFollowers errors
  ERR_FOLLOWERS_LIST_FAILED: "Failed to fetch followers list.",

  // CreateUserAdmin errors
  ERR_ADMIN_CREATE_PASSWORD_MISMATCH: "Passwords do not match.",
  ERR_ADMIN_CREATE_INVALID_EMAIL: "Invalid admin email format.",
  ERR_ADMIN_CREATE_INVALID_PASSWORD: "Admin password requirements not met.",
  ERR_ADMIN_CREATE_FAILED: "Failed to create admin account.",

  // UpdateUserAdmin errors
  ERR_ADMIN_UPDATE_CHECK_FAILED: "Error updating admin details.",
  ERR_ADMIN_UPDATE_NO_PRIVILEGES: "You do not have the necessary privileges.",
  ERR_ADMIN_UPDATE_INVALID_PASSWORD: "Invalid password format.",
  ERR_ADMIN_UPDATE_FAILED: "Failed to update admin details.",

  // BanUser errors
  ERR_BAN_USER_FAILED: "Failed to ban user.",

  // UnbanUser errors
  ERR_UNBAN_USER_FAILED: "Failed to unban user.",

  // VerifyAdminUser errors
  ERR_ADMIN_VERIFY_FAILED: "Admin verification failed.",

  // UnverifyUser errors
  ERR_ADMIN_UNVERIFY_FAILED: "Admin unverification failed.",

  // SoftDeleteUserAdmin errors
  ERR_ADMIN_DELETE_CHECK_FAILED: "Error checking delete permissions.",
  ERR_ADMIN_DELETE_NO_PRIVILEGES: "You do not have delete privileges.",
  ERR_ADMIN_DELETE_FAILED: "Failed to delete admin account.",

  // GetAllUsers errors
  ERR_USERS_LIST_FAILED: "Failed to fetch user list.",

  // BanHistory errors
  ERR_BAN_HISTORY_FAILED: "Failed to retrieve ban history.",

  // SearchUsers errors
  ERR_USERS_SEARCH_FAILED: "User search failed.",

  // SetUpTwoFactorAuth errors
  ERR_2FA_SETUP_FAILED: "Failed to enable 2FA.",

  // DisableTwoFactorAuth errors
  ERR_2FA_DISABLE_CHECK_FAILED: "Error disabling 2FA.",
  ERR_2FA_DISABLE_CRED_WRONG: "Incorrect password for 2FA disable.",
  ERR_2FA_DISABLE_FAILED: "Failed to disable 2FA.",

  // GetTwoFactorAuthStatus errors
  ERR_2FA_STATUS_CHECK_FAILED: "Failed to check 2FA status.",

  // Repository-specific errors
  ERR_PARAM_EMPTY: "Missing required parameters.",
  ERR_USER_NOT_FOUND: "User does not exist.",
  ERR_CRED_CHECK_FAILED: "Error validating credentials.",
  ERR_CRED_WRONG: "Incorrect credentials.",
  ERR_ADMIN_NOT_CONFIGURED: "Admin settings not configured.",
  ERR_PROFILE_NOT_FOUND: "Profile not found.",
  ERR_BAN_UPDATE_FAILED: "Failed to update ban status.",
  ERR_2FA_ALREADY_ENABLED: "2FA is already enabled.",
  ERR_2FA_NOT_ENABLED: "2FA is not enabled.",
  ERR_2FA_CODE_INVALID: "Invalid 2FA code.",
  ERR_VERIFICATION_ALREADY_EXISTS: "Verification request already sent.",
  ERR_ALREADY_VERIFIED: "User is already verified.",
  ERR_TOKEN_CREATION_FAILED: "Failed to create token.",
  ERR_TOKEN_VERIFICATION_FAILED: "Token verification failed.",
  ERR_PASSWORD_HASH_FAILED: "Failed to hash password.",
  ERR_NO_EXISTING_PASSWORD: "No existing password found.",
};
