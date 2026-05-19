"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChartOutlined,
  BookOutlined,
  HomeOutlined,
  InboxOutlined,
  MessageOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: <HomeOutlined />,
  },
  {
    href: "/recipes",
    label: "Recipes",
    icon: <BookOutlined />,
  },
  {
    href: "/fridge",
    label: "My Fridge",
    icon: <InboxOutlined />,
  },
  {
    href: "/shopping",
    label: "Shopping",
    icon: <ShoppingCartOutlined />,
  },
  {
    href: "/nutrition",
    label: "Nutrition",
    icon: <BarChartOutlined />,
  },
  {
    href: "/assistant",
    label: "Assistant",
    icon: <MessageOutlined />,
  },
  {
    href: "/preferences",
    label: "Preferences",
    icon: <SettingOutlined />,
  },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="logo-block">
            <div className="logo-icon">🍽</div>
            <span>MealMaster</span>
          </Link>

<nav className="nav">
  {navItems.map((item) => {
    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-link ${isActive ? "active" : ""}`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  })}

  <Link href="/login" className="nav-link">
    <span>Login</span>
  </Link>
</nav>
        </div>
      </header>

      <main className="main">{children}</main>
    </div>
  );
}