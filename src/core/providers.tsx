"use client";

import "@ant-design/v5-patch-for-react-19";
import { ReactNode, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from "jotai";
import { createQueryClient } from "@/core/query-client";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#7f6bff",
              colorBgBase: "#ffffff",
              fontFamily: "var(--font-sans)",
              colorTextBase: "var(--foreground)",
              colorBorder: "#e5e7eb",
            },
            algorithm: [antdTheme.defaultAlgorithm],
          }}
        >
          {children}
        </ConfigProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
