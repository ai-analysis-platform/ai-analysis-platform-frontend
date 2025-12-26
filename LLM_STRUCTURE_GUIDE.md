# LLM이 리포트를 수정하기 위한 구조 가이드

## 1. 권장 차트 라이브러리

### Ant Design Charts (권장)

- **이유**: 이미 Ant Design을 사용 중이므로 통합이 쉬움
- **장점**:
  - Ant Design 디자인 시스템과 일관성
  - 다양한 차트 타입 지원 (Bar, Line, Pie, Area 등)
  - TypeScript 지원
  - 설정이 JSON 기반이라 LLM이 이해하기 쉬움

```bash
yarn add @ant-design/charts
```

### 대안: Recharts

- React 친화적, 선언적 API
- 커스터마이징이 자유로움
- 하지만 Ant Design과 별도로 관리해야 함

## 2. 개선된 데이터 구조

### 현재 구조의 문제점

- 차트 타입이 명시적으로 저장되지 않음
- 차트 설정이 분산되어 있음
- LLM이 "바 그래프를 원형 그래프로 바꿔줘" 같은 요청을 처리하기 어려움

### 개선된 구조

```typescript
export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "radar";

export type ChartConfig = {
  type: ChartType;
  data: ChartData;
  options?: {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    // 차트별 특화 옵션
    bar?: { stacked?: boolean; horizontal?: boolean };
    pie?: { innerRadius?: number; showLabel?: boolean };
    line?: { smooth?: boolean; showPoint?: boolean };
  };
};

export type ReportSection = {
  id: string;
  title: string;
  content: string;
  type: "text" | "chart" | "table";
  chartConfig?: ChartConfig; // chartData 대신 chartConfig 사용
  tableData?: TableData;
  metadata?: {
    // LLM이 이해하기 쉬운 메타데이터
    description?: string; // "시장 점유율을 보여주는 바 차트"
    suggestedChartType?: ChartType; // AI가 추천할 수 있는 차트 타입
  };
};
```

## 3. LLM 친화적인 API 구조

### 리포트 섹션 수정 API

```typescript
// POST /api/reports/{reportId}/sections/{sectionId}/update
{
  "action": "update_chart_type",
  "from": "bar",
  "to": "pie",
  "preserveData": true  // 데이터는 유지하고 타입만 변경
}

// 또는 더 유연한 구조
{
  "action": "update",
  "updates": {
    "chartConfig": {
      "type": "pie",  // 바에서 원형으로 변경
      "data": { ... },  // 기존 데이터 재사용
      "options": {
        "pie": {
          "showLabel": true,
          "innerRadius": 0.5  // 도넛 차트로 만들기
        }
      }
    }
  }
}
```

### LLM 프롬프트 구조화

```typescript
// LLM에게 전달할 구조화된 요청
type LLMChartUpdateRequest = {
  sectionId: string;
  userRequest: string; // "바 그래프를 원형 그래프로 바꿔줘"
  currentChart: ChartConfig;
  suggestedAction: {
    type: "change_chart_type";
    from: ChartType;
    to: ChartType;
    reason: string; // "사용자가 원형 그래프를 요청함"
  };
};
```

## 4. 구현 예시

### 차트 컴포넌트 개선

```typescript
// src/components/report/section-chart.tsx
import { Column, Pie, Line } from '@ant-design/charts';

export default function SectionChart({ config }: { config: ChartConfig }) {
  const commonProps = {
    data: config.data.datasets[0].data.map((value, index) => ({
      label: config.data.labels[index],
      value,
    })),
    // ... 공통 설정
  };

  switch (config.type) {
    case 'bar':
      return <Column {...commonProps} {...config.options?.bar} />;
    case 'pie':
      return <Pie {...commonProps} {...config.options?.pie} />;
    case 'line':
      return <Line {...commonProps} {...config.options?.line} />;
    // ...
  }
}
```

### AI 수정 처리 로직

```typescript
// src/hooks/use-report-update.ts
export function useReportUpdate() {
  const updateChartType = async (
    reportId: string,
    sectionId: string,
    newType: ChartType,
  ) => {
    // 1. 현재 섹션 데이터 가져오기
    const section = getSection(reportId, sectionId);

    // 2. 차트 타입만 변경 (데이터는 유지)
    const updatedConfig: ChartConfig = {
      ...section.chartConfig!,
      type: newType,
      // 타입에 맞게 옵션 조정
      options: {
        ...section.chartConfig!.options,
        [newType]: getDefaultOptionsForType(newType),
      },
    };

    // 3. API 호출
    await fetch(`/api/reports/${reportId}/sections/${sectionId}`, {
      method: "PATCH",
      body: JSON.stringify({ chartConfig: updatedConfig }),
    });
  };

  return { updateChartType };
}
```

## 5. 백엔드 API 설계 권장사항

### RESTful 엔드포인트

```
PATCH /api/reports/{reportId}/sections/{sectionId}
{
  "chartConfig": {
    "type": "pie",  // LLM이 변경한 타입
    "data": { ... },
    "options": { ... }
  }
}

// 또는 액션 기반
POST /api/reports/{reportId}/sections/{sectionId}/actions
{
  "action": "change_chart_type",
  "params": {
    "to": "pie",
    "preserveData": true
  }
}
```

### LLM 처리 파이프라인

1. **사용자 요청 파싱**: "바 그래프를 원형 그래프로 바꿔줘"
2. **의도 추출**: `{ action: "change_chart_type", from: "bar", to: "pie" }`
3. **데이터 변환**: 기존 데이터를 새 차트 타입에 맞게 변환
4. **검증**: 새 차트 타입이 데이터에 적합한지 확인
5. **업데이트**: 리포트 섹션 업데이트

## 6. 데이터 변환 유틸리티

```typescript
// src/utils/chart-transform.ts
export function transformChartData(
  data: ChartData,
  fromType: ChartType,
  toType: ChartType,
): ChartData {
  // 바 차트 → 원형 차트: 데이터 구조 유지
  if (fromType === "bar" && toType === "pie") {
    return data; // 동일한 구조 사용 가능
  }

  // 라인 차트 → 바 차트: 데이터 재구성
  if (fromType === "line" && toType === "bar") {
    return {
      labels: data.labels,
      datasets: data.datasets.map((d) => ({
        ...d,
        // 필요시 데이터 변환
      })),
    };
  }

  return data;
}
```

## 7. 권장 사항 요약

1. **Ant Design Charts 사용**: 통합이 쉽고 설정이 JSON 기반
2. **차트 타입 명시적 저장**: `chartConfig.type`으로 관리
3. **구조화된 메타데이터**: LLM이 이해하기 쉬운 설명 추가
4. **섹션별 독립 수정**: 각 섹션을 개별적으로 업데이트 가능
5. **데이터 변환 유틸리티**: 차트 타입 변경 시 데이터 자동 변환
6. **액션 기반 API**: LLM이 이해하기 쉬운 명확한 액션 정의

이 구조를 따르면 LLM이 "바 그래프를 원형 그래프로 바꿔줘" 같은 요청을 자연스럽게 처리할 수 있습니다.
