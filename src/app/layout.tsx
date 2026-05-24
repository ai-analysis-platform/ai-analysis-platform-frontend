import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "@/core/providers";
import EmotionRegistry from "@/core/emotion-registry";
import "antd/dist/reset.css";
import "@/assets/styles/globals.css";

export const metadata: Metadata = {
  title: "NowWhat",
  description:
    "Next.js front-end for an AI data analytics platform with Ant Design, Emotion, TanStack Query, and Suspense-ready data flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <EmotionRegistry>
            <Providers>{children}</Providers>
          </EmotionRegistry>
        </AntdRegistry>
      </body>
    </html>
  );
}
