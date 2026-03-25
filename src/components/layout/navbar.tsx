import type { NavigationUser } from "@/types/auth";

import { NavbarShell } from "./navbar-shell";

export function Navbar({ user }: { user: NavigationUser | null }) {
  return <NavbarShell user={user} />;
}
