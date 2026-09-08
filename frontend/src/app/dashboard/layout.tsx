"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/auth";

type NavLeaf = { href: string; label: string; exact: boolean };
type NavGroup = { label: string; basePath: string; children: NavLeaf[] };
type NavEntry = NavLeaf | NavGroup;

function isGroup(item: NavEntry): item is NavGroup {
  return (item as NavGroup).children !== undefined;
}

const NAV_ITEMS: NavEntry[] = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/hr", label: "HR Management", exact: false },
  {
    label: "Teachers",
    basePath: "/dashboard/teachers",
    children: [
      { href: "/dashboard/teachers", label: "Teachers", exact: true },
      { href: "/dashboard/teachers/structure-report", label: "Structure Report", exact: false },
    ],
  },
  { href: "/dashboard/students", label: "Students", exact: false },
  { href: "/dashboard/subjects", label: "Subjects", exact: false },
  {
    label: "Admin Staff",
    basePath: "/dashboard/admin-staff",
    children: [
      { href: "/dashboard/admin-staff", label: "Admin Staff", exact: true },
      { href: "/dashboard/admin-staff/requirements", label: "Position Requirements", exact: false },
    ],
  },
  {
    label: "Transport",
    basePath: "/dashboard/transport",
    children: [
      { href: "/dashboard/transport", label: "Transport Staff", exact: true },
      { href: "/dashboard/transport/role-requirements", label: "Role Requirements", exact: false },
      { href: "/dashboard/transport/fleet-summary", label: "Fleet Summary", exact: false },
    ],
  },
  { href: "/dashboard/staffing-report", label: "Staffing Report", exact: false },
  { href: "/dashboard/settings", label: "Registration Settings", exact: false },
];

type Me = {
  username?: string;
  email?: string;
};

function initials(name?: string) {
  if (!name) return "•";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groupBasePaths = NAV_ITEMS.filter(isGroup).map((g) => g.basePath);
  const [openGroups, setOpenGroups] = useState<string[]>(
    groupBasePaths.filter((base) => pathname === base || pathname?.startsWith(base + "/"))
  );

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // Individual pages already guard + redirect on 401; this just
        // keeps the sidebar from showing stale user info if that happens.
      });
  }, []);

  useEffect(() => {
    // Auto-open whichever group the current page belongs to.
    setOpenGroups((prev) => {
      const active = groupBasePaths.find(
        (base) => pathname === base || pathname?.startsWith(base + "/")
      );
      if (active && !prev.includes(active)) return [...prev, active];
      return prev;
    });
    // Close the mobile drawer whenever the route changes.
    setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/");
  }

  function isGroupActive(basePath: string) {
    return pathname === basePath || pathname?.startsWith(basePath + "/");
  }

  function toggleGroup(basePath: string) {
    setOpenGroups((prev) =>
      prev.includes(basePath) ? prev.filter((b) => b !== basePath) : [...prev, basePath]
    );
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const currentLabel =
    NAV_ITEMS.flatMap((item) => (isGroup(item) ? item.children : [item])).find((leaf) =>
      isActive(leaf.href, leaf.exact)
    )?.label ?? "Dashboard";

  return (
    <div className="dashboard-shell">
      {sidebarOpen && (
        <div
          className="dashboard-sidebar__scrim"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          "dashboard-sidebar" + (sidebarOpen ? " dashboard-sidebar--open" : "")
        }
      >
        <div className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__crest">I</span>
          <div>
            <p className="dashboard-sidebar__title">IIS Brain</p>
            <p className="dashboard-sidebar__subtitle">Staffing Review</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          {NAV_ITEMS.map((item) => {
            if (isGroup(item)) {
              const open = openGroups.includes(item.basePath);
              return (
                <div key={item.basePath} className="dashboard-nav__group">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.basePath)}
                    className={
                      "dashboard-nav__item dashboard-nav__item--toggle" +
                      (isGroupActive(item.basePath) ? " dashboard-nav__item--active" : "")
                    }
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        "dashboard-nav__chevron" + (open ? " dashboard-nav__chevron--open" : "")
                      }
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                  {open && (
                    <div className="dashboard-nav__sub">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={
                            "dashboard-nav__subitem" +
                            (isActive(child.href, child.exact)
                              ? " dashboard-nav__subitem--active"
                              : "")
                          }
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "dashboard-nav__item" +
                  (isActive(item.href, item.exact) ? " dashboard-nav__item--active" : "")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dashboard-sidebar__footer">
          {user && (
            <div className="dashboard-sidebar__user">
              <span className="dashboard-sidebar__avatar" aria-hidden="true">
                {initials(user.username)}
              </span>
              <div>
                <p className="dashboard-sidebar__user-name">{user.username}</p>
                {user.email && (
                  <p className="dashboard-sidebar__user-email">{user.email}</p>
                )}
              </div>
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

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-topbar__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="dashboard-topbar__brand">{currentLabel}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
