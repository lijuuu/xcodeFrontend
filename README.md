
---

# XcodeFrontend 🚀  

XcodeFrontend is the web client for **Xcode**, a competitive coding platform. Built with modern frontend technologies, it delivers a **fast, responsive, and seamless** user experience for coding challenges.  

## 🔥 Tech Stack  
- **React** – Component-based UI  
- **TypeScript** – Type-safe development  
- **Vite** – Lightning-fast builds  
- **Tailwind CSS** – Utility-first styling  
- **ShadCN** – Elegant, accessible UI components  

## ⚡ Features  
✅ **Fast & Optimized** – Vite ensures near-instant HMR  
✅ **Modern UI** – Built with Tailwind & ShadCN  
✅ **Scalable & Maintainable** – TypeScript + Modular Architecture  
✅ **Responsive** – Fully mobile-friendly  

## 🚀 Getting Started  

```bash
# Clone the repo
git clone https://github.com/yourusername/XcodeFrontend.git

# Navigate to project
cd XcodeFrontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
---

| **Endpoint**                             | **Method** | **Auth** | **Data Needed**                                                               | **Notes**                   | **Done** |
| ---------------------------------------- | ---------- | -------- | ----------------------------------------------------------------------------- | --------------------------- | -------- |
| `/api/v1/auth/register`                  | POST       | None     | JSON: `firstName`, `lastName`, `email`, `password`, `confirmPassword`, `authType`, `muteNotifications`, `socials`, `twoFactorAuth` <br> Optional: `country`, `role`, `primaryLanguageID` | Socials: At least one required | no      |
| `/api/v1/auth/login`                     | POST       | None     | JSON: `email`, `password`                                                     | RefreshToken: 30 days       | no      |
| `/api/v1/auth/token/refresh`             | POST       | None     | JSON: `refreshToken`                                                          | AccessToken: 7 days         | no      |
| `/api/v1/auth/verify`                    | GET        | None     | Query: `email`, `token`                                                       |                             | no      |
| `/api/v1/auth/otp/resend`                | GET        | None     | Query: `userID`                                                               |                             | no      |
| `/api/v1/auth/password/forgot`           | GET        | None     | Query: `email`                                                                |                             | no       |
| `/api/v1/auth/password/reset`            | POST       | None     | JSON: `userID`, `token`, `newPassword`, `confirmPassword`                     |                             | no       |
| `/api/v1/users/profile`                  | GET        | JWT      | None (userID from JWT)                                                        | UserID typically from JWT   | no      |
| `/api/v1/users/profile/update`           | PUT        | JWT      | JSON: `userID`, Optionally: `firstName`, `lastName`, `country`, `primaryLanguageID`, `muteNotifications`, `socials` |                             | no      |
| `/api/v1/users/profile/image`            | PATCH      | JWT      | JSON: `userID`, `avatarURL`                                                   |                             | no      |
| `/api/v1/users/profile/ban-history`      | GET        | JWT      | None (userID from JWT)                                                        | Optionally allow users to view their own ban history | no       |
| `/api/v1/users/follow`                   | POST       | JWT      | Query: `followeeID` (followerID from JWT)                                     |                             | no      |
| `/api/v1/users/follow`                   | DELETE     | JWT      | Query: `followeeID` (followerID from JWT)                                     |                             | no      |
| `/api/v1/users/follow/following`         | GET        | JWT      | Query: `userID` (optional, defaults to JWT), `pageToken`, `limit`             | Pagination support          | no      |
| `/api/v1/users/follow/followers`         | GET        | JWT      | Query: `userID` (optional, defaults to JWT), `pageToken`, `limit`             | Pagination support          | no      |
| `/api/v1/users/security/password/change` | POST       | JWT      | JSON: `userID`, `oldPassword`, `newPassword`, `confirmPassword`               |                             | no       |
| `/api/v1/users/security/2fa`             | POST       | JWT      | JSON: `userID`, `enable`                                                      |                             | no       |
| `/api/v1/users/search`                   | GET        | JWT      | Query: `query`, `pageToken`, `limit`                                          | User search functionality   | no       |
| `/api/v1/users/logout`                   | POST       | JWT      | JSON: `userID`                                                                |                             | no       |
| `/api/v1/admin/login`                    | POST       | None     | JSON: `email`, `password`                                                     |                             | no       |
| `/api/v1/admin/users`                    | GET        | JWT      | Query: Optional `pageToken`, `limit`, `roleFilter`, `statusFilter`            | Admin only, pagination      | no       |
| `/api/v1/admin/users`                    | POST       | JWT      | JSON: `firstName`, `lastName`, `email`, `password`, `confirmPassword`, `role` | Admin only                  | no       |
| `/api/v1/admin/users/update`             | PUT        | JWT      | JSON: `userID`, Optionally: `firstName`, `lastName`, `email`, `password`, `role` | Admin only                | no       |
| `/api/v1/admin/users/soft-delete`        | DELETE     | JWT      | JSON: `userID`                                                                | Admin only                  | no       |
| `/api/v1/admin/users/verify`             | POST       | JWT      | JSON: `userID`                                                                | Admin only                  | no       |
| `/api/v1/admin/users/unverify`           | POST       | JWT      | JSON: `userID`                                                                | Admin only                  | no       |
| `/api/v1/admin/users/ban`                | POST       | JWT      | JSON: `userID`, `banType`, `banReason`, `banExpiry`                           | Admin only                  | no       |
| `/api/v1/admin/users/unban`              | POST       | JWT      | JSON: `userID`                                                                | Admin only                  | no       |
| `/api/v1/admin/users/ban-history`        | GET        | JWT      | Query: `userID`                                                               | Admin only                  | no       |

---

