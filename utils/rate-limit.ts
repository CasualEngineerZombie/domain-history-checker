// utils/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'; // Import from next/server for App Router

// In-memory store for tracking requests by IP
// WARNING: This is still an in-memory store.
// It will NOT work correctly in a multi-instance/serverless environment like Vercel
// where each request might hit a different serverless function instance.
// For production, strongly consider @upstash/ratelimit with Vercel KV or a shared Redis.
const requestCounts = new Map<string, { count: number; lastReset: number }>();

// Define your rate limit settings
const MAX_REQUESTS = 5; // e.g., 5 requests
const WINDOW_SIZE_MS = 60 * 1000; // e.g., in 1 minute (60 seconds)

/**
 * Checks if the incoming request is rate-limited based on IP.
 * Returns a NextResponse (429) if rate-limited, otherwise null.
 */
export const checkRateLimit = (req: NextRequest): NextResponse | null => {
  // Get client IP address
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';

  const now = Date.now();
  let clientData = requestCounts.get(ip);

  // If clientData doesn't exist or window has expired, reset count
  if (!clientData || now - clientData.lastReset > WINDOW_SIZE_MS) {
    clientData = { count: 1, lastReset: now };
    requestCounts.set(ip, clientData);
  } else {
    // Otherwise, increment count
    clientData.count++;
    requestCounts.set(ip, clientData);
  }

  // Log for debugging (optional)
  // console.log(`IP: ${ip}, Count: ${clientData.count}, Remaining: ${MAX_REQUESTS - clientData.count}`);


  if (clientData.count > MAX_REQUESTS) {
    // Calculate when the retry-after time is
    const retryAfterSeconds = Math.ceil((clientData.lastReset + WINDOW_SIZE_MS - now) / 1000);

    // Create a Headers object for the response
    const headers = new Headers();
    headers.set('Retry-After', retryAfterSeconds.toString());
    
    // Return a 429 Too Many Requests response
    return NextResponse.json(
      { error: `Too many requests from this IP address. Please try again in ${retryAfterSeconds} seconds.` },
      { status: 429, headers }
    );
  }

  // If not rate-limited, return null to indicate continuation
  return null;
};  