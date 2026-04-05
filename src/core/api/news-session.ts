const NEWS_KEYWORD_SESSION_STORAGE_KEY = "news-keyword-session-id";

function createSessionId() {
  return `web-${Date.now()}`;
}

export function getStoredNewsKeywordSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(NEWS_KEYWORD_SESSION_STORAGE_KEY);
}

export function getOrCreateNewsKeywordSessionId(): string {
  if (typeof window === "undefined") return createSessionId();

  const stored = getStoredNewsKeywordSessionId();
  if (stored) return stored;

  const created = createSessionId();
  window.sessionStorage.setItem(NEWS_KEYWORD_SESSION_STORAGE_KEY, created);
  return created;
}
