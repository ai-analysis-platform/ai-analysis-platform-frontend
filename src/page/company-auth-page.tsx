"use client";

import styled from "@emotion/styled";
import { AutoComplete, Button, Card, Divider, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useAtom } from "jotai";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { companyState } from "@/core/state/onboarding";
import { mockCompanies } from "@/core/mock/companies";
import AppShell from "@/components/layout/app-shell";

const { Title, Text } = Typography;

export default function CompanyAuthPage() {
  const router = useRouter();
  const [, setCompany] = useAtom(companyState);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const options = useMemo(() => {
    const filtered = query
      ? mockCompanies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      : mockCompanies;

    return filtered.map((c) => ({
      value: c.name,
      label: (
        <OptionRow>
          <span>{c.name}</span>
          <Text type="secondary">대표: {c.ceo}</Text>
        </OptionRow>
      ),
      companyId: c.id,
    }));
  }, [query]);

  const selectedCompany = useMemo(
    () => mockCompanies.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  const handleConfirm = () => {
    if (!selectedCompany) return;
    setCompany(selectedCompany);
    router.push("/setup/keywords" as Route);
  };

  return (
    <AppShell>
      <Shell>
        <Backdrop />
        <Content>
          <Hero>
            <Title level={2} style={{ margin: 0 }}>
              매일 우리 회사 관련 뉴스 받아보고 전략 점검하기
            </Title>
            <Text type="secondary">
              지금은 프론트엔드 목데이터로 동작합니다. API 연동은 나중에 붙일 수 있어요.
            </Text>
          </Hero>

          <CardWrapper>
            <CardBody>
              <SectionTitle>
                <Text strong style={{ fontSize: 16 }}>
                  우리 회사 인증
                </Text>
                <Text type="secondary">회사명을 선택하면 다음 단계로 진행합니다.</Text>
              </SectionTitle>

              <PickerRow>
                <AutoComplete
                  style={{ width: "100%" }}
                  options={options}
                  placeholder="우리 회사명 입력하기"
                  value={query}
                  onSearch={(v) => setQuery(v)}
                  onSelect={(value, option) => {
                    setQuery(value);
                    setSelectedId((option as { companyId?: string }).companyId ?? null);
                  }}
                  onChange={(value) => {
                    setQuery(value);
                    setSelectedId(null);
                  }}
                  filterOption={false}
                  size="large"
                />
                <Button
                  type="primary"
                  size="large"
                  disabled={!selectedCompany}
                  onClick={handleConfirm}
                >
                  인증하기
                </Button>
              </PickerRow>

              <Divider style={{ margin: "16px 0" }} />
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                <Text type="secondary">예시 회사 목록</Text>
                <MiniTable>
                  {mockCompanies.slice(0, 2).map((c) => (
                    <MiniRow key={c.id}>
                      <span>{c.name}</span>
                      <Text type="secondary">대표: {c.ceo}</Text>
                    </MiniRow>
                  ))}
                </MiniTable>
              </Space>
            </CardBody>
          </CardWrapper>
        </Content>
      </Shell>
    </AppShell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 16px;
  position: relative;
  overflow: hidden;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 500px at 50% 0%, rgba(127, 107, 255, 0.22), transparent),
    radial-gradient(900px 500px at 0% 100%, rgba(16, 185, 129, 0.18), transparent),
    linear-gradient(180deg, #ffffff, #fafafa);
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  max-width: 980px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  padding: 12px 8px;
`;

const CardWrapper = styled(Card)`
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(17, 24, 39, 0.08),
    0 2px 8px rgba(17, 24, 39, 0.06);
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PickerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    > button {
      width: 100%;
    }
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const MiniTable = styled.div`
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
`;

const MiniRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  border-top: 1px solid var(--card-border);

  &:first-of-type {
    border-top: none;
  }
`;
