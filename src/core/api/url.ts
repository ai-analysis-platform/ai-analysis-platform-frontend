const DEFAULT_API_BASE_URL = "http://localhost:8000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function getApiBaseUrl(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  );
}

export function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;
}
