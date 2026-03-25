import { Card } from "@/components/ui/card";
import type { LabFileSummary } from "@/types/lab";

const fileTypeLabels: Record<LabFileSummary["fileType"], string> = {
  packet_tracer: "Packet Tracer",
  guide: "Guide",
  topology: "Topology",
  solution: "Solution",
  reference: "Reference"
};

export function LabFilesSection({ files }: { files: LabFileSummary[] }) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Downloads
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink">Lab Resources</h2>
      </div>

      {files.length === 0 ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No files are attached to this lab yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {files.map((file) => (
            <li
              className="flex flex-col gap-3 rounded-2xl border border-ink/5 bg-pearl p-4 md:flex-row md:items-center md:justify-between"
              key={file.id}
            >
              <div className="space-y-1">
                <p className="font-semibold text-ink">{file.fileName}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {fileTypeLabels[file.fileType]}
                </p>
                <p className="text-xs text-slate">{file.filePath}</p>
              </div>

              {file.isAvailable && file.downloadUrl ? (
                <a
                  className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                  href={file.downloadUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download
                </a>
              ) : (
                <p className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                  File Placeholder Only
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
