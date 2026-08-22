"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/teachers", label: "Teachers", exact: false },
  { href: "/dashboard/students", label: "Students", exact: false },
  { href: "/dashboard/subjects", label: "Subjects", exact: false },
  { href: "/dashboard/admin-staff", label: "Admin Staff", exact: false },
  { href: "/dashboard/transport", label: "Transport", exact: false },
  { href: "/dashboard/staffing-report", label: "Staffing Report", exact: false },
];

type Me = {
  username?: string;
  email?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // Individual pages already guard + redirect on 401; this just
        // keeps the sidebar from showing stale user info if that happens.
      });
  }, []);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/");
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__crest">I</span>
          <div>
            <p className="dashboard-sidebar__title">IIS Brain</p>
            <p className="dashboard-sidebar__subtitle">Staffing Review</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "dashboard-nav__item" +
                (isActive(item.href, item.exact)
                  ? " dashboard-nav__item--active"
                  : "")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          {user && (
            <div className="dashboard-sidebar__user">
              <p className="dashboard-sidebar__user-name">{user.username}</p>
              {user.email && (
                <p className="dashboard-sidebar__user-email">{user.email}</p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-sidebar__logout"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: var(--aasr-bg);
        }

        .dashboard-sidebar {
          display: none;
          flex-direction: column;
          width: 15.5rem;
          flex-shrink: 0;
          background: linear-gradient(
            180deg,
            var(--aasr-navy) 0%,
            var(--aasr-navy-2) 100%
          );
          color: #fff;
          padding: 1.75rem 1.25rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        @media (min-width: 860px) {
          .dashboard-sidebar {
            display: flex;
          }
        }

        .dashboard-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 2.25rem;
        }

        .dashboard-sidebar__crest {
          font-family: var(--font-source-serif), Georgia, serif;
          font-size: 1.05rem;
          font-weight: 600;
          width: 2.2rem;
          height: 2.2rem;
          border: 1px solid var(--aasr-gold);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--aasr-gold);
          flex-shrink: 0;
        }

        .dashboard-sidebar__title {
          font-family: var(--font-source-serif), Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .dashboard-sidebar__subtitle {
          margin: 0.1rem 0 0;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .dashboard-nav {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          flex: 1;
        }

        .dashboard-nav__item {
          display: block;
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.6rem 0.7rem;
          border-left: 2px solid transparent;
          text-decoration: none;
          transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .dashboard-nav__item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.04);
        }

        .dashboard-nav__item--active {
          color: #fff;
          border-left-color: var(--aasr-gold);
          background: rgba(255, 255, 255, 0.06);
        }

        .dashboard-sidebar__footer {
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          padding-top: 1rem;
        }

        .dashboard-sidebar__user-name {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
        }

        .dashboard-sidebar__user-email {
          margin: 0.1rem 0 0.75rem;
          font-size: 0.74rem;
          color: rgba(255, 255, 255, 0.5);
          word-break: break-all;
        }

        .dashboard-sidebar__logout {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.45rem 0.7rem;
          margin-top: 0.25rem;
          border-radius: 0.4rem;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .dashboard-sidebar__logout:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .dashboard-main {
          flex: 1;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
