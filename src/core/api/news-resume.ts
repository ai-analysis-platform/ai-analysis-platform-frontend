import type { KeywordSelection } from "@/core/state/onboarding";
import type { NewsItem } from "@/core/mock/daily-news";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const NEWS_RESUME_PATH = "/api/api/news/resume";

export type NewsResumeRequest = {
  selected_keywords: {
    competitors: string[];
    industry: string[];
    macro: string[];
  };
  session_id: string;
};

export type NewsResumeArticle = {
  title?: string;
  source?: string;
  published_at?: string;
  url?: string;
  summary?: string;
  lang?: string;
};

export type NewsLocale = "KOR" | "ENG";

export type NewsResumeGroupedArticles = {
  KOR?: NewsResumeArticle[];
  ENG?: NewsResumeArticle[];
};

export type NewsResumeResponse = {
  session_id?: string;
  status?: string;
  result?: {
    query?: string;
    selected_keywords?: Partial<NewsResumeRequest["selected_keywords"]>;
    routing_decision?: string | null;
    news_count?: number;
    news_data?: NewsResumeArticle[] | NewsResumeGroupedArticles;
    final_response?: string;
  };
  keywords?: unknown;
  message?: string;
  timestamp?: string;
};

async function parseError(response: Response): Promise<string> {
  const fallback = `News API request failed (${response.status})`;
  try {
    const data = (await response.json()) as {
      message?: string;
      detail?: Array<{ loc?: unknown[]; msg?: string }> | string;
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

function splitSummary(summary?: string): string[] {
  if (!summary) return [];

  const parts = summary
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length > 0) return parts.slice(0, 3);
  return [summary.trim()].filter(Boolean);
}

function pickTags(
  article: NewsResumeArticle,
  selectedKeywords: string[],
  fallbackTags: string[],
): string[] {
  const haystack = `${article.title ?? ""} ${article.summary ?? ""}`.toLowerCase();
  const matches = selectedKeywords.filter((keyword) =>
    haystack.includes(keyword.trim().toLowerCase()),
  );

  if (matches.length > 0) return matches.slice(0, 6);
  return fallbackTags.slice(0, 6);
}

export function buildNewsResumeRequest(
  selection: KeywordSelection,
  sessionId: string,
): NewsResumeRequest {
  return {
    session_id: sessionId,
    selected_keywords: {
      industry: selection.industries,
      competitors: selection.competitors,
      macro: selection.macros,
    },
  };
}

export function normalizeNewsItems(
  payload: NewsResumeResponse,
  selection: KeywordSelection,
): NewsItem[] {
  const grouped = normalizeNewsItemsByLocale(payload, selection);
  return [...grouped.KOR, ...grouped.ENG];
}

export function normalizeNewsItemsByLocale(
  payload: NewsResumeResponse,
  selection: KeywordSelection,
): Record<NewsLocale, NewsItem[]> {
  const selectedKeywords = [
    ...selection.industries,
    ...selection.competitors,
    ...selection.macros,
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  const fallbackTags = Array.from(new Set(selectedKeywords));
  const rawNewsData = payload.result?.news_data;

  const groupedNewsData: Record<NewsLocale, NewsResumeArticle[]> = Array.isArray(
    rawNewsData,
  )
    ? { KOR: rawNewsData, ENG: [] }
    : {
        KOR: rawNewsData?.KOR ?? [],
        ENG: rawNewsData?.ENG ?? [],
      };

  return {
    KOR: groupedNewsData.KOR.map((article, index) => ({
      id: `kor-news-${index}-${article.published_at ?? "unknown"}`,
      title: article.title?.trim() || "제목 없음",
      bullets: splitSummary(article.summary),
      url: article.url?.trim() || "#",
      source: article.source?.trim() || "Unknown",
      tags: pickTags(article, fallbackTags, fallbackTags),
      publishedAt: article.published_at?.trim(),
      locale: "KOR",
    })),
    ENG: groupedNewsData.ENG.map((article, index) => ({
      id: `eng-news-${index}-${article.published_at ?? "unknown"}`,
      title: article.title?.trim() || "제목 없음",
      bullets: splitSummary(article.summary),
      url: article.url?.trim() || "#",
      source: article.source?.trim() || "Unknown",
      tags: pickTags(article, fallbackTags, fallbackTags),
      publishedAt: article.published_at?.trim(),
      locale: "ENG",
    })),
  };
}

export async function fetchNewsResume(
  request: NewsResumeRequest,
): Promise<NewsResumeResponse> {
  const response = await fetch(`${API_BASE_URL}${NEWS_RESUME_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as NewsResumeResponse;
}
