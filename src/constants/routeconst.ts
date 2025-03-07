/**
 * ROUTES - A collection of API endpoints for the application.
 *
 * This object contains the base URLs for production and development environments,
 * as well as the specific API routes for user authentication, profile management,
 * and admin operations.
 */
const ROUTES = {
  // Compiler Routes
  COMPILERPRODUCTION: "https://xengine.lijuu.me/execute", // Production endpoint for the compiler service
  COMPILERDEVELOPMENT: "http://localhost:8000/execute",   // Development endpoint for the compiler service

  // Base URL Routes
  BASEURL: "https://xservices.lijuu.me",                 // Production base URL for services
  BASEURLDEVELOPMENT: "http://localhost:7000",           // Development base URL for services

  // API Routes AuthUserAdminService
  HOME: "/api/v1",                                       // Base route for API versioning (Health Check)
  
  // Public Auth Routes
  REGISTER: "/api/v1/auth/register",                     // User registration (POST)
  // Request Data (JSON): { firstName, lastName, email, authType, password, confirmPassword }

  LOGIN: "/api/v1/auth/login",                           // User login (POST)
  // Request Data (JSON): { email, password }

  TOKEN_REFRESH: "/api/v1/auth/token/refresh",           // Refresh JWT token (POST)
  // Request Data (JSON): { refreshToken }

  VERIFY: "/api/v1/auth/verify",                         // Verify user with token (GET)
  // Query Params: ?email=<email>&token=<token>

  OTP_RESEND: "/api/v1/auth/verify/resend",              // Resend OTP for user verification (GET)
  // Query Params: ?email=<email>

  FORGOT_PASSWORD: "/api/v1/auth/password/forgot",       // Request password reset (GET)
  // Query Params: ?email=<email>

  FINISH_FORGOT_PASSWORD: "/api/v1/auth/password/reset", // Reset password (POST)
  // Request Data (JSON): { userID, token, newPassword, confirmPassword }

  // Protected User Routes (JWT + USER role required)
  PROFILE: "/api/v1/users/profile",                      // Get user profile (GET)
  // No request data, uses JWT

  UPDATE_PROFILE: "/api/v1/users/profile/update",        // Update user profile (PUT)
  // Request Data (JSON): { userID, firstName, lastName, country, primaryLanguageID, muteNotifications, socials: { github, twitter, linkedin } }

  UPDATE_PROFILE_IMAGE: "/api/v1/users/profile/image",   // Update user profile image (PATCH)
  // Request Data (JSON): { userID, avatarURL }

  BAN_HISTORY: "/api/v1/users/profile/ban-history",      // Get user ban history (GET)
  // No request data, uses JWT for userID

  FOLLOW: "/api/v1/users/follow",                        // Follow a user (POST)
  // Query Params: ?followUserID=<uuid> (followerID from JWT)

  UNFOLLOW: "/api/v1/users/follow",                      // Unfollow a user (DELETE)
  // Query Params: ?unfollowUserID=<uuid> (followerID from JWT)

  FOLLOWING: "/api/v1/users/follow/following",           // Get list of users being followed (GET)
  // Query Params: ?userID=<uuid> (optional, defaults to authenticated user)

  FOLLOWERS: "/api/v1/users/followers",                  // Get list of followers (GET)
  // Query Params: ?userID=<uuid> (optional, defaults to authenticated user)

  CHANGE_PASSWORD: "/api/v1/users/security/password/change", // Change user password (POST)
  // Request Data (JSON): { userID, oldPassword, newPassword, confirmPassword }

  SET_TWO_FACTOR_AUTH: "/api/v1/users/security/2fa",     // Enable/disable two-factor authentication (POST)
  // Request Data (JSON): { userID, twoFactorAuth: boolean }

  LOGOUT: "/api/v1/users/logout",                        // User logout (POST)
  // Request Data (JSON): { userID }

  SEARCH_USERS: "/api/v1/users/search",                  // Search users (GET)
  // Query Params: ?query=<string>&pageToken=<string>&limit=<number>

  // Admin Routes
  ADMIN_LOGIN: "/api/v1/admin/login",                    // Admin login (POST)
  // Request Data (JSON): { email, password }

  ADMIN_USERS: "/api/v1/admin/users",                    // Get all users (admin) (GET)
  // Query Params: ?pageToken=<string>&limit=<number>&roleFilter=<string>&statusFilter=<string>

  CREATE_USER_ADMIN: "/api/v1/admin/users",              // Create user (admin) (POST)
  // Request Data (JSON): { firstName, lastName, role, email, authType, password, confirmPassword }

  UPDATE_USER_ADMIN: "/api/v1/admin/users/update",       // Update user details (admin) (PUT)
  // Query Params: ?userID=<uuid>
  // Request Data (JSON): { firstName, lastName, country, role, email, password, primaryLanguageID, muteNotifications, socials }

  SOFT_DELETE_USER_ADMIN: "/api/v1/admin/users/soft-delete", // Soft delete a user (admin) (DELETE)
  // Query Params: ?userID=<uuid>

  VERIFY_ADMIN_USER: "/api/v1/admin/users/verify",       // Verify a user (admin) (POST)
  // Query Params: ?userID=<uuid>

  UNVERIFY_USER: "/api/v1/admin/users/unverify",         // Unverify a user (admin) (POST)
  // Query Params: ?userID=<uuid>

  BAN_USER: "/api/v1/admin/users/ban",                   // Ban a user (admin) (POST)
  // Request Data (JSON): { userID, banType, banReason, banExpiry }

  UNBAN_USER: "/api/v1/admin/users/unban",               // Unban a user (admin) (POST)
  // Query Params: ?userID=<uuid>

  ADMIN_BAN_HISTORY: "/api/v1/admin/users/ban-history",  // Get user ban history (admin) (GET)
  // Query Params: ?userID=<uuid>
};

export default ROUTES;