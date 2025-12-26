"use client";

import styled from "@emotion/styled";
import { TableData } from "@/core/state/report";

type SectionTableProps = {
  data: TableData;
};

export default function SectionTable({ data }: SectionTableProps) {
  return (
    <TableContainer>
      <Table>
        <thead>
          <TableRow>
            {data.headers.map((header) => (
              <TableHeader key={header}>{header}</TableHeader>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
  }
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--foreground);
  background: #f9fafb;
`;

const TableCell = styled.td`
  padding: 12px;
  color: var(--foreground);
`;
