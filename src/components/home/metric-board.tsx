"use client";

import styled from "@emotion/styled";
import { Card, Col, Row, Statistic, Typography } from "antd";

const { Text } = Typography;

type Metric = {
  label: string;
  value: string;
  helper: string;
};

const defaultMetrics: Metric[] = [
  {
    label: "Active Pipelines",
    value: "12",
    helper: "3 scheduled · 9 streaming",
  },
  {
    label: "Guardrail Coverage",
    value: "92%",
    helper: "LLM, vector, analyst QA",
  },
  {
    label: "Insights per hour",
    value: "48",
    helper: "Auto-drafted reports",
  },
];

type MetricBoardProps = {
  metrics?: Metric[];
};

export default function MetricBoard({ metrics = defaultMetrics }: MetricBoardProps) {
  return (
    <Row gutter={[16, 16]}>
      {metrics.map((metric) => (
        <Col xs={24} md={8} key={metric.label}>
          <MetricCard bordered={false}>
            <Statistic title={metric.label} value={metric.value} />
            <MetricHelper type="secondary">{metric.helper}</MetricHelper>
          </MetricCard>
        </Col>
      ))}
    </Row>
  );
}

const MetricCard = styled(Card)`
  border-radius: 16px;
  background: rgba(16, 18, 38, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  color: var(--foreground);

  .ant-statistic-title {
    color: var(--muted) !important;
  }

  .ant-statistic-content-value {
    font-weight: 600;
    color: var(--foreground);
  }
`;

const MetricHelper = styled(Text)`
  color: var(--foreground) !important;
  opacity: 0.8;
`;
