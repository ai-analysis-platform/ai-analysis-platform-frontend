"use client";

import styled from "@emotion/styled";
import { Button, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { createKakaoAuthorizeUrl, isKakaoLoginConfigured } from "@/core/api/kakao-auth";
import {
  clearKakaoAuthSession,
  readKakaoAuthSession,
  type KakaoAuthSession,
} from "@/core/auth/kakao-session";

type KakaoLoginPanelProps = {
  collapsed?: boolean;
};

function KakaoSymbol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5C7.03 3.5 3 6.7 3 10.65c0 2.53 1.67 4.74 4.17 6l-.95 3.73a.45.45 0 0 0 .67.49l4.43-2.85c.22.02.45.03.68.03 4.97 0 9-3.2 9-7.15S16.97 3.5 12 3.5Z"
        fill="#191600"
      />
    </svg>
  );
}

function formatConnectedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "연결 완료";
  return `${date.toLocaleDateString("ko-KR")} 연결`;
}

export default function KakaoLoginPanel({ collapsed = false }: KakaoLoginPanelProps) {
  const [session, setSession] = useState<KakaoAuthSession | null>(() =>
    readKakaoAuthSession(),
  );

  useEffect(() => {
    const syncSession = () => {
      setSession(readKakaoAuthSession());
    };

    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const configured = isKakaoLoginConfigured();
  const buttonLabel = useMemo(() => {
    if (session) return "카카오 다시 연결";
    return "카카오 로그인";
  }, [session]);

  const handleLogin = () => {
    const authorizeUrl = createKakaoAuthorizeUrl();
    if (!authorizeUrl) return;
    window.location.assign(authorizeUrl);
  };

  const handleDisconnect = () => {
    clearKakaoAuthSession();
    setSession(null);
  };

  const infoTitle = session?.userName ?? session?.email ?? "카카오 연결됨";
  const infoDescription = session ? formatConnectedAt(session.connectedAt) : "OAuth 연동";

  if (collapsed) {
    return (
      <Tooltip
        title={configured ? buttonLabel : "카카오 env 설정이 필요합니다."}
        placement="right"
      >
        <CollapsedButton
          aria-label={buttonLabel}
          onClick={handleLogin}
          disabled={!configured}
        >
          <KakaoSymbol />
        </CollapsedButton>
      </Tooltip>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>카카오 계정</PanelTitle>
        {session ? (
          <StatusChip>연결됨</StatusChip>
        ) : (
          <StatusChip $muted>미연결</StatusChip>
        )}
      </PanelHeader>

      <LoginButton
        type="button"
        onClick={handleLogin}
        disabled={!configured}
        aria-label={buttonLabel}
      >
        <ButtonIcon>
          <KakaoSymbol />
        </ButtonIcon>
        <span>{buttonLabel}</span>
      </LoginButton>

      {session && (
        <DisconnectButton type="button" onClick={handleDisconnect}>
          연결 정보 지우기
        </DisconnectButton>
      )}
    </Panel>
  );
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PanelTitle = styled.div`
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 700;
`;

const StatusChip = styled.span<{ $muted?: boolean }>`
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $muted }) => ($muted ? "rgba(255, 255, 255, 0.68)" : "#191600")};
  background: ${({ $muted }) => ($muted ? "rgba(255, 255, 255, 0.08)" : "#fee500")};
`;

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoTitle = styled.div`
  color: rgba(255, 255, 255, 0.96);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
`;

const InfoDescription = styled.div`
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
`;

const HelperText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 14px;
  background: #fee500;
  color: #191600;
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const ButtonIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(25, 22, 0, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DisconnectButton = styled.button`
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  padding: 0;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.96);
  }
`;

const CollapsedButton = styled(Button)`
  width: 44px;
  height: 44px;
  margin: 14px auto 16px;
  border: 0 !important;
  border-radius: 14px !important;
  background: #fee500 !important;
  color: #191600 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.24);

  &:disabled {
    opacity: 0.45;
  }
`;
