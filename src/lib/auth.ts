import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn('VITE_NEON_AUTH_URL is not defined in environment variables');
}

export const authClient = createAuthClient(authUrl || 'https://ep-odd-sea-a1eal6y4.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth');
