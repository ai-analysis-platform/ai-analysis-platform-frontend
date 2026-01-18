"use client";

import styled from "@emotion/styled";
import { Badge, Button, Card, Divider, Input, Space, Steps, Tag, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { companyState, keywordSelectionState } from "@/core/state/onboarding";
import AppShell from "@/components/layout/app-shell";

const { Title, Text } = Typography;

const INDUSTRIES = ["DRAM", "NAND", "Logic", "Foundry", "패키징", "AI 데이터센터"];
const COMPETITORS = ["SK하이닉스", "마이크론", "TSMC", "퀄컴", "엔비디아", "AMD"];

export default function KeywordSetupPage() {
  const router = useRouter();
  const company = useAtomValue(companyState);
  const [selection, setSelection] = useAtom(keywordSelectionState);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");

  const filteredIndustries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INDUSTRIES;
    return INDUSTRIES.filter((k) => k.toLowerCase().includes(q));
  }, [search]);

  const filteredCompetitors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COMPETITORS;
    return COMPETITORS.filter((k) => k.toLowerCase().includes(q));
  }, [search]);

  const toggle = (key: "industries" | "competitors", value: string) => {
    setSelection((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((k) => k !== value) : [...prev[key], value],
      };
    });
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    setSelection((prev) => {
      if (prev.custom.includes(trimmed)) return prev;
      return { ...prev, custom: [...prev.custom, trimmed] };
    });
    setCustomInput("");
  };

  const removeCustom = (value: string) => {
    setSelection((prev) => ({ ...prev, custom: prev.custom.filter((k) => k !== value) }));
  };

  const canContinue =
    selection.industries.length + selection.competitors.length + selection.custom.length >
    0;

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

            {/* <Input
              size="large"
              placeholder="키워드 검색"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            /> */}

            <Grid>
              <Card
                title={
                  <TitleRow>
                    <span>산업군</span>
                    <Badge count={selection.industries.length} showZero />
                  </TitleRow>
                }
                styles={{ body: { padding: 16 } }}
              >
                <TagGrid>
                  {filteredIndustries.map((k) => {
                    const selected = selection.industries.includes(k);
                    return (
                      <SelectTag
                        key={k}
                        color={selected ? "geekblue" : "default"}
                        onClick={() => toggle("industries", k)}
                      >
                        {k}
                      </SelectTag>
                    );
                  })}
                </TagGrid>
              </Card>

              <Card
                title={
                  <TitleRow>
                    <span>경쟁사</span>
                    <Badge count={selection.competitors.length} showZero />
                  </TitleRow>
                }
                styles={{ body: { padding: 16 } }}
              >
                <TagGrid>
                  {filteredCompetitors.map((k) => {
                    const selected = selection.competitors.includes(k);
                    return (
                      <SelectTag
                        key={k}
                        color={selected ? "geekblue" : "default"}
                        onClick={() => toggle("competitors", k)}
                      >
                        {k}
                      </SelectTag>
                    );
                  })}
                </TagGrid>
              </Card>
            </Grid>

            <Divider style={{ margin: "4px 0" }} />

            <CustomRow>
              <Input
                size="large"
                value={customInput}
                placeholder="추가 키워드 입력 (예: 정책, 공급망, 환율)"
                onChange={(e) => setCustomInput(e.target.value)}
                onPressEnter={addCustom}
              />
              <Button size="large" icon={<PlusOutlined />} onClick={addCustom}>
                추가
              </Button>
            </CustomRow>

            {selection.custom.length > 0 && (
              <TagGrid>
                {selection.custom.map((k) => (
                  <Tag key={k} closable onClose={() => removeCustom(k)} color="purple">
                    {k}
                  </Tag>
                ))}
              </TagGrid>
            )}

            <FooterRow>
              <Button onClick={() => router.push("/" as Route)}>이전</Button>
              <Button
                type="primary"
                disabled={!canContinue || !company}
                onClick={() => router.push("/daily" as Route)}
              >
                데일리 뉴스 보기
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
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 860px) {
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
