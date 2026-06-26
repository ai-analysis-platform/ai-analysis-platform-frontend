import { buildApiUrl } from "@/core/api/url";

const DART_SEARCH_COMPANY_PATH = "/api/dart-search-company";

export type DartCompanySearchItem = {
  corp_name: string;
  corp_name_eng: string | null;
};

async function parseError(response: Response): Promise<string> {
  const fallback = `Company search request failed (${response.status})`;

  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCompanies(query: string): Promise<DartCompanySearchItem[]> {
  const url = new URL(buildApiUrl(DART_SEARCH_COMPANY_PATH));
  url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as DartCompanySearchItem[];
}
