"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getAuthUser, type AuthUser } from "@/services/api";
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

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
                  aria-label={item.label}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user ? (
              <>
                <span
                  className="nav-link"
                  style={{ cursor: "default", color: "#667085" }}
                  title={user.email}
                >
                  <span>{user.full_name || user.email}</span>
                </span>
                <button
                  type="button"
                  className="nav-link"
                  onClick={handleLogout}
                  style={{ border: 0, background: "transparent" }}
                >
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`nav-link ${pathname === "/login" ? "active" : ""}`}
              >
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main">{children}</main>
    </div>
  );
}