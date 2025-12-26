"use client";

import styled from "@emotion/styled";
import { Avatar, Typography } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { ChatMessage } from "@/core/state/app";
import { useAtomValue } from "jotai";
import { reportsState } from "@/core/state/report";
import KeywordSelector from "@/components/keyword/keyword-selector";
import ReportPreview from "@/components/report/report-preview";
import { useState } from "react";

const { Paragraph } = Typography;

type MessageItemProps = {
  message: ChatMessage;
  onKeywordsConfirm: (selected: string[], additional: string) => void;
};

export default function MessageItem({ message, onKeywordsConfirm }: MessageItemProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([
    "삼성전자",
    "마이크론",
    "GPU 수요",
  ]);
  const [additionalKeywords, setAdditionalKeywords] = useState("엔비디아, AMD");
  const reports = useAtomValue(reportsState);

  if (message.type === "keyword-selection") {
    return (
      <MessageContainer $isUser={false}>
        <Avatar
          icon={<RobotOutlined />}
          style={{
            backgroundColor: "#10b981",
            flexShrink: 0,
          }}
        />
        <MessageContent $isUser={false}>
          <KeywordSelector
            selectedKeywords={selectedKeywords}
            onKeywordsChange={setSelectedKeywords}
            additionalKeywords={additionalKeywords}
            onAdditionalKeywordsChange={setAdditionalKeywords}
            onConfirm={() => onKeywordsConfirm(selectedKeywords, additionalKeywords)}
          />
        </MessageContent>
      </MessageContainer>
    );
  }

  if (message.type === "report-preview" && message.reportId) {
    const report = reports.find((r) => r.id === message.reportId);
    if (report) {
      return (
        <MessageContainer $isUser={false}>
          <Avatar
            icon={<RobotOutlined />}
            style={{
              backgroundColor: "#10b981",
              flexShrink: 0,
            }}
          />
          <MessageContent $isUser={false}>
            <ReportPreview report={report} onEdit={() => {}} />
          </MessageContent>
        </MessageContainer>
      );
    }
  }

  const isUser = message.type === "user";

  return (
    <MessageContainer $isUser={isUser}>
      <Avatar
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? "#7f6bff" : "#10b981",
          flexShrink: 0,
        }}
      />
      <MessageContent $isUser={isUser}>
        {message.content && (
          <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {message.content}
          </Paragraph>
        )}
      </MessageContent>
    </MessageContainer>
  );
}

const MessageContainer = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  align-items: flex-start;
  background: ${({ $isUser }) => ($isUser ? "transparent" : "#f9fafb")};

  &:hover {
    background: ${({ $isUser }) => ($isUser ? "#f9fafb" : "#f3f4f6")};
  }
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  flex: 1;
  max-width: 100%;
  color: var(--foreground);
  line-height: 1.6;
`;
