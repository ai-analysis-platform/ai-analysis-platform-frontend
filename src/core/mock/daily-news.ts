export type NewsItem = {
  id: string;
  title: string;
  bullets: string[];
  url: string;
  source: string;
  tags: string[];
};

export const mockDailyNews: NewsItem[] = [
  {
    id: "n1",
    title: "CoWoS 병목 완화 시나리오: 패키징 공급망 변화",
    bullets: [
      "패키징 증설 계획이 2026년까지 단계적으로 반영될 가능성",
      "GPU 수요가 메모리/파운드리 수급에 미치는 영향 점검 필요",
      "대형 고객사 계약 구조 변화가 마진에 영향",
    ],
    url: "https://www.hankyung.com/article/2026010169151",
    source: "한국경제",
    tags: ["패키징", "CoWoS", "TSMC", "GPU 수요"],
  },
  {
    id: "n2",
    title: "HBM3E 양산 경쟁 심화: 수율/공정 최적화 이슈",
    bullets: [
      "HBM3E 수율 개선 속도가 단기 공급능력의 핵심 변수",
      "차세대 HBM4 로드맵 공개 시점이 경쟁 구도에 영향",
    ],
    url: "https://example.com/news/hbm3e",
    source: "MockWire",
    tags: ["HBM3E", "HBM4", "삼성전자", "SK하이닉스", "마이크론"],
  },
  {
    id: "n3",
    title: "AI 데이터센터 투자 재개: CAPEX 가이던스 상향 가능성",
    bullets: [
      "대형 CSP의 GPU 도입 속도가 DRAM/NAND 수요를 견인",
      "재고 정상화 여부에 따라 분기별 변동성 확대",
    ],
    url: "https://example.com/news/datacenter",
    source: "MockWire",
    tags: ["AI 데이터센터", "DRAM", "NAND", "GPU 수요"],
  },
];
