// app/api/whois/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getWhois } from "@/app/actions/whois";
import { checkRateLimit } from "@/utils/rate-limit"; // Import your updated rate limit utility

export async function POST(req: NextRequest) {
  // 1. Perform rate limit check
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) {
    // If checkRateLimit returned a response, it means the request is rate-limited.
    // Immediately return that response.
    return rateLimitResponse;
  }

  // If we reach here, the request is NOT rate-limited, proceed with API logic.
  try {
    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
    }

    // Call your server action
    const data = await getWhois(domain);
    return NextResponse.json({ data });

  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    console.error(`Error in /api/whois: ${errorMessage}`);
    return NextResponse.json(
      { error: `WHOIS lookup failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}