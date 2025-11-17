"use client";

import styled from "@emotion/styled";
import { Button, Flex, Input, Typography } from "antd";

const { Title, Paragraph } = Typography;

type HomeHeroProps = {
  name: string;
  mission: string;
  onNameChange: (value: string) => void;
  onMissionChange: (value: string) => void;
};

export default function HomeHero({
  name,
  mission,
  onNameChange,
  onMissionChange,
}: HomeHeroProps) {
  return (
    <HeroSection>
      <Tagline>AI Data Analysis Workspace</Tagline>
      <HeroTitle level={1}>{name}</HeroTitle>
      <HeroParagraph>{mission}</HeroParagraph>
      <Flex gap={16} vertical style={{ maxWidth: 420 }}>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="워크스페이스 이름"
          size="large"
        />
        <Input.TextArea
          value={mission}
          onChange={(event) => onMissionChange(event.target.value)}
          placeholder="플랫폼 미션"
          size="large"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Button type="primary" size="large">
          Save draft
        </Button>
      </Flex>
    </HeroSection>
  );
}

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 48px 32px;
  background: radial-gradient(circle at top, #171b2e, transparent 60%), var(--card);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
`;

const Tagline = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: var(--muted);
  text-transform: uppercase;
`;

const HeroTitle = styled(Title)`
  margin: 0 !important;
  color: var(--foreground) !important;
`;

const HeroParagraph = styled(Paragraph)`
  color: var(--foreground) !important;
  opacity: 0.85;
`;
