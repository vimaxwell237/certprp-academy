"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/features/auth/actions/logout";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { NavigationUser } from "@/types/auth";

import { NavDropdown, type NavDropdownItem } from "./nav-dropdown";

interface NavbarShellProps {
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

export function NavbarShell({ user }: NavbarShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = pathname ?? APP_ROUTES.home;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const isAuthenticated = Boolean(user?.email);
  const isAdmin = user?.role === "admin";
  const isTutor = user?.role === "tutor";
  const unreadNotifications = user?.notificationUnreadCount ?? 0;

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
    <header className="sticky top-0 z-40 border-b border-white/60 bg-pearl/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            className="font-display text-xl font-bold tracking-tight text-ink"
            href={APP_ROUTES.home}
          >
            CertPrep Academy
          </Link>
        </div>

        {isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-2 text-sm font-medium lg:flex">
              <Link
                className={`rounded-full px-3 py-2 transition ${
                  isRouteActive(currentPath, APP_ROUTES.home)
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate hover:bg-white hover:text-ink"
                }`}
                href={APP_ROUTES.home}
              >
                Home
              </Link>
              <Link
                className={`rounded-full px-3 py-2 transition ${
                  isRouteActive(currentPath, APP_ROUTES.pricing)
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate hover:bg-white hover:text-ink"
                }`}
                href={APP_ROUTES.pricing}
              >
                Pricing
              </Link>
              <Link
                className={`rounded-full px-3 py-2 transition ${
                  isRouteActive(currentPath, APP_ROUTES.courses)
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate hover:bg-white hover:text-ink"
                }`}
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
                className={`rounded-full px-3 py-2 transition ${
                  isRouteActive(currentPath, APP_ROUTES.dashboard)
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate hover:bg-white hover:text-ink"
                }`}
                href={APP_ROUTES.dashboard}
              >
                Dashboard
              </Link>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
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
              aria-expanded={isMobileMenuOpen}
              className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-cyan/30 hover:text-cyan lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              type="button"
            >
              Menu
            </button>
          </>
        ) : (
          <nav className="flex items-center gap-3 text-sm font-medium text-slate">
            <Link
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-ink"
              href={APP_ROUTES.home}
            >
              Home
            </Link>
            <Link
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-ink"
              href={APP_ROUTES.pricing}
            >
              Pricing
            </Link>
            <Link
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-ink"
              href={APP_ROUTES.login}
            >
              Login
            </Link>
            <Link
              className="rounded-full bg-ink px-4 py-2 text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              href={APP_ROUTES.signup}
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>

      {isAuthenticated && isMobileMenuOpen ? (
        <div className="border-t border-white/60 bg-white/95 px-6 py-5 shadow-xl shadow-slate-900/5 backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
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

            <div className="grid gap-4 md:grid-cols-2">
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
                <div>
                  <p className="text-sm font-semibold text-ink">Account</p>
                  <p className="text-xs text-slate">{user?.email}</p>
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
          </div>
        </div>
      ) : null}
    </header>
  );
}
