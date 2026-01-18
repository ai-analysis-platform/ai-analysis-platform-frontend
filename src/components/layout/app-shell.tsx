"use client";

import styled from "@emotion/styled";
import { Layout, Menu } from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

type AppShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  disabled?: boolean;
}> = [
  {
    key: "keywords",
    label: "키워드 설정",
    icon: <SettingOutlined />,
    href: "/setup/keywords",
  },
  { key: "daily", label: "데일리 뉴스", icon: <CalendarOutlined />, href: "/daily" },
  { key: "history", label: "내가 본 뉴스", icon: <HomeOutlined />, disabled: true },
  { key: "me", label: "내 정보", icon: <UserOutlined />, disabled: true },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = useMemo(() => {
    if (!pathname) return "daily";
    if (pathname === "/") return "";
    if (pathname.startsWith("/setup/keywords")) return "keywords";
    if (pathname.startsWith("/daily")) return "daily";
    return "daily";
  }, [pathname]);

  return (
    <RootLayout>
      <Sider
        width={260}
        theme="dark"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={72}
      >
        <Brand>
          <BrandMark />
          {!collapsed && <BrandText>Nebula IQ</BrandText>}
        </Brand>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          style={{ color: "white" }}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            disabled: item.disabled,
            onClick: () => {
              if (!item.href) return;
              router.push(item.href as Route);
            },
          }))}
        />
      </Sider>

      <MainLayout>
        <MainContent>{children}</MainContent>
      </MainLayout>
    </RootLayout>
  );
}

const RootLayout = styled(Layout)`
  min-height: 100vh;
  height: 100%;
  background: #0b1020;
`;

const Sider = styled(Layout.Sider)`
  background: linear-gradient(180deg, #111827, #0b1020) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  min-height: 100vh;
  height: 100%;
`;

const Brand = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BrandMark = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: radial-gradient(circle at 30% 30%, #7f6bff, #10b981);
  box-shadow:
    0 10px 24px rgba(127, 107, 255, 0.22),
    0 8px 20px rgba(16, 185, 129, 0.16);
`;

const BrandText = styled.div`
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const MainLayout = styled(Layout)`
  background: linear-gradient(180deg, #ffffff, #fafafa);
`;

const MainContent = styled(Layout.Content)`
  overflow: auto;
  padding: 22px 16px 48px;
  font-size: 16px;
  --ant-font-size: 16px;
  --ant-font-size-sm: 14px;
  --ant-font-size-lg: 18px;
`;
