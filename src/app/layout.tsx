import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "@/core/providers";
import EmotionRegistry from "@/core/emotion-registry";
import "antd/dist/reset.css";
import "@/assets/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nebula IQ · AI Analytics Workspace",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AntdRegistry>
          <EmotionRegistry>
            <Providers>{children}</Providers>
          </EmotionRegistry>
        </AntdRegistry>
      </body>
    </html>
  );
}
