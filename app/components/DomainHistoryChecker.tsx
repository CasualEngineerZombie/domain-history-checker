"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  AlertCircle,
  Database,
  Globe2,
  Server,
  Code,
  Info,
} from "lucide-react";

// Corrected import path for the shared type and updated to WhoisJsonResult
import type { WhoisJsonResult } from "whois-json"; // Correctly import from the module
// --- START: Type for vCard array items ---
// A common structure for a vCard property is [property_name, {parameters}, property_type, value]
// We are primarily interested in the value, which is usually at index 3.
type VCardProperty = [
  string,
  Record<string, string>,
  string,
  string | string[]
];

// A vCard array typically starts with ['vcard', [array_of_properties]]
type VCardArray = ["vcard", VCardProperty[]];
// --- END: Type for vCard array items ---

// Type for RDAP data (updated vcardArray)
type RdapData = {
  ldhName?: string;
  handle?: string;
  status?: string[];
  events?: { eventAction: string; eventDate: string }[];
  entities?: {
    handle?: string;
    roles?: string[];
    vcardArray?: VCardArray; // <--- Changed from any[] to VCardArray
  }[];
  nameservers?: { ldhName: string }[];
  secureDNS?: {
    delegationSigned?: boolean;
    dsData?: {
      keyTag: number;
      algorithm: number;
      digestType: number;
      digest: string;
    }[];
  };
  publicIds?: {
    type: string;
    identifier: string;
  }[];
  notices?: {
    title: string;
    description: string[];
    links?: {
      value: string;
      rel: string;
      href: string;
      type: string;
    }[];
  }[];
  domain?: string;
  name?: string;
  type?: string;
  port43?: string;
  termsOfService?: string;
  copyright?: string;
};

const DomainHistoryChecker: React.FC = () => {
  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [whoisData, setWhoisData] = useState<WhoisJsonResult | null>(null); // Changed to WhoisJsonResult
  const [rdapData, setRdapData] = useState<RdapData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "structured-whois" | "structured-rdap" | "raw"
  >("structured-whois");

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return dateString;
    }
  };

  const searchDomain = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError("");
    setWhoisData(null);
    setRdapData(null);
    setActiveTab("structured-whois");

    const errorMessages: string[] = [];

    // --- Fetch WHOIS Data ---
    try {
      const whoisRes = await fetch("/api/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const whoisResult = await whoisRes.json();
      if (!whoisRes.ok) {
        // Safely extract error message
        const whoisErrorMessage =
          typeof whoisResult.error === "string"
            ? whoisResult.error
            : "Unknown WHOIS error";
        throw new Error(whoisErrorMessage);
      }
      setWhoisData(whoisResult.data);
    } catch (error: unknown) {
      // Use 'unknown' for caught errors
      let message = "An unexpected error occurred during WHOIS lookup.";
      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        message = String((error as { message: unknown }).message);
      }
      errorMessages.push(`WHOIS Error: ${message}`);
    }

    // --- Fetch RDAP Data ---
    try {
      const tld = domain.split(".").pop();
      const rdapUrl =
        tld === "com"
          ? `https://rdap.verisign.com/com/v1/domain/${domain}`
          : `https://rdap.org/domain/${domain}`;

      const rdapRes = await fetch(rdapUrl);
      const rdapResult = await rdapRes.json();
      if (!rdapRes.ok) {
        if (rdapRes.status === 404) {
          throw new Error(
            "RDAP data not found for this domain. It might not exist or the RDAP server doesn't have data for this TLD."
          );
        }
        // Safely extract RDAP error message
        const rdapErrorMessage =
          rdapResult.description ||
          rdapResult.title ||
          `RDAP lookup failed with status ${rdapRes.status}`;
        throw new Error(rdapErrorMessage);
      }
      setRdapData(rdapResult);
    } catch (error: unknown) {
      // Use 'unknown' for caught errors
      let message = "An unexpected error occurred during RDAP lookup.";
      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        message = String((error as { message: unknown }).message);
      }
      errorMessages.push(`RDAP Error: ${message}`);
    }

    if (errorMessages.length > 0) {
      setError(errorMessages.join("\n"));
    }
    setLoading(false);
  };

  const DataCard: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-700">
        {children}
      </div>
    </div>
  );

  const DataItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string | string[] | number | boolean | null;
  }> = ({ icon, label, value }) => {
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null;
    }
    return (
      <div className="flex items-start gap-2">
        <span className="text-blue-500 flex-shrink-0 mt-1">{icon}</span>
        <div>
          <strong className="text-gray-900">{label}:</strong>{" "}
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </div>
      </div>
    );
  };

  // WHOIS Structured Display Component
  const WhoisStructuredDisplay: React.FC<{ data: WhoisJsonResult }> = ({
    // Changed to WhoisJsonResult
    data,
  }) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          No WHOIS data available for display.
        </div>
      );
    }

    const registrationDate = data.creationDate || data.creationdate;

    // --- FIX: Expanded Expiry Date Logic ---
    // Check common variations in order of likelihood/preference
    const expiryDate =
      data.registrarRegistrationExpirationDate ||
      data.registryExpiryDate ||
      data.expirationDate || // New (capital D)
      data.expiryDate || // New (lowercase e, matches type)
      data.expiresDate || // New
      data.expirationdate || // Existing (lowercase e, lowercase d)
      data["Registry Expiry Date"] || // New (with spaces)
      data["Registrar Registration Expiration Date"] || // New (with spaces)
      data["Domain Expiration Date"] || // New (with spaces)
      data["Expiration Time"] || // New
      data["Valid Until"]; // New
    // --- End FIX ---

    const updatedDate = data.updatedDate || data.updateddate;

    let nameservers: string[] = [];
    if (typeof data.nameServer === "string") {
      nameservers = data.nameServer.split(" ").filter(Boolean);
    } else if (Array.isArray(data.nameServer)) {
      nameservers = data.nameServer;
    }

    const domainStatus = Array.isArray(data.domainStatus)
      ? data.domainStatus
      : typeof data.domainStatus === "string"
      ? (data.domainStatus as string).split(" ").filter(Boolean) // Add type assertion here
      : typeof data.status === "string"
      ? data.status.split(" ").filter(Boolean)
      : Array.isArray(data.status)
      ? data.status
      : [];

    return (
      <div className="p-6">
        <DataCard title="Domain Information">
          <DataItem
            icon={<Globe size={18} />}
            label="Domain Name"
            value={data.domainName || data.domain || "N/A"}
          />
          <DataItem
            icon={<Calendar size={18} />}
            label="Creation Date"
            value={formatDate(registrationDate)}
          />
          <DataItem
            icon={<Clock size={18} />}
            label="Updated Date"
            value={formatDate(updatedDate)}
          />
          {/* Make sure this DataItem is present and uses the 'expiryDate' variable */}
          <DataItem
            icon={<Calendar size={18} />}
            label="Expiration Date"
            value={formatDate(expiryDate)}
          />
          <DataItem
            icon={<Server size={18} />}
            label="Registrar"
            value={data.registrar || "N/A"}
          />
          <DataItem
            icon={<Phone size={18} />}
            label="Registrar Phone"
            value={
              data.registrarAbuseContactPhone ||
              data.registrarTechContactPhone ||
              "N/A"
            }
          />
          <DataItem
            icon={<Mail size={18} />}
            label="Registrar Email"
            value={
              data.registrarAbuseContactEmail ||
              data.registrarTechContactEmail ||
              "N/A"
            }
          />
          <DataItem
            icon={<Globe2 size={18} />}
            label="WHOIS Server"
            value={data.whoisServer || data.registrarWhoisServer || "N/A"}
          />
          <DataItem
            icon={<Info size={18} />}
            label="Domain Status"
            value={domainStatus.length > 0 ? domainStatus : "N/A"}
          />
          <DataItem
            icon={<Info size={18} />}
            label="Registry Domain ID"
            value={data.registryDomainId || "N/A"}
          />
        </DataCard>

        {/* ... rest of your component (Nameservers, Registrant, Admin, Tech Contacts, Other Info) */}
        {nameservers.length > 0 && (
          <DataCard title="Nameservers">
            {nameservers.map((ns: string, index: number) => (
              <DataItem
                key={index}
                icon={<Database size={18} />}
                label={`Nameserver ${index + 1}`}
                value={ns}
              />
            ))}
          </DataCard>
        )}

        {(data.registrantName ||
          data.registrantOrganization ||
          data.registrantEmail) && (
          <DataCard title="Registrant Contact">
            <DataItem
              icon={<User size={18} />}
              label="Name"
              value={data.registrantName || "N/A"}
            />
            <DataItem
              icon={<Building size={18} />}
              label="Organization"
              value={data.registrantOrganization || "N/A"}
            />
            <DataItem
              icon={<Mail size={18} />}
              label="Email"
              value={data.registrantEmail || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Phone"
              value={data.registrantPhone || "N/A"}
            />
            <DataItem
              icon={<Info size={18} />}
              label="Address"
              value={data.registrantStreet || data.registrantAddress || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="City"
              value={data.registrantCity || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="State/Province"
              value={data.registrantStateProvince || "N/A"}
            />
            <DataItem
              icon={<Code size={18} />}
              label="Postal Code"
              value={data.registrantPostalCode || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="Country"
              value={data.registrantCountry || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Fax"
              value={data.registrantFax || "N/A"}
            />
          </DataCard>
        )}

        {(data.adminName || data.adminOrganization || data.adminEmail) && (
          <DataCard title="Administrative Contact">
            <DataItem
              icon={<User size={18} />}
              label="Name"
              value={data.adminName || "N/A"}
            />
            <DataItem
              icon={<Building size={18} />}
              label="Organization"
              value={data.adminOrganization || "N/A"}
            />
            <DataItem
              icon={<Mail size={18} />}
              label="Email"
              value={data.adminEmail || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Phone"
              value={data.adminPhone || "N/A"}
            />
            <DataItem
              icon={<Info size={18} />}
              label="Address"
              value={data.adminStreet || data.adminAddress || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="City"
              value={data.adminCity || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="State/Province"
              value={data.adminStateProvince || "N/A"}
            />
            <DataItem
              icon={<Code size={18} />}
              label="Postal Code"
              value={data.adminPostalCode || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="Country"
              value={data.adminCountry || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Fax"
              value={data.adminFax || "N/A"}
            />
          </DataCard>
        )}

        {(data.techName || data.techOrganization || data.techEmail) && (
          <DataCard title="Technical Contact">
            <DataItem
              icon={<User size={18} />}
              label="Name"
              value={data.techName || "N/A"}
            />
            <DataItem
              icon={<Building size={18} />}
              label="Organization"
              value={data.techOrganization || "N/A"}
            />
            <DataItem
              icon={<Mail size={18} />}
              label="Email"
              value={data.techEmail || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Phone"
              value={data.techPhone || "N/A"}
            />
            <DataItem
              icon={<Info size={18} />}
              label="Address"
              value={data.techStreet || data.techAddress || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="City"
              value={data.techCity || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="State/Province"
              value={data.techStateProvince || "N/A"}
            />
            <DataItem
              icon={<Code size={18} />}
              label="Postal Code"
              value={data.techPostalCode || "N/A"}
            />
            <DataItem
              icon={<Globe size={18} />}
              label="Country"
              value={data.techCountry || "N/A"}
            />
            <DataItem
              icon={<Phone size={18} />}
              label="Fax"
              value={data.techFax || "N/A"}
            />
          </DataCard>
        )}
        <DataCard title="Other Information">
          <DataItem
            icon={<Info size={18} />}
            label="DNSSEC"
            value={data.dnssec || "N/A"}
          />
          <DataItem
            icon={<Globe2 size={18} />}
            label="ICANN Reporting System URL"
            value={data.urlOfTheIcannWhoisDataProblemReportingSystem || "N/A"}
          />
          <DataItem
            icon={<Clock size={18} />}
            label="Last WHOIS DB Update"
            value={
              formatDate(data.lastUpdateOfWhoisDatabase?.replace(" <<<", "")) ||
              "N/A"
            }
          />
        </DataCard>
      </div>
    );
  };

  // RDAP Structured Display Component
  const RdapStructuredDisplay: React.FC<{ data: RdapData }> = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          No RDAP data available for display.
        </div>
      );
    }

    // Updated type for vcardArray
    const getVCardFieldValue = (
      vcardArray: VCardArray | undefined,
      fieldType: string
    ): string | undefined => {
      if (!vcardArray || !Array.isArray(vcardArray[1])) return undefined;
      const field = vcardArray[1].find((item) => item[0] === fieldType);
      // Ensure that field[3] is indeed a string or can be converted to one.
      return field && typeof field[3] === "string" ? field[3] : undefined;
    };

    return (
      <div className="p-6">
        <DataCard title="Domain Information">
          <DataItem
            icon={<Globe size={18} />}
            label="Domain Name"
            value={data.ldhName || data.name}
          />
          <DataItem
            icon={<Info size={18} />}
            label="Handle"
            value={data.handle}
          />
          <DataItem
            icon={<AlertCircle size={18} />}
            label="Status"
            value={data.status}
          />
          <DataItem
            icon={<Server size={18} />}
            label="Port 43 (WHOIS Server)"
            value={data.port43}
          />
        </DataCard>

        {data.events && data.events.length > 0 && (
          <DataCard title="Events">
            {data.events.map((event, index) => (
              <DataItem
                key={index}
                icon={<Calendar size={18} />}
                label={event.eventAction}
                value={formatDate(event.eventDate)}
              />
            ))}
          </DataCard>
        )}

        {data.nameservers && data.nameservers.length > 0 && (
          <DataCard title="Nameservers">
            {data.nameservers.map((ns, index) => (
              <DataItem
                key={index}
                icon={<Database size={18} />}
                label={`Nameserver ${index + 1}`}
                value={ns.ldhName}
              />
            ))}
          </DataCard>
        )}

        {data.entities &&
          data.entities.length > 0 &&
          data.entities.map((entity, entityIndex) => {
            const roles = entity.roles?.join(", ") || "N/A";
            const vcard = entity.vcardArray;
            const name = vcard ? getVCardFieldValue(vcard, "fn") : undefined;
            const organization = vcard
              ? getVCardFieldValue(vcard, "org")
              : undefined;
            const email = vcard
              ? getVCardFieldValue(vcard, "email")
              : undefined;
            const phone = vcard ? getVCardFieldValue(vcard, "tel") : undefined;

            // Address parsing from vCard 'adr' property
            const adrProperty = vcard?.[1]?.find((item) => item[0] === "adr");
            const addressValues = adrProperty?.[3]; // This could be a string or an array of strings

            let street, city, state, postalCode, country;

            if (Array.isArray(addressValues)) {
              // Assuming the common ADDR format: [pobox, ext, street, city, state, postal, country]
              street = addressValues[2];
              city = addressValues[3];
              state = addressValues[4];
              postalCode = addressValues[5];
              country = addressValues[6];
            } else if (typeof addressValues === "string") {
              // Handle cases where 'adr' might be a single string (less common for full address)
              street = addressValues;
            }

            return (
              <DataCard key={entityIndex} title={`${roles} Contact`}>
                <DataItem
                  icon={<Info size={18} />}
                  label="Handle"
                  value={entity.handle}
                />
                <DataItem icon={<User size={18} />} label="Name" value={name} />
                <DataItem
                  icon={<Building size={18} />}
                  label="Organization"
                  value={organization}
                />
                <DataItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={email}
                />
                <DataItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={phone}
                />
                <DataItem
                  icon={<Info size={18} />}
                  label="Street"
                  value={street}
                />
                <DataItem
                  icon={<Globe size={18} />}
                  label="City"
                  value={city}
                />
                <DataItem
                  icon={<Globe size={18} />}
                  label="State/Province"
                  value={state}
                />
                <DataItem
                  icon={<Code size={18} />}
                  label="Postal Code"
                  value={postalCode}
                />
                <DataItem
                  icon={<Globe size={18} />}
                  label="Country"
                  value={country}
                />
              </DataCard>
            );
          })}

        {data.secureDNS && (
          <DataCard title="Secure DNS (DNSSEC)">
            <DataItem
              icon={<Info size={18} />}
              label="Delegation Signed"
              value={data.secureDNS.delegationSigned ? "Yes" : "No"}
            />
            {data.secureDNS.dsData &&
              data.secureDNS.dsData.length > 0 &&
              data.secureDNS.dsData.map((ds, index) => (
                <div
                  key={index}
                  className="md:col-span-2 ml-4 border-l-2 pl-3 border-blue-200"
                >
                  <h4 className="font-medium text-gray-800">
                    DS Record {index + 1}
                  </h4>
                  <DataItem
                    icon={<Code size={18} />}
                    label="Key Tag"
                    value={ds.keyTag}
                  />
                  <DataItem
                    icon={<Code size={18} />}
                    label="Algorithm"
                    value={ds.algorithm}
                  />
                  <DataItem
                    icon={<Code size={18} />}
                    label="Digest Type"
                    value={ds.digestType}
                  />
                  <DataItem
                    icon={<Code size={18} />}
                    label="Digest"
                    value={ds.digest}
                  />
                </div>
              ))}
          </DataCard>
        )}

        {data.publicIds && data.publicIds.length > 0 && (
          <DataCard title="Public IDs">
            {data.publicIds.map((id, index) => (
              <DataItem
                key={index}
                icon={<Code size={18} />}
                label={id.type}
                value={id.identifier}
              />
            ))}
          </DataCard>
        )}

        {data.notices && data.notices.length > 0 && (
          <DataCard title="Notices">
            {data.notices.map((notice, index) => (
              <div
                key={index}
                className="md:col-span-2 ml-4 border-l-2 pl-3 border-blue-200"
              >
                <h4 className="font-medium text-gray-800">{notice.title}</h4>
                {notice.description &&
                  notice.description.map((desc, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {desc}
                    </p>
                  ))}
                {notice.links &&
                  notice.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block"
                    >
                      {link.value || link.href}
                    </a>
                  ))}
              </div>
            ))}
          </DataCard>
        )}

        {data.termsOfService && (
          <DataCard title="Terms of Service">
            <DataItem
              icon={<Info size={18} />}
              label="URL"
              value={data.termsOfService}
            />
          </DataCard>
        )}

        {data.copyright && (
          <DataCard title="Copyright">
            <DataItem
              icon={<Info size={18} />}
              label="Statement"
              value={data.copyright}
            />
          </DataCard>
        )}
      </div>
    );
  };

  // Raw Data Display Component
  const RawDataDisplay: React.FC<{
    whois: WhoisJsonResult | null; // Changed to WhoisJsonResult
    rdap: RdapData | null;
  }> = ({ whois, rdap }) => (
    <div className="p-6 space-y-8">
      {whois && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">
            Raw WHOIS Data
          </h3>
          <pre className="bg-gray-800 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(whois, null, 2)}
          </pre>
        </div>
      )}
      {!whois && (
        <div className="p-4 text-center text-gray-500">
          No raw WHOIS data to display.
        </div>
      )}

      {rdap && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">
            Raw RDAP Data
          </h3>
          <pre className="bg-gray-800 text-blue-300 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(rdap, null, 2)}
          </pre>
        </div>
      )}
      {!rdap && (
        <div className="p-4 text-center text-gray-500">
          No raw RDAP data to display.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            WHOIS/RDAP Explorer 
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Instantly look up domain info via WHOIS & RDAP.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="e.g., example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchDomain()}
              className="w-full px-6 py-4 text-gray-800 bg-white border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition duration-200"
            />
            <button
              onClick={searchDomain}
              disabled={loading}
              className="px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              ) : (
                <>
                  <Search size={20} />
                  <span className="font-medium">Search</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg whitespace-pre-line text-sm">
              {error}
            </div>
          )}
        </div>

        {!loading && (whoisData || rdapData) && (
          <div className="max-w-6xl mx-auto mt-10">
            <div className="flex justify-center mb-6 space-x-4">
              <button
                className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                  activeTab === "structured-whois"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-300"
                }`}
                onClick={() => setActiveTab("structured-whois")}
                disabled={!whoisData}
              >
                WHOIS Data
              </button>
              <button
                className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                  activeTab === "structured-rdap"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-300"
                }`}
                onClick={() => setActiveTab("structured-rdap")}
                disabled={!rdapData}
              >
                RDAP Data
              </button>
              <button
                className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                  activeTab === "raw"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-300"
                }`}
                onClick={() => setActiveTab("raw")}
                disabled={!whoisData && !rdapData}
              >
                Raw Data
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl">
              {activeTab === "structured-whois" && whoisData && (
                <WhoisStructuredDisplay data={whoisData} />
              )}
              {activeTab === "structured-whois" && !whoisData && (
                <div className="p-6 text-center text-gray-500">
                  No WHOIS data available for this domain.
                </div>
              )}

              {activeTab === "structured-rdap" && rdapData && (
                <RdapStructuredDisplay data={rdapData} />
              )}
              {activeTab === "structured-rdap" && !rdapData && (
                <div className="p-6 text-center text-gray-500">
                  No RDAP data available for this domain.
                </div>
              )}

              {activeTab === "raw" && (whoisData || rdapData) && (
                <RawDataDisplay whois={whoisData} rdap={rdapData} />
              )}
              {activeTab === "raw" && !whoisData && !rdapData && (
                <div className="p-6 text-center text-gray-500">
                  No raw data available for this domain.
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !whoisData && !rdapData && !error && (
          <div className="max-w-2xl mx-auto mt-10 p-8 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl text-center text-gray-600">
            <Info size={48} className="mx-auto text-blue-400 mb-4" />
            <p className="text-lg">Enter a domain name above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainHistoryChecker;
