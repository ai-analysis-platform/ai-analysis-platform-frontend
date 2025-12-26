"use client";

import styled from "@emotion/styled";
import { Button, Card, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Report } from "@/core/state/report";
import SectionChart from "./section-chart";
import SectionTable from "./section-table";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Paragraph } = Typography;

type ReportEditorProps = {
  report: Report;
  onUpdate: (sections: Report["sections"]) => void;
};

export default function ReportEditor({ report, onUpdate }: ReportEditorProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${report.title}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <Title level={2} style={{ margin: 0 }}>
          {report.title}
        </Title>
        <HeaderActions>
          <LastUpdated>
            마지막 수정: {new Date(report.updatedAt).toLocaleString("ko-KR")}
          </LastUpdated>
          <ExportButton icon={<DownloadOutlined />} onClick={handleExportPDF}>
            PDF 내보내기
          </ExportButton>
        </HeaderActions>
      </EditorHeader>

      <EditorContent ref={reportRef}>
        {report.sections.map((section) => (
          <SectionCard key={section.id} bordered={false}>
            <SectionTitle level={3}>{section.title}</SectionTitle>
            <SectionContent>
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
            </SectionContent>
          </SectionCard>
        ))}
      </EditorContent>
    </EditorContainer>
  );
}

const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LastUpdated = styled.span`
  color: var(--muted);
  font-size: 14px;
`;

const ExportButton = styled(Button)`
  flex-shrink: 0;
`;

const EditorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionCard = styled(Card)`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled(Title)`
  margin-bottom: 16px !important;
  font-size: 20px !important;
`;

const SectionContent = styled.div`
  color: var(--foreground);
  line-height: 1.8;
`;
