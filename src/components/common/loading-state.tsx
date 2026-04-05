"use client";

import styled from "@emotion/styled";
import { Spin, Typography } from "antd";

const { Text } = Typography;

type LoadingStateProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function LoadingState({
  title = "데이터를 불러오는 중입니다",
  description = "잠시만 기다려 주세요.",
  compact = false,
}: LoadingStateProps) {
  return (
    <LoadingCard $compact={compact}>
      <Spin size={compact ? "default" : "large"} />
      <LoadingCopy>
        <Text strong>{title}</Text>
        <Text type="secondary">{description}</Text>
      </LoadingCopy>
    </LoadingCard>
  );
}

type LoadingOverlayProps = LoadingStateProps & {
  visible: boolean;
};

export function LoadingOverlay({ visible, title, description }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Overlay>
      <LoadingState title={title} description={description} />
    </Overlay>
  );
}

const LoadingCard = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: ${({ $compact }) => ($compact ? "row" : "column")};
  align-items: center;
  justify-content: center;
  gap: ${({ $compact }) => ($compact ? "12px" : "16px")};
  width: 100%;
  min-height: ${({ $compact }) => ($compact ? "96px" : "220px")};
  padding: ${({ $compact }) => ($compact ? "20px" : "28px")};
  text-align: center;
  border: 1px solid rgba(127, 107, 255, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), #f8faff);
  box-shadow:
    0 14px 40px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
`;

const LoadingCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);

  @media (max-width: 768px) {
    align-items: flex-start;
    padding: 16px 16px 24px;
  }
`;
