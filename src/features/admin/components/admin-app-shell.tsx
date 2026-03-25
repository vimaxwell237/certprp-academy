"use client";

import { usePathname } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <AdminShell currentPath={pathname ?? "/admin"}>{children}</AdminShell>;
}
