import { addOperationCommentAction } from "@/features/operations/actions/operations-actions";
import type {
  AdminOperatorOption,
  OperationCommentRecord,
  OperationEntityType
} from "@/types/operations";

function renderInlineMentions(value: string) {
  const segments = value.split(/(@[a-z0-9][a-z0-9._-]{0,49})/gi);

  return segments.map((segment, index) =>
    segment.startsWith("@") ? (
      <span className="font-semibold text-cyan-900" key={`${segment}-${index}`}>
        {segment}
      </span>
    ) : (
      <span key={`${segment}-${index}`}>{segment}</span>
    )
  );
}

function renderCommentBody(commentBody: string) {
  const blocks = commentBody.split(/```/);

  return blocks.map((block, index) =>
    index % 2 === 1 ? (
      <pre
        className="overflow-x-auto rounded-2xl bg-white px-4 py-3 font-mono text-xs text-ink"
        key={`code-${index}`}
      >
        {block.trim()}
      </pre>
    ) : (
      <div className="space-y-2" key={`text-${index}`}>
        {block
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((paragraph, paragraphIndex) => (
            <p className="whitespace-pre-wrap break-words" key={`paragraph-${paragraphIndex}`}>
              {renderInlineMentions(paragraph)}
            </p>
          ))}
      </div>
    )
  );
}

export function OperationsCommentsPanel({
  entityType,
  entityId,
  comments,
  operators,
  returnTo
}: {
  entityType: OperationEntityType;
  entityId: string;
  comments: OperationCommentRecord[];
  operators: AdminOperatorOption[];
  returnTo: string;
}) {
  const mentionExamples = operators.slice(0, 4).map((operator) => `@${operator.handle}`).join(", ");

  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Collaboration
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Operator Comments</h3>
        <p className="text-sm text-slate">
          Use comments for handoffs and collaboration. Mention admins with handles like{" "}
          {mentionExamples || "@operator"}.
        </p>
      </div>

      <form action={addOperationCommentAction} className="space-y-3">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <textarea
          className="min-h-28 w-full rounded-3xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/40"
          name="commentBody"
          placeholder="Add internal collaboration context. Mention another admin with @handle."
          required
        />
        <button
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          type="submit"
        >
          Post Comment
        </button>
      </form>

      {comments.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No collaboration comments have been posted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={comment.id}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{comment.adminUserLabel}</p>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                  @{comment.adminUserHandle}
                </span>
                <span className="text-xs">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 space-y-3">{renderCommentBody(comment.commentBody)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
