import { atom } from "jotai";

// LLM이 이해하기 쉬운 차트 타입 정의
export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "radar";

export type ChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
};

// 차트 설정 구조 (LLM이 수정하기 쉬움)
export type ChartConfig = {
  type: ChartType;
  data: ChartData;
  options?: {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    // 차트별 특화 옵션
    bar?: { stacked?: boolean; horizontal?: boolean };
    pie?: { innerRadius?: number; showLabel?: boolean };
    line?: { smooth?: boolean; showPoint?: boolean };
  };
};

export type TableData = {
  headers: string[];
  rows: string[][];
};

export type ReportSection = {
  id: string;
  title: string;
  content: string;
  type: "text" | "chart" | "table";
  // LLM 친화적: chartData 대신 chartConfig 사용 (타입 명시)
  chartConfig?: ChartConfig;
  chartData?: ChartData; // 하위 호환성 유지
  tableData?: TableData;
  metadata?: {
    // LLM이 이해하기 쉬운 메타데이터
    description?: string; // "시장 점유율을 보여주는 바 차트"
    suggestedChartType?: ChartType; // AI가 추천할 수 있는 차트 타입
  };
};

export type Report = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  sections: ReportSection[];
  keywords: string[];
  userInput: string;
};

export const currentReportState = atom<Report | null>(null);
export const reportsState = atom<Report[]>([]);
