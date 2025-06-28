// types/whois-json.d.ts

declare module "whois-json" {
  export interface WhoisJsonResult {
    domainName?: string;
    registrar?: string;
    registrarURL?: string;
    registrarIANAID?: string;
    registrarAbuseContactEmail?: string;
    registrarAbuseContactPhone?: string;
    updatedDate?: string;
    creationDate?: string;
    registryExpiryDate?: string; // Often standardized
    domainStatus?: string[];
    nameServer?: string | string[]; // Corrected to nameServer as per your example
    dnssec?: string;
    registrantName?: string;
    registrantOrganization?: string;
    registrantStreet?: string;
    registrantCity?: string;
    registrantState?: string;
    registrantPostalCode?: string;
    registrantCountry?: string;
    registrantPhone?: string;
    registrantEmail?: string;
    adminName?: string;
    adminPhone?: string;
    adminEmail?: string;
    techName?: string;
    techPhone?: string;
    techEmail?: string;
    rawText?: string;

    // --- IMPORTANT: Add these common expiration date variations ---
    registrarRegistrationExpirationDate?: string; // Your google.com example
    expiresDate?: string; // Very common
    expirationDate?: string; // Common alternative casing/naming
    expiryDate?: string; // Another common one, already in your display logic
    ExpirationDate?: string; // Capitalized version
    'Registry Expiry Date'?: string; // As sometimes returned by whois servers directly
    'Registrar Registration Expiration Date'?: string; // With spaces
    'Domain Expiration Date'?: string;
    'Expiration Time'?: string; // Sometimes just the time part
    'Valid Until'?: string; // Less common, but seen
    // --- End of expiration date additions ---

    // Add other properties that appeared in your example if they are consistently returned
    registryDomainId?: string;
    registrarWhoisServer?: string;
    registrarTechContactPhone?: string;
    registrarTechContactEmail?: string;
    whoisServer?: string;
    domain?: string;
    status?: string | string[]; // Sometimes domainStatus is just 'status' and can be string or array
    expirationdate?: string; // Alternative casing (lowercase 'e')
    updateddate?: string; // Alternative casing
    creationdate?: string; // Alternative casing
    registrantAddress?: string; // Alternative field name for street/address
    registrantStateProvince?: string;
    adminOrganization?: string;
    adminStreet?: string;
    adminCity?: string;
    adminStateProvince?: string;
    adminPostalCode?: string;
    adminCountry?: string;
    adminPhone?: string;
    adminFax?: string;
    adminEmail?: string;
    techOrganization?: string;
    techStreet?: string;
    techCity?: string;
    techStateProvince?: string;
    techPostalCode?: string;
    techCountry?: string;
    techFax?: string;
    techEmail?: string;
    urlOfTheIcannWhoisDataProblemReportingSystem?: string;
    lastUpdateOfWhoisDatabase?: string;
  }

  const whois: (domain: string) => Promise<WhoisJsonResult>;
  export default whois;
}