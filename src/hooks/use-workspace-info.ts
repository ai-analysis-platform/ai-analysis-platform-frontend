"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  workspaceMissionState,
  workspaceNameState,
  workspaceSummaryState,
} from "@/core/state/workspace";

export function useWorkspaceInfo() {
  const [name, setName] = useAtom(workspaceNameState);
  const [mission, setMission] = useAtom(workspaceMissionState);
  const summary = useAtomValue(workspaceSummaryState);

  return {
    name,
    mission,
    summary,
    setName,
    setMission,
  };
}
