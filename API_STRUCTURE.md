# 리포트 수정 API 구조

## 개요

LLM이 리포트를 동적으로 수정할 수 있도록 설계된 API 구조입니다. 프론트엔드에서 사용할 수 있는 형태로 구현되어 있으며, 백엔드 연결 시 동일한 구조를 사용할 수 있습니다.

## API 엔드포인트

### 1. 리포트 섹션 업데이트

```
PATCH /api/reports/{reportId}/sections/{sectionId}
```

**요청 본문:**
```json
{
  "action": "update",
  "updates": {
    "title": "새로운 제목",
    "content": "새로운 내용",
    "chartConfig": {
      "type": "pie",
      "data": { ... },
      "options": { ... }
    }
  }
}
```

### 2. 리포트 섹션 추가

```
POST /api/reports/{reportId}/sections
```

**요청 본문:**
```json
{
  "section": {
    "id": "section-new-1",
    "title": "새 섹션",
    "content": "",
    "type": "text",
    "position": 2  // 선택사항: 삽입 위치
  }
}
```

### 3. 리포트 섹션 삭제

```
DELETE /api/reports/{reportId}/sections/{sectionId}
```

### 4. 차트 타입 변경

```
PATCH /api/reports/{reportId}/sections/{sectionId}/chart
```

**요청 본문:**
```json
{
  "action": "change_chart_type",
  "params": {
    "from": "bar",
    "to": "pie",
    "preserveData": true
  }
}
```

### 5. LLM 요청 처리 (통합)

```
POST /api/reports/{reportId}/update
```

**요청 본문:**
```json
{
  "userRequest": "바 그래프를 원형 그래프로 바꿔줘",
  "context": {
    "currentReport": { ... },
    "userMessages": [ ... ]
  }
}
```

**응답:**
```json
{
  "success": true,
  "report": {
    "id": "report-1",
    "title": "...",
    "sections": [ ... ],
    "updatedAt": 1234567890
  },
  "message": "차트 타입을 변경했습니다.",
  "actions": [
    {
      "type": "change_chart_type",
      "sectionId": "section-3",
      "from": "bar",
      "to": "pie"
    }
  ]
}
```

## 리포트 업데이트 액션 타입

### `add_section`
섹션을 추가합니다.

```typescript
{
  type: "add_section";
  section: ReportSection;
  position?: number;  // 선택사항: 삽입 위치
}
```

### `remove_section`
섹션을 삭제합니다.

```typescript
{
  type: "remove_section";
  sectionId: string;
}
```

### `update_section`
섹션을 업데이트합니다.

```typescript
{
  type: "update_section";
  sectionId: string;
  updates: Partial<ReportSection>;
}
```

### `change_chart_type`
차트 타입을 변경합니다.

```typescript
{
  type: "change_chart_type";
  sectionId: string;
  newType: ChartType;  // "bar" | "line" | "pie" | "area" | "scatter" | "radar"
}
```

### `update_chart_data`
차트 데이터를 업데이트합니다.

```typescript
{
  type: "update_chart_data";
  sectionId: string;
  chartConfig: ChartConfig;
}
```

### `reorder_sections`
섹션 순서를 변경합니다.

```typescript
{
  type: "reorder_sections";
  sectionIds: string[];  // 새로운 순서대로 섹션 ID 배열
}
```

## 사용 예시

### 프론트엔드에서 사용

```typescript
import { parseReportUpdateRequest, applyReportUpdate } from "@/utils/report-update";

// 사용자 요청 파싱
const action = parseReportUpdateRequest("바 그래프를 원형 그래프로 바꿔줘", report);

if (action) {
  // 리포트 업데이트
  const updatedReport = applyReportUpdate(report, action);
  setReport(updatedReport);
}
```

### 백엔드 API 호출

```typescript
// 리포트 업데이트 요청
const response = await fetch(`/api/reports/${reportId}/update`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userRequest: "바 그래프를 원형 그래프로 바꿔줘",
    context: {
      currentReport: report,
    },
  }),
});

const result = await response.json();
if (result.success) {
  setReport(result.report);
}
```

## LLM 요청 파싱 규칙

현재 구현된 파싱 규칙:

1. **섹션 추가**: "추가", "만들어", "생성", "add", "create" 키워드 감지
2. **섹션 삭제**: "삭제", "제거", "지워", "delete", "remove" 키워드 감지
3. **차트 타입 변경**: 차트 타입 키워드 감지 (바, 막대, 원형, 파이, 선, 라인 등)
4. **섹션 수정**: "수정", "변경", "바꿔", "update", "change" 키워드 감지

향후 백엔드에서 더 정교한 NLP 파싱을 사용할 수 있습니다.

## 차트 타입 지원

- `bar`: 막대 그래프
- `line`: 선 그래프
- `pie`: 원형 그래프
- `area`: 영역 그래프
- `scatter`: 산점도
- `radar`: 레이더 차트

## 데이터 구조

### ChartConfig
```typescript
{
  type: ChartType;
  data: ChartData;
  options?: {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    bar?: { stacked?: boolean; horizontal?: boolean };
    pie?: { innerRadius?: number; showLabel?: boolean };
    line?: { smooth?: boolean; showPoint?: boolean };
  };
}
```

### ReportSection
```typescript
{
  id: string;
  title: string;
  content: string;
  type: "text" | "chart" | "table";
  chartConfig?: ChartConfig;
  chartData?: ChartData;  // 하위 호환성
  tableData?: TableData;
  metadata?: {
    description?: string;
    suggestedChartType?: ChartType;
  };
}
```

