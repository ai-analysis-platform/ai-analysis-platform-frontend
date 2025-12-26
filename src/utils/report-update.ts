/**
 * LLM이 리포트를 수정할 때 사용하는 유틸리티
 * 섹션 추가, 삭제, 수정, 차트 타입 변경 등을 처리
 */

import { Report, ReportSection, ChartConfig, ChartType } from "@/core/state/report";
import { parseChartUpdateRequest, changeChartType } from "./chart-transform";

export type ReportUpdateAction =
  | { type: "add_section"; section: ReportSection; position?: number }
  | { type: "remove_section"; sectionId: string }
  | { type: "update_section"; sectionId: string; updates: Partial<ReportSection> }
  | { type: "change_chart_type"; sectionId: string; newType: ChartType }
  | { type: "update_chart_data"; sectionId: string; chartConfig: ChartConfig }
  | { type: "reorder_sections"; sectionIds: string[] };

/**
 * 사용자 요청을 파싱하여 리포트 업데이트 액션 생성
 */
export function parseReportUpdateRequest(
  userRequest: string,
  report: Report,
): ReportUpdateAction | null {
  const lowerRequest = userRequest.toLowerCase();

  // 섹션 추가 요청
  if (
    lowerRequest.includes("추가") ||
    lowerRequest.includes("만들어") ||
    lowerRequest.includes("생성") ||
    lowerRequest.includes("add") ||
    lowerRequest.includes("create")
  ) {
    // 섹션 타입 추론
    let sectionType: ReportSection["type"] = "text";
    if (
      lowerRequest.includes("차트") ||
      lowerRequest.includes("그래프") ||
      lowerRequest.includes("chart")
    ) {
      sectionType = "chart";
    } else if (
      lowerRequest.includes("표") ||
      lowerRequest.includes("테이블") ||
      lowerRequest.includes("table")
    ) {
      sectionType = "table";
    }

    // 제목 추출 (간단한 휴리스틱)
    const titleMatch = userRequest.match(/["']([^"']+)["']|제목[은는]?\s*([^.]+)/);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : "새 섹션";

    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      title,
      content: sectionType === "text" ? "" : "",
      type: sectionType,
      ...(sectionType === "chart" && {
        chartConfig: {
          type: "bar",
          data: {
            labels: [],
            datasets: [],
          },
        },
      }),
      ...(sectionType === "table" && {
        tableData: {
          headers: [],
          rows: [],
        },
      }),
    };

    return { type: "add_section", section: newSection };
  }

  // 섹션 삭제 요청
  if (
    lowerRequest.includes("삭제") ||
    lowerRequest.includes("제거") ||
    lowerRequest.includes("지워") ||
    lowerRequest.includes("delete") ||
    lowerRequest.includes("remove")
  ) {
    // 섹션 ID 또는 제목으로 찾기
    for (const section of report.sections) {
      if (lowerRequest.includes(section.title.toLowerCase())) {
        return { type: "remove_section", sectionId: section.id };
      }
    }
  }

  // 차트 타입 변경 요청
  for (const section of report.sections) {
    if (section.type === "chart" && section.chartConfig) {
      const chartAction = parseChartUpdateRequest(userRequest, section.chartConfig);
      if (chartAction && chartAction.action === "change_chart_type") {
        return {
          type: "change_chart_type",
          sectionId: section.id,
          newType: chartAction.params.to as ChartType,
        };
      }
    }
  }

  // 섹션 내용 수정 요청
  if (
    lowerRequest.includes("수정") ||
    lowerRequest.includes("변경") ||
    lowerRequest.includes("바꿔") ||
    lowerRequest.includes("update") ||
    lowerRequest.includes("change")
  ) {
    for (const section of report.sections) {
      if (lowerRequest.includes(section.title.toLowerCase())) {
        // 간단한 내용 추출
        const contentMatch = userRequest.match(/내용[은는]?\s*([^.]+)|to\s+([^.]+)/i);
        if (contentMatch) {
          return {
            type: "update_section",
            sectionId: section.id,
            updates: {
              content: (contentMatch[1] || contentMatch[2]).trim(),
            },
          };
        }
      }
    }
  }

  return null;
}

/**
 * 리포트에 액션 적용
 */
export function applyReportUpdate(report: Report, action: ReportUpdateAction): Report {
  switch (action.type) {
    case "add_section": {
      const sections = [...report.sections];
      if (action.position !== undefined) {
        sections.splice(action.position, 0, action.section);
      } else {
        sections.push(action.section);
      }
      return {
        ...report,
        sections,
        updatedAt: Date.now(),
      };
    }

    case "remove_section": {
      return {
        ...report,
        sections: report.sections.filter((s) => s.id !== action.sectionId),
        updatedAt: Date.now(),
      };
    }

    case "update_section": {
      return {
        ...report,
        sections: report.sections.map((s) =>
          s.id === action.sectionId ? { ...s, ...action.updates } : s,
        ),
        updatedAt: Date.now(),
      };
    }

    case "change_chart_type": {
      return {
        ...report,
        sections: report.sections.map((s) => {
          if (s.id === action.sectionId && s.chartConfig) {
            return {
              ...s,
              chartConfig: changeChartType(s.chartConfig, action.newType),
            };
          }
          return s;
        }),
        updatedAt: Date.now(),
      };
    }

    case "update_chart_data": {
      return {
        ...report,
        sections: report.sections.map((s) =>
          s.id === action.sectionId ? { ...s, chartConfig: action.chartConfig } : s,
        ),
        updatedAt: Date.now(),
      };
    }

    case "reorder_sections": {
      const sectionMap = new Map(report.sections.map((s) => [s.id, s]));
      const reorderedSections = action.sectionIds
        .map((id) => sectionMap.get(id))
        .filter((s): s is ReportSection => s !== undefined);
      return {
        ...report,
        sections: reorderedSections,
        updatedAt: Date.now(),
      };
    }

    default:
      return report;
  }
}
