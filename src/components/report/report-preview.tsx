"use client";

import styled from "@emotion/styled";
import { Button, Card, Typography } from "antd";
import { EditOutlined, DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Report } from "@/core/state/report";
import { useRouter } from "next/navigation";
import SectionChart from "./section-chart";
import SectionTable from "./section-table";

const { Title, Paragraph } = Typography;

type ReportPreviewProps = {
  report: Report;
  onEdit: () => void;
};

export default function ReportPreview({ report, onEdit }: ReportPreviewProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/report/${report.id}/edit`);
    onEdit();
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <Title level={3} style={{ margin: 0 }}>
          {report.title}
        </Title>
        <ActionButtons>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            수정
          </Button>
          <Button icon={<DownloadOutlined />}>다운로드</Button>
          <Button icon={<ShareAltOutlined />}>공유</Button>
        </ActionButtons>
      </PreviewHeader>

      <PreviewContent>
        {report.sections.map((section) => (
          <SectionCard key={section.id} bordered={false}>
            <SectionTitle level={4}>{section.title}</SectionTitle>
            {section.type === "text" && (
              <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                {section.content}
              </Paragraph>
            )}
            {section.type === "chart" &&
              (section.chartConfig ? (
                <SectionChart chartConfig={section.chartConfig} title={section.title} />
              ) : section.chartData ? (
                <SectionChart data={section.chartData} title={section.title} />
              ) : null)}
            {section.type === "table" && section.tableData && (
              <SectionTable data={section.tableData} />
            )}
          </SectionCard>
        ))}
      </PreviewContent>

      <PreviewFooter>
        <KeywordTags>
          {report.keywords.map((keyword) => (
            <KeywordTag key={keyword}>{keyword}</KeywordTag>
          ))}
        </KeywordTags>
      </PreviewFooter>
    </PreviewContainer>
  );
}

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  max-width: 900px;
  margin: 0 auto;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionCard = styled(Card)`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled(Title)`
  margin-bottom: 12px !important;
  font-size: 18px !important;
`;

const PreviewFooter = styled.div`
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const KeywordTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordTag = styled.span`
  padding: 4px 12px;
  background: #7f6bff;
  color: white;
  border-radius: 16px;
  font-size: 12px;
`;
