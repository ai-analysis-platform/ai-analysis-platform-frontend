"use client";

import styled from "@emotion/styled";
import { Alert, Button, Card, Spin, Typography } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearStoredKakaoOauthState,
  exchangeKakaoAuthorizationCode,
  getKakaoRedirectUri,
  getStoredKakaoOauthState,
} from "@/core/api/kakao-auth";
import { deriveKakaoAuthSession, saveKakaoAuthSession } from "@/core/auth/kakao-session";

const { Title, Text } = Typography;

type CallbackStatus = "pending" | "success" | "error";

export default function KakaoAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startedRef = useRef(false);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  const storedState = getStoredKakaoOauthState();
  const validationError = useMemo(() => {
    if (oauthError) {
      return oauthErrorDescription || oauthError || "카카오 로그인이 취소되었습니다.";
    }

    if (!code) {
      return "카카오에서 전달된 인가 코드가 없습니다.";
    }

    if (storedState && state !== storedState) {
      return "카카오 OAuth state 검증에 실패했습니다. 다시 시도해 주세요.";
    }

    return null;
  }, [code, oauthError, oauthErrorDescription, state, storedState]);
  const [result, setResult] = useState<{
    status: CallbackStatus;
    message: string;
  }>({
    status: "pending",
    message: "카카오 인가 코드를 확인하고 있습니다.",
  });

  useEffect(() => {
    if (validationError) {
      clearStoredKakaoOauthState();
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    clearStoredKakaoOauthState();

    void exchangeKakaoAuthorizationCode({
      code: code!,
      redirect_uri: getKakaoRedirectUri(),
    })
      .then((response) => {
        saveKakaoAuthSession(deriveKakaoAuthSession(response));
        setResult({
          status: "success",
          message: response.message ?? "카카오 로그인 연결이 완료되었습니다.",
        });

        window.setTimeout(() => {
          router.replace("/" as Route);
        }, 1400);
      })
      .catch((error: unknown) => {
        setResult({
          status: "error",
          message:
            error instanceof Error ? error.message : "카카오 로그인 처리에 실패했습니다.",
        });
      });
  }, [code, router, validationError]);

  const status = validationError ? "error" : result.status;
  const message =
    validationError ??
    (result.status === "pending" && code
      ? "백엔드로 카카오 인가 코드를 전달하고 있습니다."
      : result.message);

  return (
    <PageShell>
      <Backdrop />
      <CallbackCard>
        <Title level={3} style={{ margin: 0 }}>
          카카오 로그인 연결
        </Title>
        <Text type="secondary">
          인가 코드 수신 후 백엔드 연동을 마무리하는 단계입니다.
        </Text>

        {status === "pending" ? (
          <StateBlock>
            <Spin size="large" />
            <StateText>{message}</StateText>
          </StateBlock>
        ) : status === "success" ? (
          <StateBlock>
            <SuccessIcon />
            <StateText>{message}</StateText>
            <Alert type="success" showIcon message="잠시 후 대시보드로 이동합니다." />
          </StateBlock>
        ) : (
          <StateBlock>
            <ErrorIcon />
            <StateText>{message}</StateText>
            <Alert
              type="error"
              showIcon
              message="카카오 로그인 처리를 완료하지 못했습니다."
            />
          </StateBlock>
        )}

        <ActionRow>
          <Button onClick={() => router.replace("/" as Route)}>대시보드로 이동</Button>
          <PrimaryButton type="primary" onClick={() => router.replace("/" as Route)}>
            홈으로 돌아가기
          </PrimaryButton>
        </ActionRow>
      </CallbackCard>
    </PageShell>
  );
}

const PageShell = styled.div`
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  overflow: hidden;
  background: #0b1020;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 20%, rgba(254, 229, 0, 0.24), transparent 24%),
    radial-gradient(circle at 82% 16%, rgba(91, 77, 255, 0.18), transparent 22%),
    linear-gradient(180deg, #121826 0%, #0b1020 100%);
`;

const CallbackCard = styled(Card)`
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.28);

  .ant-card-body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px;
  }
`;

const StateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px 0;
  text-align: center;
`;

const StateText = styled.div`
  color: #111827;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Button)`
  && {
    background: #191600;
    border-color: #191600;
    box-shadow: none;
  }
`;

const SuccessIcon = styled(CheckCircleFilled)`
  font-size: 42px;
  color: #10b981;
`;

const ErrorIcon = styled(CloseCircleFilled)`
  font-size: 42px;
  color: #ef4444;
`;
