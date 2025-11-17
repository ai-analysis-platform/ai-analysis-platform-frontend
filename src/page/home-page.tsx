"use client";

import styled from "@emotion/styled";
import { Card, Flex, Typography } from "antd";
import HomeHero from "@/components/home/home-hero";
import MetricBoard from "@/components/home/metric-board";
import { useWorkspaceInfo } from "@/hooks/use-workspace-info";

const { Text } = Typography;

export default function HomePage() {
  const { name, mission, summary, setName, setMission } = useWorkspaceInfo();

  return (
    <PageShell>
      <HomeHero
        name={name}
        mission={mission}
        onNameChange={setName}
        onMissionChange={setMission}
      />

      <Flex vertical gap={16}>
        <MetricBoard />
        <SummaryCard>
          <Text type="secondary">Workspace summary</Text>
          <Text strong>{summary}</Text>
        </SummaryCard>
      </Flex>
    </PageShell>
  );
}

const PageShell = styled.main`
  min-height: 100vh;
  padding: 64px 32px 120px;
  background: linear-gradient(180deg, #03050c, #060b16 40%, #0b1224 100%);
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (min-width: 1024px) {
    padding-inline: 96px;
  }
`;

const SummaryCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid var(--card-border);
  background: var(--card);
  color: var(--foreground);

  display: flex;
  flex-direction: column;
  gap: 4px;
`;
