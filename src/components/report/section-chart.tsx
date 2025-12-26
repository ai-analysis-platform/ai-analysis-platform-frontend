"use client";

import styled from "@emotion/styled";
import { Column, Pie, Line, Area } from "@ant-design/charts";
import { ChartData, ChartConfig, ChartType } from "@/core/state/report";
import { getAntChartConfig } from "@/utils/chart-data-transform";

type SectionChartProps = {
  data?: ChartData;
  chartConfig?: ChartConfig;
  chartType?: ChartType;
  title?: string;
};

export default function SectionChart({
  data,
  chartConfig,
  chartType,
  title,
}: SectionChartProps) {
  // chartConfig 우선, 없으면 data와 chartType 사용
  const config = chartConfig || (data ? { type: chartType || "bar", data } : null);

  if (!config) {
    return <ChartContainer>차트 데이터가 없습니다.</ChartContainer>;
  }

  const antConfig = getAntChartConfig(config);
  const chartHeight = 300;

  const renderChart = () => {
    switch (config.type) {
      case "bar":
        return <Column {...antConfig} height={chartHeight} />;
      case "pie":
        return <Pie {...antConfig} height={chartHeight} />;
      case "line":
        return <Line {...antConfig} height={chartHeight} />;
      case "area":
        return <Area {...antConfig} height={chartHeight} />;
      default:
        return <Column {...antConfig} height={chartHeight} />;
    }
  };

  return (
    <ChartContainer>
      {title && <ChartTitle>{title}</ChartTitle>}
      <ChartWrapper>{renderChart()}</ChartWrapper>
    </ChartContainer>
  );
}

const ChartContainer = styled.div`
  width: 100%;
  padding: 16px;
`;

const ChartTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
`;

const ChartWrapper = styled.div`
  width: 100%;
`;
