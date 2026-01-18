"use client";

import styled from "@emotion/styled";
import { Button, Card, DatePicker, Divider, Space, Tag, Typography } from "antd";
import { DownloadOutlined, HolderOutlined } from "@ant-design/icons";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs, { Dayjs } from "dayjs";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import {
  companyState,
  dailyNewsOrderState,
  keywordSelectionState,
  selectedDailyDateState,
} from "@/core/state/onboarding";
import { mockDailyNews, type NewsItem } from "@/core/mock/daily-news";

const { Title, Text, Link } = Typography;

function toDayjs(date: Date) {
  return dayjs(date);
}

function fromDayjs(value: Dayjs) {
  return value.toDate();
}

export default function DailyNewsPage() {
  const router = useRouter();
  const company = useAtomValue(companyState);
  const selection = useAtomValue(keywordSelectionState);
  const [selectedDate, setSelectedDate] = useAtom(selectedDailyDateState);
  const [order, setOrder] = useAtom(dailyNewsOrderState);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const allSelected = useMemo(
    () => [...selection.industries, ...selection.competitors, ...selection.custom],
    [selection],
  );

  const filteredNews = useMemo(() => {
    if (allSelected.length === 0) return mockDailyNews;
    return mockDailyNews.filter((n) => n.tags.some((t) => allSelected.includes(t)));
  }, [allSelected]);

  const orderedNews = useMemo(() => {
    const base = filteredNews;
    if (order.length === 0) return base;
    const orderIndex = new Map(order.map((id, idx) => [id, idx]));
    return [...base].sort((a, b) => {
      const ai = orderIndex.get(a.id);
      const bi = orderIndex.get(b.id);
      if (ai === undefined && bi === undefined) return 0;
      if (ai === undefined) return 1;
      if (bi === undefined) return -1;
      return ai - bi;
    });
  }, [filteredNews, order]);

  const ensureOrder = (items: NewsItem[]) => {
    setOrder((prev) => {
      const prevSet = new Set(prev);
      const next = [...prev];
      for (const item of items) {
        if (!prevSet.has(item.id)) next.push(item.id);
      }
      return next;
    });
  };

  useEffect(() => {
    ensureOrder(orderedNews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNews.length]);

  const move = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setOrder((prev) => {
      const next = prev.length ? [...prev] : filteredNews.map((n) => n.id);
      const from = next.indexOf(sourceId);
      const to = next.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, sourceId);
      return next;
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
              {dayjs(selectedDate).format("YYYY. MM. DD")} Daily News
            </Title>
            <Text type="secondary">
              {company.name} · 선택 키워드 {allSelected.length}개
            </Text>
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
          <Report ref={reportRef}>
            <SectionCard>
              <Title level={5} style={{ margin: 0 }}>
                키워드
              </Title>
              <TagRow>
                {allSelected.length === 0 ? (
                  <Tag color="default">전체</Tag>
                ) : (
                  allSelected.map((k) => (
                    <Tag key={k} color="geekblue">
                      {k}
                    </Tag>
                  ))
                )}
              </TagRow>
            </SectionCard>

            <SectionCard>
              <Title level={5} style={{ margin: 0 }}>
                전략 점검 (목데이터)
              </Title>
              <Text type="secondary">
                중요 뉴스의 “변수/리스크/기회”를 자동으로 구조화하는 LLM 분석 API는 추후
                연동 예정입니다.
              </Text>
            </SectionCard>

            <Divider style={{ margin: "12px 0" }} />

            <Title level={5} style={{ margin: 0 }}>
              뉴스 리스트 (드래그로 순서 조정)
            </Title>
            <List>
              {orderedNews.map((news) => (
                <NewsCard
                  key={news.id}
                  draggable
                  onDragStart={() => setDraggingId(news.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!draggingId || draggingId === news.id) return;
                    move(draggingId, news.id);
                  }}
                >
                  <Handle aria-hidden>
                    <HolderOutlined />
                  </Handle>
                  <NewsBody>
                    <Title level={5} style={{ margin: 0 }}>
                      {news.title}
                    </Title>
                    <BulletList>
                      {news.bullets.map((b, idx) => (
                        <li key={`${news.id}-${idx}`}>{b}</li>
                      ))}
                    </BulletList>
                    <Space size={8} wrap>
                      {news.tags.slice(0, 4).map((t) => (
                        <Tag key={`${news.id}-${t}`}>{t}</Tag>
                      ))}
                    </Space>
                    <Link href={news.url} target="_blank" rel="noreferrer">
                      {news.source} · {news.url}
                    </Link>
                  </NewsBody>
                </NewsCard>
              ))}
            </List>
          </Report>

          <Side>
            <Card styles={{ body: { padding: 16 } }}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  설정
                </Title>
                <Text type="secondary">
                  여기 뭐 기타 사이드 기능이 들어와도 좋을거같아요
                </Text>
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

const Report = styled.div`
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(17, 24, 39, 0.06),
    0 2px 8px rgba(17, 24, 39, 0.06);
  padding: 16px;
`;

const SectionCard = styled.div`
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 14px;
  background: rgba(127, 107, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
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

const Side = styled.aside`
  position: sticky;
  top: 16px;
`;

const EmptyShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff, #fafafa);
`;
