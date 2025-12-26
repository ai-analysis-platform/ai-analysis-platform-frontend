"use client";

import styled from "@emotion/styled";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { chatMessagesState } from "@/core/state/app";
import MessageItem from "./message-item";

type MessageListProps = {
  onKeywordsConfirm: (selected: string[], additional: string) => void;
};

export default function MessageList({ onKeywordsConfirm }: MessageListProps) {
  const messages = useAtomValue(chatMessagesState);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <MessageListContainer ref={containerRef}>
      {messages.length === 0 && (
        <EmptyState>
          <p>안녕하세요! 요청사항을 입력해주세요.</p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            리포트 생성을 위해 키워드 선택과 데이터 분석을 도와드리겠습니다.
          </p>
        </EmptyState>
      )}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onKeywordsConfirm={onKeywordsConfirm}
        />
      ))}
    </MessageListContainer>
  );
}

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  padding-bottom: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: var(--muted);
  padding: 48px 24px;
  gap: 8px;
`;
