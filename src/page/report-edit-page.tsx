"use client";

import styled from "@emotion/styled";
import { useParams } from "next/navigation";
import { useAtom, useAtomValue } from "jotai";
import { currentReportState, reportsState, type Report } from "@/core/state/report";
import { chatMessagesState, currentInputState, type ChatMessage } from "@/core/state/app";
import ReportEditor from "@/components/report/report-editor";
import MessageList from "@/components/chat/message-list";
import ChatInput from "@/components/chat/chat-input";
import ReportSidebar from "@/components/sidebar/report-sidebar";
import { useEffect } from "react";
import { parseReportUpdateRequest, applyReportUpdate } from "@/utils/report-update";

export default function ReportEditPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useAtom(currentReportState);
  const reports = useAtomValue(reportsState);
  const [messages, setMessages] = useAtom(chatMessagesState);
  const [inputValue, setInputValue] = useAtom(currentInputState);

  useEffect(() => {
    // 리포트 로드 (나중에 API로 교체)
    const foundReport = reports.find((r) => r.id === reportId);
    if (foundReport) {
      setReport(foundReport);
    } else {
      // 임시 리포트 생성 (실제로는 API에서 가져옴)
      const tempReport = {
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
            type: "text" as const,
          },
          {
            id: "section-2",
            title: "시장 동향",
            content:
              "HBM 시장은 AI 데이터센터의 급속한 성장과 GPU 수요 증가로 인해 지속적인 성장세를 보이고 있습니다. HBM3E와 HBM4 등 차세대 기술이 주목받고 있으며, 엔비디아와 AMD의 GPU 플랫폼에서 핵심 메모리 솔루션으로 채택되고 있습니다.",
            type: "text" as const,
          },
          {
            id: "section-3",
            title: "HBM 시장 점유율 (2024)",
            content: "",
            type: "chart" as const,
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
            type: "text" as const,
          },
          {
            id: "section-5",
            title: "기업별 HBM 제품 라인업",
            content: "",
            type: "table" as const,
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
        keywords: [
          "삼성전자",
          "마이크론",
          "GPU 수요",
          "HBM4",
          "SK하이닉스",
          "HBM3E",
          "AI 데이터센터",
        ],
        userInput: "반도체 시장의 HBM 트렌드에 대해 조사해줘",
      };
      setReport(tempReport);
    }
  }, [reportId, reports, setReport]);

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    setInputValue("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: trimmedValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (!report) return;

    // LLM 요청 파싱 및 처리
    const updateAction = parseReportUpdateRequest(trimmedValue, report);
    let updateMessage = "";
    let updatedReport = report;

    if (updateAction) {
      // 로컬에서 즉시 업데이트
      updatedReport = applyReportUpdate(report, updateAction);
      setReport(updatedReport);

      // 업데이트 메시지 생성
      switch (updateAction.type) {
        case "add_section":
          updateMessage = `"${updateAction.section.title}" 섹션을 추가했습니다.`;
          break;
        case "remove_section": {
          const removedSection = report.sections.find(
            (s) => s.id === updateAction.sectionId,
          );
          updateMessage = removedSection
            ? `"${removedSection.title}" 섹션을 삭제했습니다.`
            : "섹션을 삭제했습니다.";
          break;
        }
        case "update_section": {
          const updatedSection = updatedReport.sections.find(
            (s) => s.id === updateAction.sectionId,
          );
          updateMessage = updatedSection
            ? `"${updatedSection.title}" 섹션을 업데이트했습니다.`
            : "섹션을 업데이트했습니다.";
          break;
        }
        case "change_chart_type": {
          const changedSection = updatedReport.sections.find(
            (s) => s.id === updateAction.sectionId,
          );
          updateMessage = changedSection
            ? `"${changedSection.title}" 섹션의 차트를 ${updateAction.newType} 타입으로 변경했습니다.`
            : "차트 타입을 변경했습니다.";
          break;
        }
        default:
          updateMessage = "리포트를 업데이트했습니다.";
      }
    } else {
      // 백엔드 API 호출 (나중에 구현)
      // const response = await fetch(`/api/reports/${reportId}/update`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userRequest: trimmedValue }),
      // });
      // const result = await response.json();
      // updatedReport = result.report;
      // updateMessage = result.message;
    }

    // AI 응답
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content:
          updateMessage ||
          `리포트 수정 요청을 확인했습니다. "${trimmedValue}"에 따라 리포트를 업데이트하겠습니다.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleReportUpdate = (updatedSections: Report["sections"]) => {
    if (!report) return;
    setReport({
      ...report,
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  };

  if (!report) {
    return <div>리포트를 불러오는 중...</div>;
  }

  const handleReportSelect = (selectedReport: Report) => {
    setReport(selectedReport);
  };

  return (
    <EditPageLayout>
      <ReportSidebar currentReportId={reportId} onReportSelect={handleReportSelect} />
      <MainEditor>
        <ReportEditor report={report} onUpdate={handleReportUpdate} />
      </MainEditor>
      <ChatSidebar>
        <ChatHeader>
          <h3>리포트 수정 도우미</h3>
        </ChatHeader>
        <ChatContent>
          <MessageList onKeywordsConfirm={() => {}} />
          <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
        </ChatContent>
      </ChatSidebar>
    </EditPageLayout>
  );
}

const EditPageLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f9fafb;
  overflow: hidden;
`;

const MainEditor = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #ffffff;
`;

const ChatSidebar = styled.aside`
  width: 400px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
  background: #ffffff;
`;

const ChatHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
