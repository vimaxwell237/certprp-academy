import type { OperationRemediationPlaybook } from "@/types/operations";

function playbookToneClassName(severity: OperationRemediationPlaybook["severity"]) {
  if (severity === "danger") {
    return "border-rose-200 bg-rose-50";
  }

  if (severity === "warning") {
    return "border-amber-200 bg-amber-50";
  }

  return "border-cyan-100 bg-cyan-50";
}

export function OperationsRemediationPlaybooksPanel({
  playbooks
}: {
  playbooks: OperationRemediationPlaybook[];
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Remediation
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Playbook Summary</h3>
        <p className="text-sm text-slate">
          Deterministic next-step guidance based on recent health patterns and execution history.
        </p>
      </div>

      {playbooks.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No remediation playbook is needed for the current automation pattern.
        </div>
      ) : (
        <div className="space-y-3">
          {playbooks.map((playbook) => (
            <div
              className={`rounded-2xl border px-4 py-4 ${playbookToneClassName(playbook.severity)}`}
              key={playbook.category}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                {playbook.category.replaceAll("_", " ")}
              </p>
              <h4 className="mt-2 font-semibold text-ink">{playbook.title}</h4>
              <p className="mt-2 text-sm text-slate">{playbook.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate">
                {playbook.steps.map((step) => (
                  <li key={step}>- {step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
