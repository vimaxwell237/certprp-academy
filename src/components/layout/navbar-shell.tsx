"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/features/auth/actions/logout";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { NavigationUser } from "@/types/auth";

import { NavDropdown, type NavDropdownItem } from "./nav-dropdown";

interface NavbarShellProps {
  isReady?: boolean;
  user: NavigationUser | null;
}

function isRouteActive(pathname: string, href: string) {
  if (href === APP_ROUTES.home) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildUserInitial(email?: string) {
  const source = email?.trim();

  if (!source) {
    return "A";
  }

  return source.charAt(0).toUpperCase();
}

function buildNavLinkClass(isActive: boolean) {
  return `rounded-full px-3 py-2 transition ${
    isActive
      ? "bg-white text-ink shadow-sm"
      : "text-slate hover:bg-white hover:text-ink"
  }`;
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 20 20"
    >
      {isOpen ? (
        <path
          d="M5 5 15 15M15 5 5 15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      ) : (
        <>
          <path d="M4 6h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M4 10h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M4 14h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function LoadingNav() {
  return (
    <>
      <div className="hidden items-center gap-2 sm:flex">
        {[72, 78, 68].map((width) => (
          <span
            aria-hidden="true"
            className="h-10 animate-pulse rounded-full bg-white/80"
            key={width}
            style={{ width }}
          />
        ))}
      </div>
      <span className="inline-flex items-center rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-slate shadow-sm sm:hidden">
        Loading
      </span>
    </>
  );
}

export function NavbarShell({ isReady = true, user }: NavbarShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = pathname ?? APP_ROUTES.home;
  const mobileMenuId = "mobile-site-menu";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const isAuthenticated = isReady && Boolean(user?.email);
  const isAdmin = user?.role === "admin";
  const isTutor = user?.role === "tutor";
  const unreadNotifications = user?.notificationUnreadCount ?? 0;
  const publicNavItems = [
    { href: APP_ROUTES.home, label: "Home" },
    { href: APP_ROUTES.pricing, label: "Pricing" },
    { href: APP_ROUTES.login, label: "Login" },
    { href: APP_ROUTES.signup, label: "Sign Up" }
  ] as const;

  const learningItems: NavDropdownItem[] = [
    { href: APP_ROUTES.quizzes, label: "Quizzes" },
    { href: APP_ROUTES.subnettingPractice, label: "Subnetting Trainer" },
    { href: APP_ROUTES.subnettingCalculator, label: "Subnetting Calculator" },
    { href: APP_ROUTES.labs, label: "Labs" },
    { href: APP_ROUTES.cliPractice, label: "CLI Practice" },
    { href: APP_ROUTES.examSimulator, label: "Exam Simulator" },
    { href: APP_ROUTES.studyPlan, label: "Study Plan" }
  ];

  const supportItems: NavDropdownItem[] = [
    { href: APP_ROUTES.aiTutor, label: "AI Tutor" },
    { href: APP_ROUTES.community, label: "Community" },
    { href: APP_ROUTES.support, label: "Support" },
    { href: APP_ROUTES.sessions, label: "Sessions" },
    {
      badgeCount: unreadNotifications,
      href: APP_ROUTES.notifications,
      label: "Notifications"
    },
    ...(isTutor
      ? [{ href: APP_ROUTES.tutorSchedule, label: "Tutor Schedule" as const }]
      : [])
  ];

  const accountItems: NavDropdownItem[] = [
    ...(isAdmin ? [{ href: APP_ROUTES.admin, label: "Admin" as const }] : []),
    { href: APP_ROUTES.billing, label: "Billing" },
    { href: APP_ROUTES.settingsNotifications, label: "Notification Settings" }
  ];

  const supportIsActive = supportItems.some((item) => isRouteActive(currentPath, item.href));
  const learningIsActive = learningItems.some((item) => isRouteActive(currentPath, item.href));
  const accountIsActive = accountItems.some((item) => isRouteActive(currentPath, item.href));

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/60 bg-pearl/85 backdrop-blur-xl transition-shadow ${
        isMobileMenuOpen ? "shadow-lg shadow-slate-900/10" : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="font-display text-lg font-bold tracking-tight text-ink transition hover:text-cyan sm:text-xl"
            href={APP_ROUTES.home}
          >
            CertPrep Academy
          </Link>
          <span className="hidden rounded-full border border-cyan/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate/80 lg:inline-flex">
            CCNA First
          </span>
        </div>

        {!isReady ? (
          <LoadingNav />
        ) : isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-1.5 text-sm font-medium xl:flex">
              <Link
                className={buildNavLinkClass(isRouteActive(currentPath, APP_ROUTES.home))}
                href={APP_ROUTES.home}
              >
                Home
              </Link>
              <Link
                className={buildNavLinkClass(isRouteActive(currentPath, APP_ROUTES.pricing))}
                href={APP_ROUTES.pricing}
              >
                Pricing
              </Link>
              <Link
                className={buildNavLinkClass(isRouteActive(currentPath, APP_ROUTES.courses))}
                href={APP_ROUTES.courses}
              >
                Courses
              </Link>
              <NavDropdown
                isActive={learningIsActive}
                items={learningItems}
                label="Learning"
                panelLabel="Learning"
              />
              <NavDropdown
                isActive={supportIsActive}
                items={supportItems}
                label="Support"
                panelLabel="Support"
              />
              <Link
                className={buildNavLinkClass(isRouteActive(currentPath, APP_ROUTES.dashboard))}
                href={APP_ROUTES.dashboard}
              >
                Dashboard
              </Link>
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <NavDropdown
                align="right"
                footer={
                  <form action={logout}>
                    <button
                      className="w-full rounded-2xl bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                      type="submit"
                    >
                      Sign out
                    </button>
                  </form>
                }
                isActive={accountIsActive}
                items={accountItems}
                label="Account"
                panelLabel={user?.email ?? "Account"}
              />
            </div>

            <button
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-cyan/30 hover:text-cyan xl:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              type="button"
            >
              <MenuIcon isOpen={isMobileMenuOpen} />
              <span>{isMobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </>
        ) : (
          <>
            <nav className="hidden items-center gap-2 text-sm font-medium text-slate sm:flex">
              {publicNavItems.map((item) => (
                <Link
                  className={
                    item.href === APP_ROUTES.signup
                      ? "rounded-full bg-ink px-4 py-2 text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                      : buildNavLinkClass(isRouteActive(currentPath, item.href))
                  }
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-cyan/30 hover:text-cyan sm:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              type="button"
            >
              <MenuIcon isOpen={isMobileMenuOpen} />
              <span>{isMobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </>
        )}
      </div>

      {isReady && isMobileMenuOpen ? (
        <div
          className="animate-[mobile-menu-enter_220ms_ease-out] border-t border-white/60 bg-white/95 px-4 py-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:px-6 xl:hidden"
          id={mobileMenuId}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
            {isAuthenticated ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { href: APP_ROUTES.home, label: "Home" },
                    { href: APP_ROUTES.pricing, label: "Pricing" },
                    { href: APP_ROUTES.courses, label: "Courses" },
                    { href: APP_ROUTES.dashboard, label: "Dashboard" }
                  ].map((item) => (
                    <Link
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isRouteActive(currentPath, item.href)
                          ? "bg-ink text-white"
                          : "bg-mist text-ink hover:bg-white"
                      }`}
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-3xl border border-ink/5 bg-mist/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">
                      Learning
                    </p>
                    <div className="mt-3 space-y-2">
                      {learningItems.map((item) => (
                        <Link
                          className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-pearl"
                          href={item.href}
                          key={item.href}
                        >
                          <span>{item.label}</span>
                          {(item.badgeCount ?? 0) > 0 ? (
                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-white">
                              {item.badgeCount}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-ink/5 bg-mist/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">
                      Support
                    </p>
                    <div className="mt-3 space-y-2">
                      {supportItems.map((item) => (
                        <Link
                          className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-pearl"
                          href={item.href}
                          key={item.href}
                        >
                          <span>{item.label}</span>
                          {(item.badgeCount ?? 0) > 0 ? (
                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-white">
                              {item.badgeCount}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="rounded-3xl border border-ink/5 bg-mist/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                      {buildUserInitial(user?.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">Account</p>
                      <p className="truncate text-xs text-slate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {accountItems.map((item) => (
                      <Link
                        className="block rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-pearl"
                        href={item.href}
                        key={item.href}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <form action={logout}>
                      <button
                        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                        type="submit"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                </section>
              </>
            ) : (
              <section className="rounded-3xl border border-ink/5 bg-mist/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">
                  Navigation
                </p>
                <div className="mt-3 space-y-2">
                  {publicNavItems.map((item) => (
                    <Link
                      className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        item.href === APP_ROUTES.signup
                          ? "bg-ink text-white hover:bg-slate-900"
                          : isRouteActive(currentPath, item.href)
                            ? "bg-white text-ink"
                            : "bg-white text-ink hover:bg-pearl"
                      }`}
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
