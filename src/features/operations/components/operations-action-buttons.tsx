import {
  cancelJobAction,
  ignoreDeliveryAction,
  replayJobAction,
  retryDeliveryAction
} from "@/features/operations/actions/operations-actions";

function HiddenField({ name, value }: { name: string; value: string }) {
  return <input name={name} type="hidden" value={value} />;
}

function ActionButton({
  label,
  tone = "default"
}: {
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <button
      className={
        tone === "danger"
          ? "inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-900 transition hover:bg-rose-100"
          : "inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition hover:border-cyan/30 hover:text-cyan"
      }
      type="submit"
    >
      {label}
    </button>
  );
}

export function DeliveryActionButtons({
  deliveryId,
  returnTo,
  allowRetry,
  allowForceRetry,
  allowIgnore
}: {
  deliveryId: string;
  returnTo: string;
  allowRetry: boolean;
  allowForceRetry: boolean;
  allowIgnore: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {allowRetry ? (
        <form action={retryDeliveryAction}>
          <HiddenField name="deliveryId" value={deliveryId} />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Retry" />
        </form>
      ) : null}

      {allowForceRetry ? (
        <form action={retryDeliveryAction}>
          <HiddenField name="deliveryId" value={deliveryId} />
          <HiddenField name="force" value="true" />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Force Retry" />
        </form>
      ) : null}

      {allowIgnore ? (
        <form action={ignoreDeliveryAction}>
          <HiddenField name="deliveryId" value={deliveryId} />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Ignore" tone="danger" />
        </form>
      ) : null}
    </div>
  );
}

export function JobActionButtons({
  jobId,
  returnTo,
  allowReplay,
  allowForceReplay,
  allowCancel
}: {
  jobId: string;
  returnTo: string;
  allowReplay: boolean;
  allowForceReplay: boolean;
  allowCancel: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {allowReplay ? (
        <form action={replayJobAction}>
          <HiddenField name="jobId" value={jobId} />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Replay" />
        </form>
      ) : null}

      {allowForceReplay ? (
        <form action={replayJobAction}>
          <HiddenField name="jobId" value={jobId} />
          <HiddenField name="force" value="true" />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Force Replay" />
        </form>
      ) : null}

      {allowCancel ? (
        <form action={cancelJobAction}>
          <HiddenField name="jobId" value={jobId} />
          <HiddenField name="returnTo" value={returnTo} />
          <ActionButton label="Cancel Job" tone="danger" />
        </form>
      ) : null}
    </div>
  );
}
