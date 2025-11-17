"use client";

import { CacheProvider } from "@emotion/react";
import createCache, { Options as EmotionCacheOptions } from "@emotion/cache";
import { ReactNode, useMemo } from "react";
import { useServerInsertedHTML } from "next/navigation";

type EmotionRegistryProps = {
  options?: EmotionCacheOptions;
  children: ReactNode;
};

const DEFAULT_OPTIONS: EmotionCacheOptions = {
  key: "emotion",
  prepend: true,
};

export default function EmotionRegistry({ children, options }: EmotionRegistryProps) {
  const cache = useMemo(() => {
    const createdCache = createCache(options ?? DEFAULT_OPTIONS);
    createdCache.compat = true;
    return createdCache;
  }, [options]);

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(" "),
      }}
    />
  ));

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
