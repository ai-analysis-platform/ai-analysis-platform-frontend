/**
 * ChartData를 Ant Design Charts 형식으로 변환하는 유틸리티
 */

import { ChartData, ChartConfig } from "@/core/state/report";

/**
 * ChartData를 Ant Design Charts의 Column (Bar) 형식으로 변환
 */
export function transformToColumnData(chartData: ChartData) {
  const data: Array<Record<string, string | number>> = [];

  chartData.labels.forEach((label, labelIndex) => {
    const item: Record<string, string | number> = {
      label: label,
    };

    chartData.datasets.forEach((dataset) => {
      item[dataset.label] = dataset.data[labelIndex] || 0;
    });

    data.push(item);
  });

  return data;
}

/**
 * ChartData를 Ant Design Charts의 Pie 형식으로 변환
 */
export function transformToPieData(chartData: ChartData) {
  if (chartData.datasets.length === 0 || chartData.labels.length === 0) {
    return [];
  }

  // 첫 번째 데이터셋 사용
  const dataset = chartData.datasets[0];
  return chartData.labels.map((label, index) => ({
    type: label,
    value: dataset.data[index] || 0,
  }));
}

/**
 * ChartData를 Ant Design Charts의 Line/Area 형식으로 변환
 */
export function transformToLineData(chartData: ChartData) {
  return transformToColumnData(chartData); // 동일한 구조 사용
}

/**
 * ChartConfig를 Ant Design Charts 설정으로 변환
 */
export function getAntChartConfig(chartConfig: ChartConfig): {
  data: Array<Record<string, string | number>>;
  [key: string]: unknown;
} {
  const { type, data, options } = chartConfig;

  switch (type) {
    case "bar":
      return {
        data: transformToColumnData(data),
        xField: "label",
        yField: data.datasets.map((d) => d.label),
        color: options?.colors || data.datasets.map((d) => d.color || "#7f6bff"),
        isStack: options?.bar?.stacked || false,
        isGroup: !options?.bar?.stacked && data.datasets.length > 1,
      };

    case "pie":
      return {
        data: transformToPieData(data),
        angleField: "value",
        colorField: "type",
        color: options?.colors || data.datasets[0]?.color || "#7f6bff",
        innerRadius: options?.pie?.innerRadius || 0,
        label: options?.pie?.showLabel !== false ? { type: "outer" } : false,
      };

    case "line":
      return {
        data: transformToLineData(data),
        xField: "label",
        yField: data.datasets.map((d) => d.label),
        color: options?.colors || data.datasets.map((d) => d.color || "#7f6bff"),
        smooth: options?.line?.smooth || false,
        point: options?.line?.showPoint !== false ? {} : false,
      };

    case "area":
      return {
        data: transformToLineData(data),
        xField: "label",
        yField: data.datasets.map((d) => d.label),
        color: options?.colors || data.datasets.map((d) => d.color || "#7f6bff"),
        smooth: options?.line?.smooth !== false,
        point: options?.line?.showPoint !== false ? {} : false,
      };

    default:
      // 기본값: bar 차트
      return {
        data: transformToColumnData(data),
        xField: "label",
        yField: data.datasets.map((d) => d.label),
        color: options?.colors || data.datasets.map((d) => d.color || "#7f6bff"),
      };
  }
}
