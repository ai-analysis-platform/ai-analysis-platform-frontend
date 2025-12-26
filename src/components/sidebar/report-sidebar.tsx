"use client";

import styled from "@emotion/styled";
import { Button } from "antd";
import { FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { reportsState, type Report } from "@/core/state/report";

type ReportSidebarProps = {
  currentReportId?: string;
  onReportSelect?: (report: Report) => void;
};

export default function ReportSidebar({
  currentReportId,
  onReportSelect,
}: ReportSidebarProps) {
  const router = useRouter();
  const reports = useAtomValue(reportsState);

  const handleBackToChat = () => {
    router.push("/");
  };

  const handleReportClick = (report: Report) => {
    if (onReportSelect) {
      onReportSelect(report);
    }
    router.push(`/report/${report.id}/edit`);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <BackButton icon={<ArrowLeftOutlined />} onClick={handleBackToChat}>
          채팅으로
        </BackButton>
      </SidebarHeader>

      <SidebarContent>
        <SectionTitle>
          <FileTextOutlined style={{ marginRight: 8 }} />
          리포트 목록
        </SectionTitle>
        <ReportList>
          {reports.length === 0 ? (
            <EmptyState>생성된 리포트가 없습니다.</EmptyState>
          ) : (
            reports.map((report) => (
              <ReportItem
                key={report.id}
                $isActive={report.id === currentReportId}
                onClick={() => handleReportClick(report)}
              >
                <ReportTitle>{report.title}</ReportTitle>
                <ReportMeta>
                  {new Date(report.updatedAt).toLocaleDateString("ko-KR")}
                </ReportMeta>
              </ReportItem>
            ))
          )}
        </ReportList>
      </SidebarContent>
    </SidebarContainer>
  );
}

const SidebarContainer = styled.aside`
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const BackButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReportItem = styled.div<{ $isActive: boolean }>`
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $isActive }) => ($isActive ? "#f3f4f6" : "transparent")};
  border: 1px solid ${({ $isActive }) => ($isActive ? "#7f6bff" : "transparent")};
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #e5e7eb;
  }
`;

const ReportTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReportMeta = styled.div`
  font-size: 12px;
  color: var(--muted);
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--muted);
  padding: 24px;
  font-size: 14px;
`;
