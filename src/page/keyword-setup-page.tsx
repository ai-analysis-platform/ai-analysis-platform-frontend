"use client";

import styled from "@emotion/styled";
import { Button, Card, Input, Space, Steps, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import KeywordAlertFrequency from "@/components/keyword/keyword-alert-frequency";
import { getOrCreateNewsKeywordSessionId } from "@/core/api/news-session";
import { fetchNewsKeywords, normalizeKeywordSelection } from "@/core/api/news-keyword";
import {
  companyState,
  keywordAlertCustomDaysState,
  keywordAlertCustomTimeState,
  keywordAlertFrequencyState,
  keywordSelectionState,
} from "@/core/state/onboarding";
import AppShell from "@/components/layout/app-shell";

const { Title, Text } = Typography;

const INDUSTRY_POOL = [
  "DRAM",
  "NAND",
  "Logic",
  "Foundry",
  "패키징",
  "AI 데이터센터",
  "HBM",
  "DDR5",
  "CXL",
  "EUV",
  "칩렛",
  "EDA",
  "파운드리 수율",
  "고대역폭 인터커넥트",
  "전력반도체",
  "차량용 반도체",
  "엣지 AI",
];

const COMPETITOR_POOL = [
  "SK하이닉스",
  "마이크론",
  "TSMC",
  "퀄컴",
  "엔비디아",
  "AMD",
  "인텔",
  "브로드컴",
  "애플",
  "구글",
  "아마존",
  "메타",
  "삼성전자",
  "ASML",
  "ARM",
  "텍사스인스트루먼트",
];

const MACRO_POOL = [
  "정부 규제",
  "지정학 리스크",
  "환율",
  "금리",
  "원자재",
  "공급망",
  "관세",
  "수출 규제",
  "중국 리스크",
  "인플레이션",
  "리세션",
  "에너지 가격",
  "물류 비용",
  "반독점",
  "국가 보조금",
  "환경 규제",
];

type KeywordCategoryKey = "industries" | "competitors" | "macros";

const CATEGORY_LABEL: Record<KeywordCategoryKey, string> = {
  industries: "산업군",
  competitors: "경쟁사",
  macros: "매크로 환경",
};

const CATEGORY_POOL: Record<KeywordCategoryKey, string[]> = {
  industries: INDUSTRY_POOL,
  competitors: COMPETITOR_POOL,
  macros: MACRO_POOL,
};

const DEFAULT_VISIBLE = 10;
const RECOMMEND_STEP = 5;
export default function KeywordSetupPage() {
  const router = useRouter();
  const company = useAtomValue(companyState);
  const [selection, setSelection] = useAtom(keywordSelectionState);
  const [alertFrequency, setAlertFrequency] = useAtom(keywordAlertFrequencyState);
  const [alertCustomDays, setAlertCustomDays] = useAtom(keywordAlertCustomDaysState);
  const [alertCustomTime, setAlertCustomTime] = useAtom(keywordAlertCustomTimeState);
  const [visibleCount, setVisibleCount] = useState<Record<KeywordCategoryKey, number>>({
    industries: DEFAULT_VISIBLE,
    competitors: DEFAULT_VISIBLE,
    macros: DEFAULT_VISIBLE,
  });
  const [customInput, setCustomInput] = useState<Record<KeywordCategoryKey, string>>({
    industries: "",
    competitors: "",
    macros: "",
  });
  const [noMore, setNoMore] = useState<Record<KeywordCategoryKey, boolean>>({
    industries: false,
    competitors: false,
    macros: false,
  });

  const keywordQuery = useQuery({
    queryKey: ["news-keywords", company?.name],
    queryFn: () => {
      const sessionId = getOrCreateNewsKeywordSessionId();
      return fetchNewsKeywords({
        query: (company?.name ?? "").trim(),
        days_back: 7,
        max_articles: 10,
        language: "ko",
        session_id: sessionId,
      });
    },
    enabled: Boolean(company?.name),
  });

  useEffect(() => {
    if (!keywordQuery.data) return;

    const normalized = normalizeKeywordSelection(keywordQuery.data);
    const nextPool: Record<KeywordCategoryKey, string[]> = {
      industries:
        normalized.industries.length > 0
          ? normalized.industries
          : CATEGORY_POOL.industries,
      competitors:
        normalized.competitors.length > 0
          ? normalized.competitors
          : CATEGORY_POOL.competitors,
      macros: normalized.macros.length > 0 ? normalized.macros : CATEGORY_POOL.macros,
    };

    setSelection((prev) => {
      const isSelectionEmpty =
        prev.industries.length === 0 &&
        prev.competitors.length === 0 &&
        prev.macros.length === 0;
      if (!isSelectionEmpty) return prev;
      return {
        ...prev,
        industries: nextPool.industries.slice(0, DEFAULT_VISIBLE),
        competitors: nextPool.competitors.slice(0, DEFAULT_VISIBLE),
        macros: nextPool.macros.slice(0, DEFAULT_VISIBLE),
      };
    });
  }, [keywordQuery.data, setSelection]);

  const normalizedKeywords = keywordQuery.data
    ? normalizeKeywordSelection(keywordQuery.data)
    : null;
  const shouldHideDefaultsWhileLoading =
    Boolean(company) && keywordQuery.isLoading && !keywordQuery.data;
  const categoryPool: Record<KeywordCategoryKey, string[]> = {
    industries: shouldHideDefaultsWhileLoading
      ? []
      : normalizedKeywords?.industries.length
        ? normalizedKeywords.industries
        : CATEGORY_POOL.industries,
    competitors: shouldHideDefaultsWhileLoading
      ? []
      : normalizedKeywords?.competitors.length
        ? normalizedKeywords.competitors
        : CATEGORY_POOL.competitors,
    macros: shouldHideDefaultsWhileLoading
      ? []
      : normalizedKeywords?.macros.length
        ? normalizedKeywords.macros
        : CATEGORY_POOL.macros,
  };

  const toggle = (key: KeywordCategoryKey, value: string) => {
    setSelection((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((k) => k !== value) : [...prev[key], value],
      };
    });
  };

  const addCustom = (key: KeywordCategoryKey) => {
    const raw = customInput[key];
    const nextValues = raw
      .split(/[,\n]/g)
      .map((v) => v.trim())
      .filter(Boolean);
    if (nextValues.length === 0) return;

    setSelection((prev) => {
      const existing = new Set(prev[key]);
      const merged = [...prev[key]];
      for (const value of nextValues) {
        if (existing.has(value)) continue;
        merged.push(value);
        existing.add(value);
      }
      return { ...prev, [key]: merged };
    });
    setCustomInput((prev) => ({ ...prev, [key]: "" }));
  };

  const removeCustom = (key: KeywordCategoryKey, value: string) => {
    setSelection((prev) => ({ ...prev, [key]: prev[key].filter((k) => k !== value) }));
  };

  const canContinue =
    selection.industries.length + selection.competitors.length + selection.macros.length >
    0;

  const handleRecommendMore = (key: KeywordCategoryKey) => {
    const pool = categoryPool[key];
    const next = Math.min(pool.length, visibleCount[key] + RECOMMEND_STEP);
    setVisibleCount((prev) => ({ ...prev, [key]: next }));
    setNoMore((prev) => ({ ...prev, [key]: next >= pool.length }));
  };

  return (
    <AppShell>
      <Container>
        <TopBar>
          <div>
            <Title level={3} style={{ margin: 0, whiteSpace: "nowrap" }}>
              키워드 선택하기
            </Title>
            <Text type="secondary">
              {company ? `${company.name} 기준` : "회사 인증 후 진행하는 단계입니다."}
            </Text>
          </div>
          <Steps
            size="small"
            current={1}
            items={[
              { title: "회사 인증" },
              { title: "키워드 선택" },
              { title: "데일리 뉴스" },
            ]}
          />
        </TopBar>

        <CardWrapper>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {!company && (
              <Banner>
                <Text>
                  먼저 회사 인증이 필요합니다.{" "}
                  <BannerLink onClick={() => router.push("/" as Route)}>
                    회사 선택으로 이동
                  </BannerLink>
                </Text>
              </Banner>
            )}
            {company && keywordQuery.isLoading && (
              <Text type="secondary">추천 키워드를 불러오는 중입니다...</Text>
            )}
            {company && keywordQuery.error && (
              <Text type="danger">
                키워드 API 호출 실패: {keywordQuery.error.message} (기본 키워드로 표시 중)
              </Text>
            )}

            <Grid>
              {(
                [
                  { key: "industries", pool: categoryPool.industries },
                  { key: "competitors", pool: categoryPool.competitors },
                  { key: "macros", pool: categoryPool.macros },
                ] as const
              ).map(({ key, pool }) => {
                const visible = pool.slice(0, visibleCount[key]);
                const selected = selection[key];
                const displayKeywords = [
                  ...visible,
                  ...selected.filter((v) => !visible.includes(v)),
                ];
                const isExhausted = visibleCount[key] >= pool.length;

                return (
                  <Card
                    key={key}
                    title={
                      <TitleRow>
                        <span>{CATEGORY_LABEL[key]}</span>
                        <Button
                          size="small"
                          type="primary"
                          ghost
                          disabled={isExhausted}
                          onClick={() => {
                            if (isExhausted) {
                              setNoMore((prev) => ({ ...prev, [key]: true }));
                              return;
                            }
                            handleRecommendMore(key);
                          }}
                        >
                          <span>더 추천 받기</span>
                        </Button>
                      </TitleRow>
                    }
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      <TagGrid>
                        {displayKeywords.map((k) => {
                          const isSelected = selected.includes(k);
                          const isCustom = !pool.includes(k);
                          if (isCustom) {
                            return (
                              <Tag
                                key={`${key}-${k}`}
                                closable
                                onClose={() => removeCustom(key, k)}
                                color="purple"
                              >
                                {k}
                              </Tag>
                            );
                          }
                          return (
                            <SelectTag
                              key={`${key}-${k}`}
                              color={isSelected ? "geekblue" : "default"}
                              onClick={() => toggle(key, k)}
                            >
                              {k}
                            </SelectTag>
                          );
                        })}
                      </TagGrid>

                      {noMore[key] && isExhausted && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          더 이상 추천할 키워드가 없습니다.
                        </Text>
                      )}

                      <CustomRow>
                        <Input
                          size="large"
                          value={customInput[key]}
                          placeholder="추가 키워드 입력 (예: 정책, 공급망, 환율)"
                          onChange={(e) =>
                            setCustomInput((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          onPressEnter={() => addCustom(key)}
                        />
                        <Button
                          size="large"
                          icon={<PlusOutlined />}
                          onClick={() => addCustom(key)}
                        >
                          추가
                        </Button>
                      </CustomRow>
                    </Space>
                  </Card>
                );
              })}
            </Grid>
            <KeywordAlertFrequency
              value={alertFrequency}
              customDays={alertCustomDays}
              customTime={alertCustomTime}
              onChange={setAlertFrequency}
              onCustomDaysChange={setAlertCustomDays}
              onCustomTimeChange={setAlertCustomTime}
            />

            <FooterRow>
              <Button onClick={() => router.push("/" as Route)}>이전</Button>
              <Button
                type="primary"
                disabled={!canContinue || !company}
                onClick={() => router.push("/daily" as Route)}
              >
                NowWhat 시작
              </Button>
            </FooterRow>
          </Space>
        </CardWrapper>
      </Container>
    </AppShell>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  font-size: 18px;
  --ant-font-size: 18px;
  --ant-font-size-sm: 16px;
  --ant-font-size-lg: 20px;
`;

const TopBar = styled.div`
  margin: 0 0 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CardWrapper = styled(Card)`
  border-radius: 16px;
  border: 1px solid var(--card-border);
  box-shadow:
    0 12px 40px rgba(17, 24, 39, 0.06),
    0 2px 8px rgba(17, 24, 39, 0.06);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectTag = styled(Tag)`
  user-select: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 4px 10px;
`;

const CustomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    > button {
      width: 100%;
    }
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const Banner = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.08);
`;

const BannerLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  text-decoration: underline;
`;
