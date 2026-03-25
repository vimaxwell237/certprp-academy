import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export function AdminShell({
  children,
  currentPath
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  return (
    <section className="w-full pb-12">
      <div className="flex flex-col gap-6 xl:flex-row">
        <AdminSidebar currentPath={currentPath} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
