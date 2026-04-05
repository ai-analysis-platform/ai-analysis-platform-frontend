"use client";

import styled from "@emotion/styled";
import { Button, Drawer, Layout, Menu } from "antd";
import {
  CloseOutlined,
  CalendarOutlined,
  KeyOutlined,
  MenuOutlined,
  SettingOutlined,
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
    key: "company",
    label: "회사 선택",
    icon: <KeyOutlined />,
    href: "/",
  },
  {
    key: "keywords",
    label: "키워드 설정",
    icon: <SettingOutlined />,
    href: "/setup/keywords",
  },
  { key: "daily", label: "데일리 뉴스", icon: <CalendarOutlined />, href: "/daily" },
];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedKey = useMemo(() => {
    if (!pathname) return "daily";
    if (pathname === "/") return "company";
    if (pathname.startsWith("/setup/keywords")) return "keywords";
    if (pathname.startsWith("/daily")) return "daily";
    return "daily";
  }, [pathname]);

  return (
    <RootLayout>
      <DesktopSider
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
          {!collapsed && <BrandText>NowWhat</BrandText>}
        </Brand>

        <SideMenu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            disabled: item.disabled,
            onClick: () => {
              if (!item.href) return;
              setMobileMenuOpen(false);
              router.push(item.href as Route);
            },
          }))}
        />
      </DesktopSider>

      <MainLayout>
        <MobileHeader>
          <MobileMenuButton
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴 열기"
          />
          <MobileHeaderTitle>NowWhat</MobileHeaderTitle>
        </MobileHeader>
        <MainContent>{children}</MainContent>
      </MainLayout>

      <MobileDrawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        closable={false}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <DrawerShell>
          <DrawerHeader>
            <Brand>
              <BrandMark />
              <BrandText>NowWhat</BrandText>
            </Brand>
            <CloseButton
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="메뉴 닫기"
            />
          </DrawerHeader>
          <SideMenu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={NAV_ITEMS.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => {
                if (!item.href) return;
                setMobileMenuOpen(false);
                router.push(item.href as Route);
              },
            }))}
          />
        </DrawerShell>
      </MobileDrawer>
    </RootLayout>
  );
}

const RootLayout = styled(Layout)`
  min-height: 100vh;
  height: 100%;
  background: #0b1020;
`;

const DesktopSider = styled(Layout.Sider)`
  background: linear-gradient(180deg, #111827, #0b1020) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  min-height: 100vh;
  height: 100%;

  @media (max-width: 991px) {
    display: none !important;
  }
`;

const SideMenu = styled(Menu)`
  background: transparent !important;

  .ant-menu-item,
  .ant-menu-submenu-title {
    color: rgba(255, 255, 255, 0.92) !important;
  }

  .ant-menu-item .ant-menu-item-icon,
  .ant-menu-submenu-title .ant-menu-item-icon,
  .ant-menu-item .anticon,
  .ant-menu-submenu-title .anticon {
    color: rgba(255, 255, 255, 0.92) !important;
  }

  .ant-menu-item-disabled {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  .ant-menu-item-disabled .ant-menu-item-icon,
  .ant-menu-item-disabled .anticon {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  .ant-menu-item:hover,
  .ant-menu-submenu-title:hover {
    color: rgba(255, 255, 255, 0.98) !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  .ant-menu-item-selected {
    background: rgba(127, 107, 255, 0.22) !important;
  }

  .ant-menu-item-selected,
  .ant-menu-item-selected .ant-menu-item-icon,
  .ant-menu-item-selected .anticon {
    color: rgba(255, 255, 255, 0.98) !important;
  }
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

const MobileHeader = styled.header`
  display: none;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  position: sticky;
  top: 0;
  z-index: 15;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  backdrop-filter: blur(10px);

  @media (max-width: 991px) {
    display: flex;
  }
`;

const MobileMenuButton = styled(Button)`
  width: 40px;
  height: 40px;
  color: #111827 !important;
`;

const MobileHeaderTitle = styled.div`
  min-width: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const MainContent = styled(Layout.Content)`
  overflow: auto;
  padding: 0 !important;
  font-size: 16px;
  --ant-font-size: 16px;
  --ant-font-size-sm: 14px;
  --ant-font-size-lg: 18px;
`;

const MobileDrawer = styled(Drawer)`
  .ant-drawer-content,
  .ant-drawer-body {
    background: linear-gradient(180deg, #111827, #0b1020);
  }
`;

const DrawerShell = styled.div`
  min-height: 100%;
  background: linear-gradient(180deg, #111827, #0b1020);
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const CloseButton = styled(Button)`
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.92) !important;
`;
