# Autochat Authentication Flow

## Overview
Autochat implements a multi-language authentication system integrated with the eL Vision Group Supabase backend.

## Key Features
1. **Client Seeding:** Upon login or signup, it automatically seeds/upserts a record into the `autochat_clients` table to ensure the user exists in the local Autochat domain.
2. **Multi-Language Support:** All toast messages and UI labels are localized using `LanguageContext`.
3. **Integrated Forgot Password:** Uses the central `send-reset-password-email` Edge Function and redirects to the central reset hub at `app.elvisiongroup.com`.
4. **Already Registered Logic:** Similar to other apps, it detects existing users during signup and suggests moving to the login tab.

## Implementation Details
- **File:** `autochat/src/pages/Auth.tsx`
- **Tables:** Interacts with `autochat_clients` (upserts `user_id`, `email`, `display_name`, `status`).
- **Function:** Calls the central Edge Function for password resets.
