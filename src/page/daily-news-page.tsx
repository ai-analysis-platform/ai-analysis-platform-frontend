"use client";

import styled from "@emotion/styled";
import { Alert, Button, Card, DatePicker, Divider, Space, Tag, Typography } from "antd";
import { DownloadOutlined, HolderOutlined } from "@ant-design/icons";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs, { Dayjs } from "dayjs";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { LoadingOverlay, LoadingState } from "@/components/common/loading-state";
import MarkdownContent from "@/components/common/markdown-content";
import {
  buildNewsResumeRequest,
  fetchNewsResume,
  normalizeNewsItemsByLocale,
} from "@/core/api/news-resume";
import { getStoredNewsKeywordSessionId } from "@/core/api/news-session";
import {
  companyState,
  dailyNewsOrderState,
  keywordSelectionState,
  selectedDailyDateState,
} from "@/core/state/onboarding";
import { mockDailyNews, type NewsItem } from "@/core/mock/daily-news";
import { useSafeBack } from "@/hooks/use-safe-back";

const { Title, Text, Link } = Typography;

function toDayjs(date: Date) {
  return dayjs(date);
}

function fromDayjs(value: Dayjs) {
  return value.toDate();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type NewsColumnKey = "kor" | "eng";

const NEWS_COLUMN_META: Record<
  NewsColumnKey,
  { title: string; locale: "KOR" | "ENG"; emptyLabel: string }
> = {
  kor: {
    title: "국내 뉴스",
    locale: "KOR",
    emptyLabel: "국내 뉴스가 없습니다.",
  },
  eng: {
    title: "글로벌 뉴스",
    locale: "ENG",
    emptyLabel: "글로벌 뉴스가 없습니다.",
  },
};

export default function DailyNewsPage() {
  const DEFAULT_VISIBLE_COUNT = 3;
  const router = useRouter();
  const goBackToKeywords = useSafeBack("/setup/keywords" as Route);
  const company = useAtomValue(companyState);
  const selection = useAtomValue(keywordSelectionState);
  const [selectedDate, setSelectedDate] = useAtom(selectedDailyDateState);
  const [order, setOrder] = useAtom(dailyNewsOrderState);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Record<NewsColumnKey, boolean>>({
    kor: false,
    eng: false,
  });
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId(company?.name ? getStoredNewsKeywordSessionId(company.name) : null);
  }, [company?.name]);

  const allSelected = useMemo(
    () => [...selection.industries, ...selection.competitors, ...selection.macros],
    [selection],
  );

  const highlightTerms = useMemo(() => {
    const unique = Array.from(new Set(allSelected.map((t) => t.trim()).filter(Boolean)));
    unique.sort((a, b) => b.length - a.length);
    return unique.slice(0, 20);
  }, [allSelected]);

  const highlightRegex = useMemo(() => {
    if (highlightTerms.length === 0) return null;
    return new RegExp(`(${highlightTerms.map(escapeRegExp).join("|")})`, "gi");
  }, [highlightTerms]);

  const highlightSet = useMemo(
    () => new Set(highlightTerms.map((t) => t.toLowerCase())),
    [highlightTerms],
  );

  const renderHighlighted = (text: string) => {
    if (!highlightRegex) return text;
    const parts = text.split(highlightRegex);
    return parts.map((part, idx) => {
      const normalized = part.toLowerCase();
      if (!highlightSet.has(normalized)) {
        return <span key={`${idx}-${part}`}>{part}</span>;
      }
      return <Highlight key={`${idx}-${part}`}>{part}</Highlight>;
    });
  };

  const filteredNews = useMemo(() => {
    if (allSelected.length === 0) return mockDailyNews;
    return mockDailyNews.filter((n) => n.tags.some((t) => allSelected.includes(t)));
  }, [allSelected]);

  const newsQuery = useQuery({
    queryKey: ["news-resume", sessionId, selection],
    queryFn: () => {
      if (!sessionId) {
        throw new Error("세션 ID가 없습니다.");
      }
      return fetchNewsResume(buildNewsResumeRequest(selection, sessionId));
    },
    enabled: Boolean(company && sessionId && allSelected.length > 0),
  });

  const apiNews = useMemo(() => {
    if (!newsQuery.data) {
      return {
        KOR: [] as NewsItem[],
        ENG: [] as NewsItem[],
      };
    }
    return normalizeNewsItemsByLocale(newsQuery.data, selection);
  }, [newsQuery.data, selection]);

  const fallbackNews = useMemo(
    () => ({
      KOR: filteredNews,
      ENG: [] as NewsItem[],
    }),
    [filteredNews],
  );

  const visibleNews = useMemo(() => {
    const shouldShowFallbackNews = Boolean(newsQuery.error);

    if (newsQuery.isLoading) return { KOR: [] as NewsItem[], ENG: [] as NewsItem[] };
    if (apiNews.KOR.length > 0 || apiNews.ENG.length > 0) return apiNews;
    if (shouldShowFallbackNews) return fallbackNews;
    return { KOR: [] as NewsItem[], ENG: [] as NewsItem[] };
  }, [apiNews, fallbackNews, newsQuery.error, newsQuery.isLoading]);

  const strategyMarkdown = useMemo(
    () => newsQuery.data?.result?.strategy_markdown?.trim() ?? "",
    [newsQuery.data],
  );

  const orderedNews = useMemo(() => {
    const sortByOrder = (items: NewsItem[], ids: string[]) => {
      if (ids.length === 0) return items;
      const orderIndex = new Map(ids.map((id, idx) => [id, idx]));
      return [...items].sort((a, b) => {
        const ai = orderIndex.get(a.id);
        const bi = orderIndex.get(b.id);
        if (ai === undefined && bi === undefined) return 0;
        if (ai === undefined) return 1;
        if (bi === undefined) return -1;
        return ai - bi;
      });
    };

    return {
      KOR: sortByOrder(visibleNews.KOR, order.kor),
      ENG: sortByOrder(visibleNews.ENG, order.eng),
    };
  }, [visibleNews, order]);

  const ensureOrder = (items: NewsItem[], column: NewsColumnKey) => {
    setOrder((prev) => {
      const prevIds = prev[column];
      const prevSet = new Set(prevIds);
      const nextIds = [...prevIds];
      for (const item of items) {
        if (!prevSet.has(item.id)) nextIds.push(item.id);
      }
      return {
        ...prev,
        [column]: nextIds,
      };
    });
  };

  useEffect(() => {
    ensureOrder(orderedNews.KOR, "kor");
    ensureOrder(orderedNews.ENG, "eng");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNews.KOR.length, visibleNews.ENG.length]);

  const move = (sourceId: string, targetId: string, column: NewsColumnKey) => {
    if (sourceId === targetId) return;
    setOrder((prev) => {
      const baseIds = column === "kor" ? visibleNews.KOR : visibleNews.ENG;
      const next = prev[column].length ? [...prev[column]] : baseIds.map((n) => n.id);
      const from = next.indexOf(sourceId);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, sourceId);
      return {
        ...prev,
        [column]: next,
      };
    });
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${dayjs(selectedDate).format("YYYY-MM-DD")}-daily-news.pdf`;
      pdf.save(fileName);
    } finally {
      setExporting(false);
    }
  };

  if (!company) {
    return (
      <EmptyShell>
        <Card style={{ maxWidth: 520, width: "100%" }}>
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Title level={4} style={{ margin: 0 }}>
              회사 인증이 필요합니다
            </Title>
            <Text type="secondary">
              데일리 뉴스는 회사/키워드 설정 후 확인할 수 있어요.
            </Text>
            <Button type="primary" onClick={() => router.push("/" as Route)}>
              회사 선택으로 이동
            </Button>
          </Space>
        </Card>
      </EmptyShell>
    );
  }

  return (
    <AppShell>
      <Container>
        <TopBar>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {dayjs(selectedDate).format("YYYY. MM. DD")} NowWhat Daily News &amp;{" "}
              Strategy
            </Title>
            <Text type="secondary">{company.name}</Text>
          </div>
          <Actions>
            <DatePicker
              value={toDayjs(selectedDate)}
              onChange={(v) => v && setSelectedDate(fromDayjs(v))}
              allowClear={false}
            />
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              loading={exporting}
              onClick={exportPdf}
            >
              Export PDF
            </Button>
          </Actions>
        </TopBar>

        <Body>
          <ReportWrap>
            <LoadingOverlay
              visible={newsQuery.isLoading}
              title="데일리 뉴스 데이터를 불러오는 중입니다"
              description="선택된 키워드를 기준으로 국내외 뉴스를 정리하고 있습니다."
            />
            <Report ref={reportRef}>
              {newsQuery.isLoading && (
                <LoadingState
                  compact
                  title="뉴스와 전략 체크를 생성하는 중입니다"
                  description="완료되면 카드와 요약이 바로 표시됩니다."
                />
              )}
              {newsQuery.error && (
                <Alert
                  type="warning"
                  showIcon
                  message="뉴스 API 호출에 실패해 임시 데이터로 표시합니다."
                  description={newsQuery.error.message}
                  style={{ marginBottom: 14 }}
                />
              )}
              {!sessionId && (
                <Alert
                  type="warning"
                  showIcon
                  message="저장된 세션 ID가 없어 임시 데이터로 표시합니다."
                  style={{ marginBottom: 14 }}
                />
              )}
              <SectionHeader>
                <Title level={5} style={{ margin: 0 }}>
                  Daily News
                </Title>
                <Text type="secondary">드래그로 순서 조정</Text>
              </SectionHeader>
              <NewsColumns>
                {(
                  Object.entries(NEWS_COLUMN_META) as Array<
                    [NewsColumnKey, (typeof NEWS_COLUMN_META)[NewsColumnKey]]
                  >
                ).map(([column, meta]) => {
                  const items = column === "kor" ? orderedNews.KOR : orderedNews.ENG;
                  const isExpanded = expandedColumns[column];
                  const hasMoreItems = items.length > DEFAULT_VISIBLE_COUNT;
                  const visibleItems =
                    hasMoreItems && !isExpanded ? items.slice(0, DEFAULT_VISIBLE_COUNT) : items;

                  return (
                    <NewsColumn key={column}>
                      <ColumnHeader>
                        <Title level={5} style={{ margin: 0 }}>
                          {meta.title}
                        </Title>
                        <Text type="secondary">{items.length}건</Text>
                      </ColumnHeader>
                      <List>
                        {items.length === 0 && (
                          <Card>
                            <Text type="secondary">
                              {newsQuery.isLoading
                                ? "뉴스를 불러오는 중입니다."
                                : meta.emptyLabel}
                            </Text>
                          </Card>
                        )}
                        {visibleItems.map((news) => (
                          <NewsCard
                            key={news.id}
                            draggable
                            onDragStart={() => setDraggingId(news.id)}
                            onDragEnd={() => setDraggingId(null)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!draggingId || draggingId === news.id) return;
                              move(draggingId, news.id, column);
                            }}
                          >
                            <Handle aria-hidden>
                              <HolderOutlined />
                            </Handle>
                            <NewsBody>
                              <Title level={5} style={{ margin: 0 }}>
                                {renderHighlighted(news.title)}
                              </Title>
                              <BulletList>
                                {news.bullets.map((b, idx) => (
                                  <li key={`${news.id}-${idx}`}>
                                    {renderHighlighted(b)}
                                  </li>
                                ))}
                              </BulletList>
                              <Space size={8} wrap>
                                {news.tags.slice(0, 4).map((t) => (
                                  <Tag key={`${news.id}-${t}`}>{t}</Tag>
                                ))}
                              </Space>
                              {news.publishedAt && (
                                <Text type="secondary">
                                  {dayjs(news.publishedAt).format("YYYY.MM.DD")}
                                </Text>
                              )}
                              <Link href={news.url} target="_blank" rel="noreferrer">
                                {news.source} · {news.url}
                              </Link>
                            </NewsBody>
                          </NewsCard>
                        ))}
                        {hasMoreItems && (
                          <ExpandButtonWrap>
                            <Button
                              type="default"
                              onClick={() =>
                                setExpandedColumns((prev) => ({
                                  ...prev,
                                  [column]: !prev[column],
                                }))
                              }
                            >
                              {isExpanded
                                ? "접기"
                                : `더보기 (${items.length - DEFAULT_VISIBLE_COUNT}개)`}
                            </Button>
                          </ExpandButtonWrap>
                        )}
                      </List>
                    </NewsColumn>
                  );
                })}
              </NewsColumns>

              <Divider style={{ margin: "14px 0" }} />

              <SectionHeader>
                <Title level={5} style={{ margin: 0 }}>
                  Strategy Check
                </Title>
                <Text type="secondary">Resume API 전략 요약</Text>
              </SectionHeader>

              <StrategyPanel>
                {strategyMarkdown ? (
                  <MarkdownContent content={strategyMarkdown} />
                ) : (
                  <Text type="secondary">
                    {newsQuery.isLoading
                      ? "전략 요약을 불러오는 중입니다."
                      : "전략 요약 데이터가 아직 없습니다."}
                  </Text>
                )}
              </StrategyPanel>
            </Report>
          </ReportWrap>

          <Side>
            <Card styles={{ body: { padding: 16 } }}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  설정
                </Title>
                <Text type="secondary">
                  여기 뭐 기타 사이드 기능이 들어와도 좋을거같아요
                </Text>
                <Button onClick={goBackToKeywords}>이전 단계로 돌아가기</Button>
                <Button onClick={() => router.push("/setup/keywords" as Route)}>
                  키워드 다시 선택
                </Button>
                <Button onClick={() => router.push("/" as Route)}>회사 다시 선택</Button>
              </Space>
            </Card>
          </Side>
        </Body>
      </Container>
    </AppShell>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  margin: 0 0 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
  align-items: start;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const ReportWrap = styled.div`
  position: relative;
`;

const Report = styled.div`
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(17, 24, 39, 0.06),
    0 2px 8px rgba(17, 24, 39, 0.06);
  padding: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const NewsColumns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
`;

const NewsColumn = styled.section`
  min-width: 0;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const ExpandButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2px;
`;

const NewsCard = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 14px 14px 14px 10px;
  background: #ffffff;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 14px;
  }
`;

const Handle = styled.div`
  color: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: start center;
  padding-top: 2px;
`;

const NewsBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: var(--foreground);
  li {
    margin: 4px 0;
  }
`;

const Highlight = styled.span`
  color: #2563eb;
  font-weight: 600;
`;

const StrategyPanel = styled.div`
  margin-top: 10px;
  padding: 18px;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff, #fcfcfd);
`;

const Side = styled.aside`
  position: sticky;
  top: 16px;

  @media (max-width: 1020px) {
    position: static;
  }
`;

const EmptyShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff, #fafafa);
`;
