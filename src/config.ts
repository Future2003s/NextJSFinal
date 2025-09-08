import { z } from "zod";

// Minimal, backward-compatible config that allows a single
// NEXT_PUBLIC_API_ENDPOINT to control both legacy fields used across the app.
const schema = z.object({
  NEXT_PUBLIC_URL: z.string().default("http://localhost:3001"),
  // New, optional unified endpoint set at deploy time
  NEXT_PUBLIC_API_ENDPOINT: z.string().optional(),

  // Legacy fields preserved for compatibility with existing code
  NEXT_PUBLIC_API_END_POINT: z.string().optional(),
  NEXT_PUBLIC_URL_LOGO: z.string().default("https://placehold.co/200x80"),
  NEXT_PUBLIC_BACKEND_URL: z.string().optional(),
  NEXT_PUBLIC_API_VERSION: z.string().default("v1"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_API_END_POINT: process.env.NEXT_PUBLIC_API_END_POINT,
  NEXT_PUBLIC_URL_LOGO: process.env.NEXT_PUBLIC_URL_LOGO,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
});

let envConfig: z.infer<typeof schema>;

if (!parsed.success) {
  console.log("Config validation errors:", parsed.error.errors);
  // Reasonable defaults; legacy code keeps working
  envConfig = {
    NEXT_PUBLIC_URL: "http://localhost:3001",
    NEXT_PUBLIC_API_ENDPOINT: undefined,
    NEXT_PUBLIC_API_END_POINT: undefined,
    NEXT_PUBLIC_URL_LOGO: "https://placehold.co/200x80",
    NEXT_PUBLIC_BACKEND_URL: undefined,
    NEXT_PUBLIC_API_VERSION: "v1",
  };
} else {
  envConfig = parsed.data;
}

function normalize(u?: string | null) {
  if (!u) return undefined;
  const t = u.trim();
  if (t === "") return undefined;
  return t.replace(/\/+$/, "");
}

const userEndpoint = normalize(envConfig.NEXT_PUBLIC_API_ENDPOINT);
const legacyApiBase = normalize(envConfig.NEXT_PUBLIC_API_END_POINT);
const legacyBackend = normalize(envConfig.NEXT_PUBLIC_BACKEND_URL);
let version = envConfig.NEXT_PUBLIC_API_VERSION || "v1";
let backendUrl = legacyBackend;
let apiBase = legacyApiBase;

if (userEndpoint) {
  if (userEndpoint.includes("/api/")) {
    const [origin, after] = userEndpoint.split("/api/");
    backendUrl = normalize(origin) || legacyBackend || "http://localhost:8081";
    const seg = after.split("/")[0];
    if (seg) version = seg;
    apiBase = userEndpoint;
  } else {
    backendUrl = userEndpoint;
    apiBase = `${backendUrl}/api/${version}`;
  }
} else {
  // No new endpoint provided; synthesize from legacy if needed
  if (!apiBase && backendUrl) {
    apiBase = `${backendUrl}/api/${version}`;
  }
  if (!backendUrl && apiBase && apiBase.includes("/api/")) {
    backendUrl = apiBase.split("/api/")[0];
  }
}

// Ensure legacy fields are populated for the rest of the app
envConfig.NEXT_PUBLIC_BACKEND_URL = backendUrl || "http://localhost:8081";
envConfig.NEXT_PUBLIC_API_END_POINT =
  apiBase || `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${version}`;
envConfig.NEXT_PUBLIC_API_VERSION = version;

// Keep the new field visible for debugging/convenience
if (!envConfig.NEXT_PUBLIC_API_ENDPOINT) {
  envConfig.NEXT_PUBLIC_API_ENDPOINT = envConfig.NEXT_PUBLIC_API_END_POINT;
}

// export { envConfig }; // replaced by strict export below

// Create a strict typed view so downstream code sees required strings
export type EnvConfigStrict = {
  NEXT_PUBLIC_URL: string;
  NEXT_PUBLIC_API_ENDPOINT?: string;
  NEXT_PUBLIC_API_END_POINT: string;
  NEXT_PUBLIC_URL_LOGO: string;
  NEXT_PUBLIC_BACKEND_URL: string;
  NEXT_PUBLIC_API_VERSION: string;
};

const envStrict: EnvConfigStrict = {
  NEXT_PUBLIC_URL: envConfig.NEXT_PUBLIC_URL || "http://localhost:3001",
  NEXT_PUBLIC_API_ENDPOINT: envConfig.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_API_END_POINT:
    envConfig.NEXT_PUBLIC_API_END_POINT ||
    `${envConfig.NEXT_PUBLIC_BACKEND_URL}/api/${envConfig.NEXT_PUBLIC_API_VERSION}`,
  NEXT_PUBLIC_URL_LOGO:
    envConfig.NEXT_PUBLIC_URL_LOGO || "https://placehold.co/200x80",
  NEXT_PUBLIC_BACKEND_URL:
    envConfig.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081",
  NEXT_PUBLIC_API_VERSION: envConfig.NEXT_PUBLIC_API_VERSION || "v1",
};

// Export under the same name used across the project
export { envStrict as envConfig };
