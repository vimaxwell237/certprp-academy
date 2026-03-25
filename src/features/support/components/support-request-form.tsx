import { createSupportRequest } from "@/features/support/actions/support-actions";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_PRIORITY_OPTIONS
} from "@/features/support/lib/support-display";
import type { SupportCreateFormData } from "@/types/support";

export function SupportRequestForm({
  formData
}: {
  formData: SupportCreateFormData;
}) {
  return (
    <form action={createSupportRequest} className="space-y-6 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          New Support Request
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Ask for Tutor Help
        </h1>
        <p className="text-base text-slate">
          Describe what is blocking you and, when useful, link the request to the exact
          lesson, quiz attempt, exam attempt, lab, or CLI challenge.
        </p>
      </div>

      {formData.invalidContextReasons.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          {formData.invalidContextReasons.join(" ")}
        </div>
      ) : null}

      {formData.contextPreview.length > 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Linked Context
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.contextPreview.map((context) => (
              <span
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
                key={context.type}
              >
                {context.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <input name="lessonId" type="hidden" value={formData.initialValues.lessonId} />
      <input
        name="quizAttemptId"
        type="hidden"
        value={formData.initialValues.quizAttemptId}
      />
      <input
        name="examAttemptId"
        type="hidden"
        value={formData.initialValues.examAttemptId}
      />
      <input name="labId" type="hidden" value={formData.initialValues.labId} />
      <input
        name="cliChallengeId"
        type="hidden"
        value={formData.initialValues.cliChallengeId}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Subject</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.subject}
            name="subject"
            placeholder="Example: OSPF quiz result needs clarification"
            required
            type="text"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Assign Tutor</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.tutorProfileId}
            name="tutorProfileId"
          >
            <option value="">Any available tutor</option>
            {formData.tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Category</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.category}
            name="category"
          >
            {SUPPORT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Priority</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.priority}
            name="priority"
          >
            {SUPPORT_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Message</span>
        <textarea
          className="min-h-40 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
          defaultValue={formData.initialValues.messageBody}
          name="messageBody"
          placeholder="Explain what you are stuck on, what you already tried, and what kind of help would unblock you."
          required
        />
      </label>

      <button
        className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
        type="submit"
      >
        Create Support Request
      </button>
    </form>
  );
}
