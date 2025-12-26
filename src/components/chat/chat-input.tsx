"use client";

import styled from "@emotion/styled";
import { Button, Input } from "antd";
import {
  PictureOutlined,
  CodeOutlined,
  AudioOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { KeyboardEvent, useState } from "react";

const { TextArea } = Input;

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (isSending || !value.trim() || disabled) return;
    setIsSending(true);
    onSend();
    // 다음 입력을 위해 잠시 후 플래그 해제
    setTimeout(() => {
      setIsSending(false);
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="반도체 시장의 HBM 트렌드에 대해 조사해줘"
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={disabled}
          style={{
            border: "none",
            boxShadow: "none",
            resize: "none",
            padding: "12px 0",
            fontSize: "16px",
          }}
        />
        <InputActions>
          <Button icon={<PictureOutlined />} type="text" size="small" />
          <Button icon={<CodeOutlined />} type="text" size="small" />
          <Button icon={<AudioOutlined />} type="text" size="small" />
          <SendButton
            icon={<SendOutlined />}
            type="primary"
            shape="circle"
            onClick={handleSend}
            disabled={!value.trim() || disabled || isSending}
          />
        </InputActions>
      </InputWrapper>
    </InputContainer>
  );
}

const InputContainer = styled.div`
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 12px 24px;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 1200px;
  margin: 0 auto;
`;

const InputActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const SendButton = styled(Button)`
  flex-shrink: 0;
`;
