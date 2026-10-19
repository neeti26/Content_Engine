import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkEnabled } from '@/lib/auth';

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',                        // hero page
  '/api/health',
  '/api/demo',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const handler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

/**
 * Clerk is optional. Without the Clerk keys in the environment the middleware
 * is skipped entirely so the app still works (no sign-in, no history) instead
 * of failing every request with "Missing publishableKey".
 */
export default clerkEnabled
  ? handler
  : function passThrough() {
      return undefined;
    };

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
