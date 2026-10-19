import { auth } from '@clerk/nextjs/server';

/**
 * Clerk is optional: the app runs without it (no sign-in, no history) until
 * the Clerk keys are added to the environment. `auth()` throws when Clerk is
 * not configured, so every call site goes through this helper instead.
 */
export const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

/** Clerk user id for the current request, or null when signed out/unconfigured. */
export async function currentUserId(): Promise<string | null> {
  if (!clerkEnabled) return null;
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
