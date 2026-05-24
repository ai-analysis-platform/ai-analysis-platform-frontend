const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? "";
const KAKAO_REDIRECT_URI =
  process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ??
  "http://localhost:3000/auth/kakao/callback";
const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_AUTH_CALLBACK_PATH = "/api/auth/kakao/callback";
const KAKAO_OAUTH_STATE_STORAGE_KEY = "kakao-oauth-state";

export type KakaoAuthExchangeRequest = {
  code: string;
  redirect_uri: string;
};

export type KakaoAuthExchangeResponse = {
  message?: string;
  user?: {
    id?: string | number;
    nickname?: string;
    name?: string;
    email?: string;
  };
  [key: string]: unknown;
};

function createOauthState() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `kakao-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function parseError(response: Response): Promise<string> {
  const fallback = `Kakao auth request failed (${response.status})`;

  try {
    const data = (await response.json()) as {
      message?: string;
      detail?: string | Array<{ msg?: string }>;
      error?: string;
    };

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return (
        data.detail
          .map((item) => item.msg)
          .filter(Boolean)
          .join(", ") || fallback
      );
    }

    return data.message ?? data.error ?? fallback;
  } catch {
    return fallback;
  }
}

function setStoredOauthState(state: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KAKAO_OAUTH_STATE_STORAGE_KEY, state);
}

export function getKakaoRedirectUri() {
  return KAKAO_REDIRECT_URI;
}

export function isKakaoLoginConfigured() {
  return Boolean(KAKAO_REST_API_KEY && KAKAO_REDIRECT_URI);
}

export function getStoredKakaoOauthState() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KAKAO_OAUTH_STATE_STORAGE_KEY);
}

export function clearStoredKakaoOauthState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KAKAO_OAUTH_STATE_STORAGE_KEY);
}

export function createKakaoAuthorizeUrl() {
  if (!isKakaoLoginConfigured()) return null;

  const state = createOauthState();
  setStoredOauthState(state);

  const url = new URL(KAKAO_AUTHORIZE_URL);
  url.searchParams.set("client_id", KAKAO_REST_API_KEY);
  url.searchParams.set("redirect_uri", KAKAO_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeKakaoAuthorizationCode(
  request: KakaoAuthExchangeRequest,
): Promise<KakaoAuthExchangeResponse> {
  const response = await fetch(`${API_BASE_URL}${KAKAO_AUTH_CALLBACK_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as KakaoAuthExchangeResponse;
}
