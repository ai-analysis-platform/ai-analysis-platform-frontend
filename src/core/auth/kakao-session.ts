export const KAKAO_AUTH_SESSION_STORAGE_KEY = "kakao-auth-session";

export type KakaoAuthSession = {
  provider: "kakao";
  connectedAt: string;
  userName?: string | null;
  email?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStringValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function deriveKakaoAuthSession(payload: unknown): KakaoAuthSession {
  const record = isRecord(payload) ? payload : {};
  const user = isRecord(record.user) ? record.user : null;
  const account = isRecord(record.kakao_account) ? record.kakao_account : null;
  const profile = isRecord(account?.profile) ? account.profile : null;

  return {
    provider: "kakao",
    connectedAt: new Date().toISOString(),
    userName:
      (user && readStringValue(user, ["name", "nickname"])) ??
      (profile && readStringValue(profile, ["nickname"])) ??
      null,
    email:
      (user && readStringValue(user, ["email"])) ??
      (account && readStringValue(account, ["email"])) ??
      null,
  };
}

export function readKakaoAuthSession(): KakaoAuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KAKAO_AUTH_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as KakaoAuthSession;
  } catch {
    return null;
  }
}

export function saveKakaoAuthSession(session: KakaoAuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KAKAO_AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearKakaoAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KAKAO_AUTH_SESSION_STORAGE_KEY);
}
