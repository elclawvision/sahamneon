# eL Vision Group (Central Hub) Authentication Flow

## Overview
The `elvisiongroup` folder contains the central authentication logic and the "Reset Password" hub for the entire ecosystem.

## Key Features
1. **Central Reset Hub:** The `ResetPassword.tsx` page handles all password updates for users coming from UMKM, Autochat, or the main app.
2. **Comprehensive Cache Bomb:** On login, it clears almost all local storage (`user-profile-cache`, `chat-messages-cache`, `meditation-cache`, etc.) to prevent data inconsistency.
3. **Silent Login:** Automatically handles existing users during the signup process.
4. **Welcome Emails:** Invokes the `send-signup-email` Edge Function upon new user registration (including Google Auth).
5. **APK Support:** Includes a platform detection feature to show a download button for the Android APK (`elvisionv2.apk`).

## Implementation Details
- **Files:** `elvisiongroup/src/pages/Auth.tsx`, `elvisiongroup/src/pages/ResetPassword.tsx`
- **Return Logic:** Uses the `return` query parameter to redirect users back to their origin site (e.g., UMKM) after a successful password reset.
- **Edge Functions:** Interacts with `send-signup-email` and `send-reset-password-email`.
