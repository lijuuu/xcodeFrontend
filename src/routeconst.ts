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

  // BASE URL Routes
  BASEURL: "https://xservices.lijuu.me",                 // Production base URL for services
  BASEURLDEVELOPMENT: "http://localhost:8000",           // Development base URL for services

  // API Routes AuthUserAdminService
  HOME: "/api/v1",                                        // Base route for API versioning  //Health Check
  REGISTER: "/api/v1/auth/register",                     // User registration
  // Request Data: 
  // { 
  //   firstName: string, 
  //   lastName: string, 
  //   country: string, 
  //   role: string, 
  //   primaryLanguageID: string, 
  //   secondaryLanguageID: string[], 
  //   email: string, 
  //   authType: string, 
  //   password: string, 
  //   confirmPassword: string, 
  //   muteNotifications: boolean, 
  //   socials: { github?: string, twitter?: string, linkedin?: string } 
  // }

  LOGIN: "/api/v1/auth/login",                           // User login
  // Request Data: 
  // { 
  //   email: string, 
  //   password: string 
  // }

  TOKEN_REFRESH: "/api/v1/auth/token/refresh",          // Refresh JWT token
  // Request Data: 
  // { 
  //   refreshToken: string 
  // }

  VERIFY: "/api/v1/auth/verify",                         // Verify user with token
  // Query Params: 
  // { 
  //   userID: string, 
  //   token: string 
  // }

  OTP_RESEND: "/api/v1/auth/otp/resend",                 // Resend OTP for user verification
  // Query Params: 
  // { 
  //   userID: string 
  // }

  FORGOT_PASSWORD: "/api/v1/auth/password/forgot",      // Request password reset
  // Request Data: 
  // { 
  //   email: string 
  // }

  PROFILE: "/api/v1/users/profile",                       // Get user profile
  // No request data required, uses JWT for authentication

  ALL_USERS: "/api/v1/users/profile/all",                // Get all users (admin only)
  // No request data required, uses JWT for authentication

  UPDATE_PROFILE: "/api/v1/users/profile/update",        // Update user profile
  // Request Data: 
  // { 
  //   firstName: string, 
  //   lastName: string, 
  //   country: string, 
  //   role: string, 
  //   primaryLanguageID: string, 
  //   secondaryLanguageID: string[] 
  // }

  UPDATE_PROFILE_IMAGE: "/api/v1/users/profile/image",   // Update user profile image
  // Request Data: 
  // { 
  //   imageData: string // Base64 encoded image data 
  // }

  FOLLOW: "/api/v1/users/follow",                         // Follow a user
  // Request Data: 
  // { 
  //   userID: string // ID of the user to follow 
  // }

  UNFOLLOW: "/api/v1/users/unfollow",                     // Unfollow a user
  // Request Data: 
  // { 
  //   userID: string // ID of the user to unfollow 
  // }

  FOLLOWING: "/api/v1/users/follow/following",           // Get list of users being followed
  // No request data required, uses JWT for authentication

  FOLLOWERS: "/api/v1/users/followers",                   // Get list of followers
  // No request data required, uses JWT for authentication

  CHANGE_PASSWORD: "/api/v1/users/security/password/change", // Change user password
  // Request Data: 
  // { 
  //   oldPassword: string, 
  //   newPassword: string, 
  //   confirmPassword: string 
  // }

  SET_TWO_FACTOR_AUTH: "/api/v1/users/security/2fa",    // Enable/disable two-factor authentication
  // Request Data: 
  // { 
  //   enable: boolean // true to enable, false to disable 
  // }

  LOGOUT: "/api/v1/users/logout",                         // User logout
  // No request data required, uses JWT for authentication

  ADMIN_LOGIN: "/api/v1/admin/login",                     // Admin login
  // Request Data: 
  // { 
  //   email: string, 
  //   password: string 
  // }

  ADMIN_USERS: "/api/v1/admin/users",                     // Get all users (admin)
  // No request data required, uses JWT for authentication

  UPDATE_USER_ADMIN: "/api/v1/admin/users/update",       // Update user details (admin)
  // Request Data: 
  // { 
  //   userID: string, 
  //   updateData: { /* fields to update */ } 
  // }

  SOFT_DELETE_USER_ADMIN: "/api/v1/admin/users/soft-delete", // Soft delete a user (admin)
  // Request Data: 
  // { 
  //   userID: string 
  // }

  VERIFY_ADMIN_USER: "/api/v1/admin/users/verify",       // Verify a user (admin)
  // Request Data: 
  // { 
  //   userID: string 
  // }

  UNVERIFY_USER: "/api/v1/admin/users/unverify",         // Unverify a user (admin)
  // Request Data: 
  // { 
  //   userID: string 
  // }

  BLOCK_USER: "/api/v1/admin/users/block",               // Block a user (admin)
  // Request Data: 
  // { 
  //   userID: string 
  // }

  UNBLOCK_USER: "/api/v1/admin/users/unblock",           // Unblock a user (admin)
  // Request Data: 
  // { 
  //   userID: string 
  // }
};

export default ROUTES;

