/**
 * LLM이 차트 타입을 변경할 때 사용하는 유틸리티
 * 예: "바 그래프를 원형 그래프로 바꿔줘" 요청 처리
 */

import { ChartType, ChartData, ChartConfig } from "@/core/state/report";

/**
 * 차트 타입 변경 (데이터는 유지)
 */
export function changeChartType(config: ChartConfig, newType: ChartType): ChartConfig {
  return {
    ...config,
    type: newType,
    options: {
      ...config.options,
      // 새 차트 타입에 맞는 기본 옵션 설정
      [newType]: getDefaultOptionsForType(newType),
    },
  };
}

/**
 * 차트 타입별 기본 옵션
 */
function getDefaultOptionsForType(type: ChartType) {
  switch (type) {
    case "bar":
      return { stacked: false, horizontal: false };
    case "pie":
      return { innerRadius: 0, showLabel: true };
    case "line":
      return { smooth: false, showPoint: true };
    case "area":
      return { smooth: true, showPoint: false };
    default:
      return {};
  }
}

/**
 * 데이터를 새 차트 타입에 맞게 변환 (필요시)
 */
export function transformChartDataForType(
  data: ChartData,
  fromType: ChartType,
  toType: ChartType,
): ChartData {
  // 대부분의 경우 데이터 구조는 동일하게 사용 가능
  // (바 → 원형, 라인 → 바 등)
  if (fromType === "bar" && toType === "pie") {
    // 바 차트 데이터를 원형 차트에 맞게 변환
    return data; // 동일한 구조 사용 가능
  }

  if (fromType === "line" && toType === "bar") {
    // 라인 차트 데이터를 바 차트에 맞게 변환
    return {
      labels: data.labels,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        // 필요시 데이터 변환 로직 추가
      })),
    };
  }

  // 기본적으로 동일한 데이터 구조 반환
  return data;
}

/**
 * LLM 요청을 파싱하여 차트 업데이트 액션 생성
 * 예: "바 그래프를 원형 그래프로 바꿔줘" → { action: "change_type", to: "pie" }
 */
export function parseChartUpdateRequest(
  userRequest: string,
  currentConfig: ChartConfig,
): { action: string; params: Record<string, unknown> } | null {
  const lowerRequest = userRequest.toLowerCase();

  // 차트 타입 변경 감지
  const chartTypeMap: Record<string, ChartType> = {
    바: "bar",
    막대: "bar",
    bar: "bar",
    원형: "pie",
    파이: "pie",
    pie: "pie",
    선: "line",
    라인: "line",
    line: "line",
    영역: "area",
    area: "area",
  };

  for (const [keyword, type] of Object.entries(chartTypeMap)) {
    if (lowerRequest.includes(keyword) && type !== currentConfig.type) {
      return {
        action: "change_chart_type",
        params: {
          from: currentConfig.type,
          to: type,
          preserveData: true,
        },
      };
    }
  }

  return null;
}
