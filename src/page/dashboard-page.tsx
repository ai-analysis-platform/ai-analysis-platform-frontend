"use client";

import styled from "@emotion/styled";
import {
  ArrowUpOutlined,
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input, Progress } from "antd";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { mockDailyNews } from "@/core/mock/daily-news";
import {
  companyState,
  keywordAlertCustomDaysState,
  keywordAlertCustomTimeState,
  keywordAlertFrequencyState,
  keywordSelectionState,
} from "@/core/state/onboarding";
import { reportsState } from "@/core/state/report";

type Tone = "violet" | "mint" | "gold" | "slate";

type SummaryMetric = {
  icon: React.ReactNode;
  tone: Tone;
  label: string;
  value: string;
  note: string;
};

type RecentReport = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
};

function getAlertLabel(frequency: string, customDays: number, customTime: string) {
  if (frequency === "daily") return `매일 ${customTime}`;
  if (frequency === "weekday") return `평일 ${customTime}`;
  if (frequency === "weekly") return `매주 1회 ${customTime}`;
  return `${customDays}일마다 ${customTime}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const company = useAtomValue(companyState);
  const reports = useAtomValue(reportsState);
  const keywordSelection = useAtomValue(keywordSelectionState);
  const alertFrequency = useAtomValue(keywordAlertFrequencyState);
  const alertCustomDays = useAtomValue(keywordAlertCustomDaysState);
  const alertCustomTime = useAtomValue(keywordAlertCustomTimeState);

  const keywordCount =
    keywordSelection.industries.length +
    keywordSelection.competitors.length +
    keywordSelection.macros.length;

  const domesticNewsCount = useMemo(
    () => mockDailyNews.filter((item) => item.locale !== "ENG").length,
    [],
  );
  const globalNewsCount = useMemo(
    () => mockDailyNews.filter((item) => item.locale === "ENG").length || 6,
    [],
  );

  const summaryMetrics = useMemo<SummaryMetric[]>(
    () => [
      {
        icon: <CalendarOutlined />,
        tone: "violet",
        label: "이번 주 포착 뉴스",
        value: `${domesticNewsCount + globalNewsCount}건`,
        note: company
          ? `${company.name} 기준 기사 흐름을 요약합니다.`
          : "국내외 기사와 산업 키워드 흐름을 함께 집계합니다.",
      },
      {
        icon: <GlobalOutlined />,
        tone: "mint",
        label: "관심 키워드 커버리지",
        value: `${keywordCount > 0 ? keywordCount : 9}개`,
        note:
          keywordCount > 0
            ? "현재 선택한 키워드 기준으로 분석 범위를 계산했습니다."
            : "키워드 설정 전 기본 템플릿 범위를 표시합니다.",
      },
      {
        icon: <FileTextOutlined />,
        tone: "gold",
        label: "생성된 분석 리포트",
        value: `${reports.length > 0 ? reports.length : 5}개`,
        note:
          reports.length > 0
            ? "대화에서 생성한 리포트를 이어서 수정할 수 있습니다."
            : "최근 분석 리포트 샘플과 템플릿을 바로 열 수 있습니다.",
      },
    ],
    [company, domesticNewsCount, globalNewsCount, keywordCount, reports.length],
  );

  const recentReports = useMemo<RecentReport[]>(() => {
    if (reports.length > 0) {
      return reports
        .slice()
        .sort((left, right) => right.updatedAt - left.updatedAt)
        .slice(0, 3)
        .map((report) => ({
          id: report.id,
          title: report.title,
          subtitle: `${new Date(report.updatedAt).toLocaleDateString("ko-KR")} 업데이트`,
          tag: report.keywords[0] ?? "분석 리포트",
        }));
    }

    return [
      {
        id: "sample-1",
        title: "Samsung Electronics - AI/HBM",
        subtitle: "시장 점유율, 고객사 수요, 공급능력 요약",
        tag: "HBM",
      },
      {
        id: "sample-2",
        title: "Tesla - 가격 전략",
        subtitle: "EV 가격 인하와 배터리 공급망 영향 정리",
        tag: "가격 전략",
      },
      {
        id: "sample-3",
        title: "NVIDIA - 공급망 최적화",
        subtitle: "패키징 병목과 서버 수요 리스크 점검",
        tag: "공급망",
      },
    ];
  }, [reports]);

  const coverageItems = useMemo(
    () => [
      {
        label: "산업군",
        percent: keywordSelection.industries.length > 0 ? 72 : 58,
        tone: "violet" as Tone,
      },
      {
        label: "경쟁사",
        percent: keywordSelection.competitors.length > 0 ? 64 : 42,
        tone: "gold" as Tone,
      },
      {
        label: "매크로",
        percent: keywordSelection.macros.length > 0 ? 49 : 24,
        tone: "slate" as Tone,
      },
    ],
    [
      keywordSelection.competitors.length,
      keywordSelection.industries.length,
      keywordSelection.macros.length,
    ],
  );

  const alertLabel = getAlertLabel(alertFrequency, alertCustomDays, alertCustomTime);
  const leadNews = mockDailyNews[0];

  return (
    <AppShell>
      <DashboardRoot>
        <AmbientGlow />
        <Container>
          <TopBar>
            <SearchWrap>
              <DashboardSearch
                size="large"
                placeholder="회사, 전략 주제, 리포트, 뉴스 검색"
                prefix={<SearchOutlined />}
              />
            </SearchWrap>

            <TopActions>
              <Button icon={<BellOutlined />} />
              <PrimaryAction
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/company" as Route)}
              >
                분석 시작하기
              </PrimaryAction>
              <ProfileCard>
                <Avatar size={42}>CA</Avatar>
                <ProfileText>
                  <strong>Chief Analyst</strong>
                  <span>Strategic Intel Team</span>
                </ProfileText>
              </ProfileCard>
            </TopActions>
          </TopBar>

          <Hero>
            <HeroCopy>
              <Eyebrow>Intelligence Dashboard</Eyebrow>
              <HeroTitle>My Dashboard</HeroTitle>
              <HeroDescription>
                실시간 시장 동향, 최근 생성 리포트, 키워드 커버리지와 전략 시사점을 빠르게
                훑을 수 있도록 구성했습니다.
              </HeroDescription>
            </HeroCopy>

            <HeroActions>
              <GhostAction onClick={() => router.push("/setup/keywords" as Route)}>
                키워드 설정
              </GhostAction>
              <PrimaryAction
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => router.push("/daily" as Route)}
              >
                데일리 뉴스 보기
              </PrimaryAction>
            </HeroActions>
          </Hero>

          <SectionLabel>ACTIVITY OF THIS WEEK</SectionLabel>

          <SummaryGrid>
            {summaryMetrics.map((metric, index) => (
              <SummaryCard key={metric.label} $tone={metric.tone}>
                <SummaryHeader>
                  <MetricIcon $tone={metric.tone}>{metric.icon}</MetricIcon>
                  {index === 0 ? (
                    <SummaryDelta>
                      <ArrowUpOutlined />
                      24%
                    </SummaryDelta>
                  ) : index === 1 ? (
                    <MetricSideNote>실시간 업데이트</MetricSideNote>
                  ) : (
                    <MetricSideNote>전략 고도화 중</MetricSideNote>
                  )}
                </SummaryHeader>
                <MetricValue>{metric.value}</MetricValue>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricNote>{metric.note}</MetricNote>
                {index === 0 ? (
                  <ActivityBars>
                    {[36, 50, 34, 62, 40, 70, 54].map((height, barIndex) => (
                      <Bar key={barIndex} style={{ height }} />
                    ))}
                  </ActivityBars>
                ) : index === 1 ? (
                  <Progress
                    percent={74}
                    showInfo={false}
                    strokeColor="#18b6a3"
                    trailColor="rgba(24, 182, 163, 0.12)"
                  />
                ) : (
                  <KeywordRow>
                    {[
                      keywordSelection.industries[0] ?? "AI/HBM",
                      keywordSelection.competitors[0] ?? "TSMC",
                      keywordSelection.macros[0] ?? "수출 규제",
                    ].map((label) => (
                      <KeywordPill key={label}>{label}</KeywordPill>
                    ))}
                  </KeywordRow>
                )}
              </SummaryCard>
            ))}
          </SummaryGrid>

          <MainGrid>
            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Recent Works</PanelTitle>
                  <PanelSubtitle>
                    최근 생성했거나 이어서 볼 수 있는 분석 리포트입니다.
                  </PanelSubtitle>
                </div>
                <InlineLink onClick={() => router.push("/daily" as Route)}>
                  전체 보기
                </InlineLink>
              </PanelHeader>

              <ReportList>
                {recentReports.map((report) => (
                  <ReportItem key={report.id}>
                    <ReportIdentity>
                      <MetricIcon $tone="violet">
                        <FileTextOutlined />
                      </MetricIcon>
                      <ReportText>
                        <strong>{report.title}</strong>
                        <span>{report.subtitle}</span>
                      </ReportText>
                    </ReportIdentity>
                    <ReportMeta>
                      <StatusPill $tone="violet">{report.tag}</StatusPill>
                      <GhostMiniButton onClick={() => router.push("/daily" as Route)}>
                        보러가기
                      </GhostMiniButton>
                    </ReportMeta>
                  </ReportItem>
                ))}
              </ReportList>
            </Panel>

            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Coverage Map</PanelTitle>
                  <PanelSubtitle>
                    현재 설정된 키워드 기준으로 분석 범위를 표시합니다.
                  </PanelSubtitle>
                </div>
              </PanelHeader>
              <CoverageList>
                {coverageItems.map((item) => (
                  <CoverageRow key={item.label}>
                    <CoverageLine>
                      <span>{item.label}</span>
                      <strong>{item.percent}%</strong>
                    </CoverageLine>
                    <TinyProgress
                      percent={item.percent}
                      showInfo={false}
                      $tone={item.tone}
                    />
                  </CoverageRow>
                ))}
              </CoverageList>
            </Panel>
          </MainGrid>

          <BottomGrid>
            <Panel>
              <PanelHeader>
                <div>
                  <PanelTitle>Today&apos;s News Focus</PanelTitle>
                  <PanelSubtitle>
                    데일리 브리핑에서 우선 확인할 이슈를 먼저 보여줍니다.
                  </PanelSubtitle>
                </div>
              </PanelHeader>

              <NewsFocusCard>
                <FocusHeader>
                  <StatusPill $tone="mint">{leadNews.source}</StatusPill>
                  <FocusMeta>{alertLabel} 브리핑 발송</FocusMeta>
                </FocusHeader>
                <FocusTitle>{leadNews.title}</FocusTitle>
                <FocusBullets>
                  {leadNews.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </FocusBullets>
                <KeywordRow>
                  {leadNews.tags.slice(0, 4).map((tag) => (
                    <KeywordPill key={tag}>{tag}</KeywordPill>
                  ))}
                </KeywordRow>
              </NewsFocusCard>
            </Panel>

            <ActionPanel>
              <ActionHeader>
                <div>
                  <PanelTitle>Next Actions</PanelTitle>
                  <PanelSubtitle>
                    오늘 바로 이어서 할 수 있는 분석 작업입니다.
                  </PanelSubtitle>
                </div>
                <ActionIcon>
                  <SettingOutlined />
                </ActionIcon>
              </ActionHeader>

              <ActionMetric>
                <span>기준 회사</span>
                <strong>{company?.name ?? "회사 선택 전"}</strong>
              </ActionMetric>
              <ActionMetric>
                <span>알림 주기</span>
                <strong>{alertLabel}</strong>
              </ActionMetric>
              <ActionMetric>
                <span>권장 작업</span>
                <strong>
                  {reports.length > 0
                    ? "최근 리포트를 열어 섹션 수정 또는 PDF 내보내기"
                    : "회사 선택 후 키워드를 구성하고 데일리 뉴스 생성"}
                </strong>
              </ActionMetric>

              <ActionButtons>
                <Button block onClick={() => router.push("/company" as Route)}>
                  회사 선택
                </Button>
                <Button block onClick={() => router.push("/setup/keywords" as Route)}>
                  키워드 설정
                </Button>
                <PrimaryAction
                  block
                  type="primary"
                  onClick={() => router.push("/daily" as Route)}
                >
                  브리핑 열기
                </PrimaryAction>
              </ActionButtons>
            </ActionPanel>
          </BottomGrid>

          <SpotlightBanner>
            <BannerLabel>Strategy Forecast</BannerLabel>
            <BannerTitle>
              {company?.name ?? "주요 회사"} 관련 기사와 경쟁사 키워드를 함께 추적할수록
              전략 시사점이 더 빠르게 모입니다.
            </BannerTitle>
            <BannerText>
              뉴스, 키워드, 분석 리포트가 같은 흐름으로 연결되어야 대시보드가 살아납니다.
              다음 단계는 회사 선택과 키워드 설정을 마친 뒤 데일리 뉴스와 리포트를
              연결하는 것입니다.
            </BannerText>
          </SpotlightBanner>
        </Container>
      </DashboardRoot>
    </AppShell>
  );
}

const DashboardRoot = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(91, 77, 255, 0.14), transparent 24%),
    radial-gradient(circle at 85% 12%, rgba(24, 182, 163, 0.14), transparent 20%),
    linear-gradient(180deg, #f7f8fc 0%, #eef2ff 100%);
`;

const AmbientGlow = styled.div`
  position: absolute;
  inset: -120px auto auto -100px;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  filter: blur(24px);
`;

const Container = styled.div`
  position: relative;
  max-width: 1360px;
  margin: 0 auto;
  padding: 28px;

  @media (max-width: 767px) {
    padding: 18px;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchWrap = styled.div`
  flex: 1;
`;

const DashboardSearch = styled(Input)`
  && {
    height: 54px;
    border-radius: 18px;
    border: 1px solid rgba(91, 77, 255, 0.12);
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 16px 36px rgba(80, 96, 140, 0.08);
  }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  padding: 8px 12px 8px 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(17, 24, 39, 0.06);
  box-shadow: 0 12px 28px rgba(80, 96, 140, 0.08);
`;

const ProfileText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    color: #111827;
    font-size: 15px;
  }

  span {
    color: #6b7280;
    font-size: 12px;
  }
`;

const Hero = styled.section`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeroCopy = styled.div`
  max-width: 760px;
`;

const Eyebrow = styled.div`
  margin-bottom: 10px;
  color: #5b4dff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: #111827;
  font-size: clamp(28px, 3.5vw, 46px);
  line-height: 1.08;
  letter-spacing: -0.04em;
`;

const HeroDescription = styled.p`
  margin: 14px 0 0;
  max-width: 720px;
  color: #5b6475;
  font-size: 16px;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const PrimaryAction = styled(Button)`
  && {
    height: 46px;
    padding-inline: 18px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #5b4dff, #7064ff);
    box-shadow: 0 16px 30px rgba(91, 77, 255, 0.26);
  }
`;

const GhostAction = styled(Button)`
  && {
    height: 46px;
    padding-inline: 18px;
    border-radius: 16px;
    border-color: rgba(91, 77, 255, 0.16);
    background: rgba(255, 255, 255, 0.72);
    color: #3f37c9;
  }
`;

const SectionLabel = styled.div`
  margin-bottom: 16px;
  color: #273142;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.14em;
`;

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.article<{ $tone: Tone }>`
  min-height: 238px;
  padding: 22px;
  border-radius: 26px;
  background: ${({ $tone }) =>
    $tone === "violet"
      ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(243,241,255,0.96))"
      : $tone === "mint"
        ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,252,249,0.96))"
        : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,234,0.96))"};
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 22px 54px rgba(80, 96, 140, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
`;

const MetricIcon = styled.div<{ $tone: Tone }>`
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: ${({ $tone }) =>
    $tone === "violet"
      ? "#4f46e5"
      : $tone === "mint"
        ? "#0f9d8a"
        : $tone === "gold"
          ? "#d97706"
          : "#475569"};
  background: ${({ $tone }) =>
    $tone === "violet"
      ? "rgba(91, 77, 255, 0.10)"
      : $tone === "mint"
        ? "rgba(24, 182, 163, 0.12)"
        : $tone === "gold"
          ? "rgba(245, 158, 11, 0.14)"
          : "rgba(71, 85, 105, 0.1)"};
`;

const SummaryDelta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #059669;
  font-size: 14px;
  font-weight: 700;
`;

const MetricSideNote = styled.div`
  color: #5b4dff;
  font-size: 13px;
  font-weight: 600;
`;

const MetricValue = styled.div`
  margin-bottom: 6px;
  color: #111827;
  font-size: clamp(30px, 3vw, 40px);
  font-weight: 700;
  letter-spacing: -0.04em;
`;

const MetricLabel = styled.div`
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.03em;
`;

const MetricNote = styled.p`
  margin: 10px 0 0;
  color: #667085;
  font-size: 14px;
`;

const ActivityBars = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 8px;
  height: 92px;
  margin-top: 20px;
`;

const Bar = styled.div`
  border-radius: 12px 12px 4px 4px;
  background: linear-gradient(180deg, #8c83ff, #5b4dff);
  opacity: 0.7;
`;

const KeywordRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
`;

const KeywordPill = styled.div`
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #293042;
  font-size: 13px;
  font-weight: 600;
`;

const MainGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  padding: 20px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.68);
  box-shadow:
    0 20px 48px rgba(80, 96, 140, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: #111827;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: -0.04em;
`;

const PanelSubtitle = styled.p`
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
`;

const InlineLink = styled.button`
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const ReportList = styled.div`
  display: grid;
  gap: 12px;
`;

const ReportItem = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f8faff);
  border: 1px solid rgba(17, 24, 39, 0.05);

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ReportIdentity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
`;

const ReportText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    color: #111827;
    font-size: 22px;
    letter-spacing: -0.03em;
  }

  span {
    color: #667085;
    font-size: 14px;
    margin-top: 6px;
  }
`;

const ReportMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const StatusPill = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === "violet"
      ? "rgba(91, 77, 255, 0.1)"
      : $tone === "mint"
        ? "rgba(24, 182, 163, 0.12)"
        : $tone === "gold"
          ? "rgba(245, 158, 11, 0.14)"
          : "rgba(71, 85, 105, 0.12)"};
  color: ${({ $tone }) =>
    $tone === "violet"
      ? "#4f46e5"
      : $tone === "mint"
        ? "#0f9d8a"
        : $tone === "gold"
          ? "#b45309"
          : "#475569"};
  font-size: 13px;
  font-weight: 700;
`;

const GhostMiniButton = styled.button`
  min-height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 14px;
  background: rgba(91, 77, 255, 0.1);
  color: #4f46e5;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

const CoverageList = styled.div`
  display: grid;
  gap: 18px;
  margin-top: 6px;
`;

const CoverageRow = styled.div`
  display: grid;
  gap: 6px;
`;

const CoverageLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #344054;
  font-size: 13px;

  strong {
    color: #111827;
    font-size: 15px;
  }
`;

const TinyProgress = styled(Progress, {
  shouldForwardProp: (prop) => prop !== "$tone",
})<{ $tone: Tone }>`
  && {
    margin: 0;
  }

  .ant-progress-inner {
    background: ${({ $tone }) =>
      $tone === "violet"
        ? "rgba(91, 77, 255, 0.12)"
        : $tone === "mint"
          ? "rgba(24, 182, 163, 0.12)"
          : $tone === "gold"
            ? "rgba(245, 158, 11, 0.12)"
            : "rgba(71, 85, 105, 0.12)"};
  }

  .ant-progress-bg {
    background: ${({ $tone }) =>
      $tone === "violet"
        ? "#5b4dff !important"
        : $tone === "mint"
          ? "#18b6a3 !important"
          : $tone === "gold"
            ? "#d97706 !important"
            : "#475569 !important"};
  }
`;

const BottomGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const NewsFocusCard = styled.article`
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  border: 1px solid rgba(17, 24, 39, 0.05);
`;

const FocusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const FocusMeta = styled.span`
  color: #667085;
  font-size: 13px;
`;

const FocusTitle = styled.h3`
  margin: 16px 0 12px;
  color: #111827;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: -0.03em;
`;

const FocusBullets = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #475467;

  li + li {
    margin-top: 10px;
  }
`;

const ActionPanel = styled.section`
  padding: 20px;
  border-radius: 26px;
  background:
    radial-gradient(circle at top right, rgba(91, 77, 255, 0.18), transparent 26%),
    linear-gradient(180deg, #10162f, #17203c);
  color: white;
  box-shadow: 0 24px 54px rgba(16, 22, 47, 0.28);
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;

  ${PanelTitle} {
    color: white;
  }

  ${PanelSubtitle} {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ActionIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  color: #dbe2ff;
  font-size: 18px;
`;

const ActionMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  span {
    color: rgba(255, 255, 255, 0.68);
    font-size: 13px;
  }

  strong {
    color: white;
    font-size: 19px;
    line-height: 1.35;
    letter-spacing: -0.02em;
  }
`;

const ActionButtons = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 18px;
`;

const SpotlightBanner = styled.section`
  padding: 28px;
  border-radius: 28px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.42)),
    radial-gradient(circle at 80% 50%, rgba(91, 77, 255, 0.16), transparent 24%),
    linear-gradient(135deg, #0f172a, #1d4ed8);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 24px 48px rgba(80, 96, 140, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
`;

const BannerLabel = styled.div`
  color: #4f46e5;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const BannerTitle = styled.h3`
  max-width: 840px;
  margin: 16px 0 10px;
  color: #111827;
  font-size: clamp(24px, 2.2vw, 34px);
  line-height: 1.15;
  letter-spacing: -0.04em;
`;

const BannerText = styled.p`
  max-width: 780px;
  margin: 0;
  color: #475467;
  font-size: 15px;
`;
