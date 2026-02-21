"use client";

import styled from "@emotion/styled";
import dayjs from "dayjs";
import { InputNumber, TimePicker, Typography } from "antd";
import type { KeywordAlertFrequency } from "@/core/state/onboarding";

const { Text } = Typography;

type KeywordAlertFrequencyProps = {
  value: KeywordAlertFrequency;
  customDays: number;
  customTime: string;
  onChange: (next: KeywordAlertFrequency) => void;
  onCustomDaysChange: (days: number) => void;
  onCustomTimeChange: (time: string) => void;
};

const OPTIONS: Array<{
  value: KeywordAlertFrequency;
  label: string;
  description: string;
}> = [
  { value: "daily", label: "매일", description: "매일 오전에 키워드 뉴스 알림을 받아요." },
  { value: "weekday", label: "평일만", description: "월~금 오전에만 알림을 받아요." },
  { value: "weekly", label: "주 1회", description: "매주 월요일 오전에 주간 요약을 받아요." },
  { value: "custom", label: "기타", description: "원하는 주기로 며칠에 한 번 받을지 설정해요." },
];

export default function KeywordAlertFrequency({
  value,
  customDays,
  customTime,
  onChange,
  onCustomDaysChange,
  onCustomTimeChange,
}: KeywordAlertFrequencyProps) {
  const isCustom = value === "custom";
  const [hourRaw, minuteRaw] = customTime.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const timeValue = dayjs()
    .hour(Number.isFinite(hour) ? hour : 9)
    .minute(Number.isFinite(minute) ? minute : 0)
    .second(0);

  return (
    <Section>
      <Text strong style={{ fontSize: 16 }}>
        해당 키워드 알림 주기
      </Text>
      <Grid>
        {OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            type="button"
            $active={option.value === value}
            onClick={() => onChange(option.value)}
          >
            <OptionLabel>{option.label}</OptionLabel>
            <OptionDescription>{option.description}</OptionDescription>
          </OptionButton>
        ))}
      </Grid>
      {isCustom && (
        <CustomRow>
          <CustomTextWrap>
            <InputNumber
              min={1}
              max={30}
              value={customDays}
              onChange={(next) => onCustomDaysChange(Number(next ?? 1))}
            />
            <Text style={{ whiteSpace: "nowrap" }}>일에 한 번 뉴스 받기</Text>
          </CustomTextWrap>
          <TimeWrap>
            <TimeLabel>시간</TimeLabel>
            <TimePicker
              size="small"
              format="HH:mm"
              minuteStep={10}
              value={timeValue}
              onChange={(_, timeString) =>
                onCustomTimeChange(typeof timeString === "string" && timeString ? timeString : "09:00")
              }
              allowClear={false}
            />
          </TimeWrap>
        </CustomRow>
      )}
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.6) 0%, rgba(255, 255, 255, 1) 100%);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const CustomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 4px 2px;
`;

const CustomTextWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimeLabel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const OptionButton = styled.button<{ $active: boolean }>`
  text-align: left;
  border: 1px solid ${({ $active }) => ($active ? "var(--accent)" : "rgba(148, 163, 184, 0.5)")};
  background: ${({ $active }) => ($active ? "rgba(239, 246, 255, 0.9)" : "#ffffff")};
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--accent);
  }
`;

const OptionLabel = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const OptionDescription = styled.span`
  font-size: 13px;
  line-height: 1.4;
  color: #475569;
`;
