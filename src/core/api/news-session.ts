const NEWS_KEYWORD_SESSION_STORAGE_KEY = "news-keyword-session-id";

function createSessionId() {
  return `web-${Date.now()}`;
}

function buildSessionStorageKey(scope?: string): string {
  const normalizedScope = scope?.trim().toLowerCase();
  if (!normalizedScope) {
    return NEWS_KEYWORD_SESSION_STORAGE_KEY;
  }

  return `${NEWS_KEYWORD_SESSION_STORAGE_KEY}:${encodeURIComponent(normalizedScope)}`;
}

export function getStoredNewsKeywordSessionId(scope?: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(buildSessionStorageKey(scope));
}

export function getOrCreateNewsKeywordSessionId(scope?: string): string {
  if (typeof window === "undefined") return createSessionId();

  const storageKey = buildSessionStorageKey(scope);
  const stored = getStoredNewsKeywordSessionId(scope);
  if (stored) return stored;

  const created = createSessionId();
  window.sessionStorage.setItem(storageKey, created);
  return created;
}
