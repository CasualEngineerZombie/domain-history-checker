"use server";

import whois from "whois-json";
import { WhoisJsonResult } from "whois-json"; // Import the specific type

// We can export this type to be used in our client component for type safety.
// Now using the precise type from the declaration file
export type WhoisResult = WhoisJsonResult;

/**
 * Asynchronously retrieves structured WHOIS information for a given domain.
 */
export async function getWhois(domain: string): Promise<WhoisResult> {
  try {
    const result = await whois(domain);
    // Check if result is an empty object, which whois-json might return for no data
    if (!result || Object.keys(result).length === 0) {
      throw new Error("No WHOIS data returned for this domain.");
    }
    return result;
  } catch (error: unknown) { // Use 'unknown' for caught errors for better type safety
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // Fallback for objects that might have a message property but aren't Error instances
        errorMessage = String((error as { message: unknown }).message);
    }
    
    console.error(`WHOIS lookup failed for ${domain}:`, errorMessage);
    throw new Error(`Failed to retrieve WHOIS data. The server may be unavailable or the domain is invalid. Details: ${errorMessage}`);
  }
}