"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

export function useSafeBack(fallback: Route) {
  const router = useRouter();

  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallback);
  };
}
