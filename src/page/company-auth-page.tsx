"use client";

import styled from "@emotion/styled";
import { AutoComplete, Button, Card, Spin, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  searchCompanies,
  type DartCompanySearchItem,
} from "@/core/api/dart-search-company";
import { companyState, type Company } from "@/core/state/onboarding";
import { mockCompanies } from "@/core/mock/companies";
import AppShell from "@/components/layout/app-shell";

const { Title, Text } = Typography;

function dedupeCompanies(companies: DartCompanySearchItem[]) {
  const seen = new Set<string>();

  return companies.filter((company) => {
    const key = company.corp_name.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function CompanyAuthPage() {
  const router = useRouter();
  const [, setCompany] = useAtom(companyState);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const companyQuery = useQuery({
    queryKey: ["dart-search-company", debouncedQuery],
    queryFn: () => searchCompanies(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const searchableCompanies = useMemo(() => {
    const companies =
      companyQuery.data && companyQuery.data.length > 0
        ? companyQuery.data
        : companyQuery.error
          ? mockCompanies
              .filter((company) =>
                company.name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((company) => ({
                corp_name: company.name,
                corp_name_eng: company.englishName,
              }))
          : [];

    return dedupeCompanies(companies);
  }, [companyQuery.data, companyQuery.error, query]);

  const options = useMemo(() => {
    return searchableCompanies.map((company) => ({
      value: company.corp_name,
      label: (
        <OptionRow>
          <span>{company.corp_name}</span>
          <Text type="secondary">DART 검색 결과</Text>
        </OptionRow>
      ),
      company,
    }));
  }, [searchableCompanies]);

  const resolvedCompany = useMemo<Company | null>(() => {
    if (selectedCompany) return selectedCompany;

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return null;

    const matchedCompany = searchableCompanies.find(
      (company) => company.corp_name.trim() === trimmedQuery,
    );

    return {
      id: trimmedQuery,
      name: trimmedQuery,
      englishName: matchedCompany?.corp_name_eng ?? "",
      ceo: "",
    };
  }, [query, searchableCompanies, selectedCompany]);

  const handleConfirm = () => {
    if (!resolvedCompany) return;
    setCompany(resolvedCompany);
    router.push("/setup/keywords" as Route);
  };

  return (
    <AppShell>
      <Shell>
        <Backdrop />
        <Content>
          <Hero>
            <HeroLogo src="/logo.png" alt="NowWhat" width={321} height={68} priority />
            <HeroTitle>매일 우리 회사 관련 뉴스 받아보고 전략 점검하기</HeroTitle>
          </Hero>

          <CardWrapper>
            <CardBody>
              <SectionTitle>
                <Text strong style={{ fontSize: 16 }}>
                  우리 회사 인증
                </Text>
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
                    const selected =
                      (option as { company?: DartCompanySearchItem }).company ?? null;
                    setSelectedCompany(
                      selected
                        ? {
                            id: selected.corp_name,
                            name: selected.corp_name,
                            englishName: selected.corp_name_eng ?? "",
                            ceo: "",
                          }
                        : {
                            id: value,
                            name: value,
                            englishName: "",
                            ceo: "",
                          },
                    );
                  }}
                  onChange={(value) => {
                    setQuery(value);
                    setSelectedCompany(null);
                  }}
                  filterOption={false}
                  size="large"
                  notFoundContent={
                    companyQuery.isFetching ? (
                      <SearchStatus>
                        <Spin size="small" />
                      </SearchStatus>
                    ) : null
                  }
                />
                <Button
                  type="primary"
                  size="large"
                  disabled={!resolvedCompany}
                  onClick={handleConfirm}
                >
                  회사 검색
                </Button>
              </PickerRow>
              {companyQuery.error && (
                <Text type="danger">
                  회사 검색 API 호출 실패: {companyQuery.error.message}
                </Text>
              )}
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

  @media (max-width: 640px) {
    padding: 0;
  }
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 500px at 50% 0%, rgba(91, 77, 255, 0.18), transparent),
    radial-gradient(900px 500px at 0% 100%, rgba(16, 185, 129, 0.18), transparent),
    linear-gradient(180deg, #ffffff, #fafafa);
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  padding: 24px 8px 6px;
`;

const HeroLogo = styled(Image)`
  width: min(321px, 72vw);
  height: auto;
  margin: 0 auto;
`;

const HeroTitle = styled(Title)`
  && {
    margin: 0;
    font-size: clamp(18px, 3vw, 24px);
    line-height: 1.28;
    letter-spacing: -0.03em;
    text-wrap: balance;
    max-width: 32rem;
    margin-inline: auto;
  }
`;

const CardWrapper = styled(Card)`
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(17, 24, 39, 0.08),
    0 2px 8px rgba(17, 24, 39, 0.06);
  overflow: hidden;
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

const SearchStatus = styled.div`
  display: grid;
  place-items: center;
  padding: 12px;
`;
