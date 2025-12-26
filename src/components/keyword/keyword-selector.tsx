"use client";

import styled from "@emotion/styled";
import { Button, Input } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

type KeywordSelectorProps = {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onAdditionalKeywordsChange: (keywords: string) => void;
  additionalKeywords: string;
  onConfirm: () => void;
};

const availableKeywords = [
  "삼성전자",
  "마이크론",
  "GPU 수요",
  "HBM4",
  "SK하이닉스",
  "HBM3E",
  "AI 데이터센터",
];

export default function KeywordSelector({
  selectedKeywords,
  onKeywordsChange,
  onAdditionalKeywordsChange,
  additionalKeywords,
  onConfirm,
}: KeywordSelectorProps) {
  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter((k) => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  return (
    <KeywordSection>
      <SectionTitle>아래 키워드 중 선택하세요</SectionTitle>
      <KeywordList>
        {availableKeywords.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword);
          return (
            <KeywordTag
              key={keyword}
              $isSelected={isSelected}
              onClick={() => toggleKeyword(keyword)}
            >
              {isSelected && <CheckCircleOutlined style={{ marginRight: 4 }} />}
              {keyword}
            </KeywordTag>
          );
        })}
      </KeywordList>

      <AdditionalSection>
        <Label>추가할 키워드</Label>
        <TextArea
          value={additionalKeywords}
          onChange={(e) => onAdditionalKeywordsChange(e.target.value)}
          placeholder="엔비디아, AMD"
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
          }}
        />
      </AdditionalSection>

      <ConfirmButton type="primary" onClick={onConfirm}>
        확인
      </ConfirmButton>
    </KeywordSection>
  );
}

const KeywordSection = styled.section`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
`;

const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordTag = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? "#7f6bff" : "#e5e7eb")};
  border-radius: 20px;
  background: ${({ $isSelected }) => ($isSelected ? "#7f6bff" : "#ffffff")};
  color: ${({ $isSelected }) => ($isSelected ? "#ffffff" : "#111827")};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #7f6bff;
    background: ${({ $isSelected }) => ($isSelected ? "#7f6bff" : "#f3f4f6")};
  }
`;

const AdditionalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
`;

const ConfirmButton = styled(Button)`
  align-self: flex-end;
  padding: 12px 32px;
  height: auto;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
`;
