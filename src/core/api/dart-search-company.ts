const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DART_SEARCH_COMPANY_PATH = "/api/api/news/api/dart-search-company";

async function parseError(response: Response): Promise<string> {
  const fallback = `Company search request failed (${response.status})`;

  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCompanies(query: string): Promise<string[]> {
  const url = new URL(`${API_BASE_URL}${DART_SEARCH_COMPANY_PATH}`);
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

  return (await response.json()) as string[];
}
