"use client";

import styled from "@emotion/styled";
import { Button } from "antd";
import {
  MenuOutlined,
  EditOutlined,
  PaperClipOutlined,
  CalendarOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useAtom } from "jotai";
import { chatMessagesState, currentInputState, type ChatMessage } from "@/core/state/app";
import { reportsState, currentReportState, type Report } from "@/core/state/report";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";

export default function HomePage() {
  const [messages, setMessages] = useAtom(chatMessagesState);
  const [inputValue, setInputValue] = useAtom(currentInputState);
  const [reports, setReports] = useAtom(reportsState);
  const [, setCurrentReport] = useAtom(currentReportState);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // 입력값을 먼저 저장하고 초기화
    setInputValue("");

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: trimmedValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      // 이미 키워드 선택 메시지가 있는지 확인
      const hasKeywordSelection = prev.some((m) => m.type === "keyword-selection");
      if (hasKeywordSelection) {
        return [...prev, userMessage];
      }
      return [...prev, userMessage];
    });

    // 키워드 선택 UI를 메시지로 추가 (한 번만)
    setTimeout(() => {
      setMessages((prev) => {
        const hasKeywordSelection = prev.some((m) => m.type === "keyword-selection");
        if (hasKeywordSelection) {
          return prev;
        }
        const keywordMessage: ChatMessage = {
          id: `keyword-${Date.now()}`,
          type: "keyword-selection",
          timestamp: Date.now(),
        };
        return [...prev, keywordMessage];
      });
    }, 300);
  };

  const handleKeywordsConfirm = (selected: string[], additional: string) => {
    const userInput = messages.find((m) => m.type === "user")?.content || "";
    console.log("User input:", userInput);
    console.log("Selected keywords:", selected);
    console.log("Additional keywords:", additional);

    // 리포트 생성 (나중에 API로 교체)
    const reportId = `report-${Date.now()}`;
    const newReport: Report = {
      id: reportId,
      title: "반도체 시장의 HBM 트렌드 분석 리포트",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [
        {
          id: "section-1",
          title: "요약",
          content:
            "본 리포트는 반도체 시장의 HBM(High Bandwidth Memory) 트렌드에 대한 종합 분석을 제공합니다. 주요 기업인 삼성전자, 마이크론, SK하이닉스의 기술 동향과 시장 전망을 다룹니다.",
          type: "text",
        },
        {
          id: "section-2",
          title: "시장 동향",
          content:
            "HBM 시장은 AI 데이터센터의 급속한 성장과 GPU 수요 증가로 인해 지속적인 성장세를 보이고 있습니다. HBM3E와 HBM4 등 차세대 기술이 주목받고 있으며, 엔비디아와 AMD의 GPU 플랫폼에서 핵심 메모리 솔루션으로 채택되고 있습니다.",
          type: "text",
        },
        {
          id: "section-3",
          title: "HBM 시장 점유율 (2024)",
          content: "",
          type: "chart",
          chartConfig: {
            type: "bar",
            data: {
              labels: ["삼성전자", "SK하이닉스", "마이크론", "기타"],
              datasets: [
                {
                  label: "시장 점유율 (%)",
                  data: [45, 30, 20, 5],
                  color: "#7f6bff",
                },
              ],
            },
          },
        },
        {
          id: "section-4",
          title: "주요 기업 분석",
          content:
            "삼성전자는 HBM3E 양산에 성공하며 시장 선도 위치를 공고히 하고 있습니다. 마이크론은 차세대 HBM4 개발에 집중하고 있으며, SK하이닉스는 기술 혁신을 통해 경쟁력을 강화하고 있습니다.",
          type: "text",
        },
        {
          id: "section-5",
          title: "기업별 HBM 제품 라인업",
          content: "",
          type: "table",
          tableData: {
            headers: ["기업", "HBM3", "HBM3E", "HBM4 (개발 중)"],
            rows: [
              ["삼성전자", "✓", "✓", "✓"],
              ["SK하이닉스", "✓", "✓", "진행 중"],
              ["마이크론", "✓", "진행 중", "계획"],
            ],
          },
        },
      ],
      keywords: [...selected, ...additional.split(",").map((k) => k.trim())].filter(
        Boolean,
      ),
      userInput,
    };

    setReports((prev) => [...prev, newReport]);
    setCurrentReport(newReport);

    // 리포트 생성 완료 메시지
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      type: "assistant",
      content: `리포트가 생성되었습니다! 아래 미리보기를 확인하고 수정할 수 있습니다.`,
      timestamp: Date.now(),
    };

    // 리포트 미리보기 메시지
    const reportPreviewMessage: ChatMessage = {
      id: `report-preview-${Date.now()}`,
      type: "report-preview",
      reportId,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage, reportPreviewMessage]);
  };

  return (
    <PageLayout>
      <Sidebar>
        <MenuButton icon={<MenuOutlined />} type="text" />
        <EditButton icon={<EditOutlined />} type="primary" shape="circle" />
      </Sidebar>
      <MainContent>
        <Header>
          <Title>산업군 및 요청사항 입력</Title>
          <HeaderActions>
            <Button icon={<PaperClipOutlined />} type="text" />
            <Button icon={<CalendarOutlined />} type="text" />
            <Button icon={<MoreOutlined />} type="text" />
          </HeaderActions>
        </Header>
        <ChatContainer>
          <MessageList onKeywordsConfirm={handleKeywordsConfirm} />
          <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
        </ChatContainer>
      </MainContent>
    </PageLayout>
  );
}

const PageLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const Sidebar = styled.aside`
  width: 64px;
  background: #7f6bff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
`;

const MenuButton = styled(Button)`
  color: white !important;
  border: none !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EditButton = styled(Button)`
  background: #7f6bff !important;
  border: 2px solid white !important;
  color: white !important;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
`;

const Title = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--foreground);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ChatContainer = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;
