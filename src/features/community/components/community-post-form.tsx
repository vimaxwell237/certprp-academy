import { createCommunityPostAction } from "@/features/community/actions/community-actions";
import { COMMUNITY_TOPIC_OPTIONS } from "@/features/community/lib/community-display";
import type { CommunityCreateFormData } from "@/types/community";

export function CommunityPostForm({
  formData
}: {
  formData: CommunityCreateFormData;
}) {
  return (
    <form
      action={createCommunityPostAction}
      className="space-y-6 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Community Post
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Start a Discussion
        </h1>
        <p className="text-base text-slate">
          Ask questions, compare approaches, and learn out loud with other CCNA learners.
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

      <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Subject</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.subject}
            name="subject"
            placeholder="Example: I keep mixing up OSPF neighbor states"
            required
            type="text"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Topic</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.topic}
            name="topic"
          >
            {COMMUNITY_TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Post</span>
        <textarea
          className="min-h-40 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
          defaultValue={formData.initialValues.messageBody}
          name="messageBody"
          placeholder="Explain what is confusing you, what you tried already, and what kind of explanation would help."
          required
        />
      </label>

      <button
        className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
        type="submit"
      >
        Post to Community
      </button>
    </form>
  );
}
