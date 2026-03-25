import { addOperationNoteAction } from "@/features/operations/actions/operations-actions";
import type { OperationEntityType, OperationNoteRecord } from "@/types/operations";

export function OperationsNotesPanel({
  entityType,
  entityId,
  notes,
  returnTo
}: {
  entityType: OperationEntityType;
  entityId: string;
  notes: OperationNoteRecord[];
  returnTo: string;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Operator Notes
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Internal Notes</h3>
      </div>

      <form action={addOperationNoteAction} className="space-y-3">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <textarea
          className="min-h-28 w-full rounded-3xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="noteBody"
          placeholder="Add triage context, remediation steps, or handoff notes."
          required
        />
        <button
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          type="submit"
        >
          Save Note
        </button>
      </form>

      {notes.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No operator notes have been added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={note.id}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{note.adminUserLabel}</p>
                <span className="text-xs">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words">{note.noteBody}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
