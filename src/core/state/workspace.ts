"use client";

import { atom } from "jotai";

export const workspaceNameState = atom<string>("Nebula Insight");

export const workspaceMissionState = atom<string>(
  "AI 데이터 인사이트를 누구나 다룰 수 있게 만드는 실험실",
);

export const workspaceSummaryState = atom((get) => {
  const name = get(workspaceNameState);
  const mission = get(workspaceMissionState);
  return `${name} · ${mission}`;
});
