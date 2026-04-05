import type { KeywordSelection } from "@/core/state/onboarding";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const NEWS_KEYWORD_PATH = "/api/api/news/keyword";

export type NewsKeywordRequest = {
  query: string;
  days_back: number;
  max_articles: number;
  language: string;
  session_id?: string;
};

export type NewsKeywordResponse = {
  session_id?: string;
  status?: string;
  result?: unknown;
  keywords?: unknown;
  message?: string;
  timestamp?: string;
};

const CATEGORY_MATCHERS: Record<keyof KeywordSelection, RegExp[]> = {
  industries: [/industr/i, /sector/i, /theme/i, /\uC0B0\uC5C5/, /\uC5C5\uC885/],
  competitors: [/competitor/i, /rival/i, /peer/i, /\uACBD\uC7C1/, /\uB77C\uC774\uBC8C/],
  macros: [
    /macro/i,
    /econom/i,
    /policy/i,
    /\uB9E4\uD06C\uB85C/,
    /\uAC70\uC2DC/,
    /\uC815\uCC45/,
  ],
};

async function parseError(response: Response): Promise<string> {
  const fallback = `Keyword API request failed (${response.status})`;
  try {
    const data = (await response.json()) as {
      message?: string;
      detail?: Array<{ loc?: unknown[]; msg?: string; type?: string }> | string;
    };

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail
        .map((item) => {
          const loc = Array.isArray(item.loc) ? item.loc.join(".") : "body";
          return `${loc}: ${item.msg ?? "invalid value"}`;
        })
        .join(", ");
    }

    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

function collectStrings(value: unknown, bucket: Set<string>) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) bucket.add(trimmed);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, bucket);
    return;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStrings(nested, bucket);
    }
  }
}

function isCategoryKey(key: string, category: keyof KeywordSelection): boolean {
  return CATEGORY_MATCHERS[category].some((pattern) => pattern.test(key));
}

export function normalizeKeywordSelection(
  payload: NewsKeywordResponse,
): KeywordSelection {
  const source = payload.keywords ?? payload.result ?? {};
  const base: KeywordSelection = {
    industries: [],
    competitors: [],
    macros: [],
  };

  if (source && typeof source === "object" && !Array.isArray(source)) {
    const entries = Object.entries(source as Record<string, unknown>);

    for (const [key, value] of entries) {
      for (const category of Object.keys(base) as (keyof KeywordSelection)[]) {
        if (!isCategoryKey(key, category)) continue;
        const set = new Set(base[category]);
        collectStrings(value, set);
        base[category] = Array.from(set);
      }
    }
  }

  const allKeywords = new Set<string>();
  collectStrings(source, allKeywords);

  if (base.industries.length === 0) {
    base.industries = Array.from(allKeywords);
  }
  if (base.competitors.length === 0) {
    base.competitors = Array.from(allKeywords);
  }
  if (base.macros.length === 0) {
    base.macros = Array.from(allKeywords);
  }

  return base;
}

export async function fetchNewsKeywords(
  request: NewsKeywordRequest,
): Promise<NewsKeywordResponse> {
  const response = await fetch(`${API_BASE_URL}${NEWS_KEYWORD_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as NewsKeywordResponse;
}
