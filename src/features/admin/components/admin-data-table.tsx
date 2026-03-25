import { Card } from "@/components/ui/card";

export interface AdminTableColumn<T> {
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

export function AdminDataTable<T>({
  columns,
  emptyMessage,
  items,
  title,
  getKey
}: {
  columns: AdminTableColumn<T>[];
  emptyMessage: string;
  items: T[];
  title: string;
  getKey: (item: T) => string;
}) {
  return (
    <Card className="overflow-hidden border-ink/5 p-0">
      <div className="border-b border-ink/5 px-6 py-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink/5 text-sm">
            <thead className="bg-pearl/80">
              <tr>
                {columns.map((column) => (
                  <th
                    className={`px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate ${column.className ?? ""}`}
                    key={column.header}
                    scope="col"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 bg-white">
              {items.map((item) => (
                <tr key={getKey(item)}>
                  {columns.map((column) => (
                    <td className={`px-6 py-4 align-top text-slate ${column.className ?? ""}`} key={column.header}>
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
