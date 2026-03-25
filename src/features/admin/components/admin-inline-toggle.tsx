"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { AdminActionState } from "@/types/admin";

type ToggleAction = (
  state: AdminActionState,
  formData: FormData
) => Promise<AdminActionState>;

export function AdminInlineToggle({
  action,
  label,
  nextValue,
  recordId
}: {
  action: ToggleAction;
  label: string;
  nextValue: boolean;
  recordId: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: null,
    fieldErrors: {},
    savedRecordId: null
  });

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-2">
      <input name="recordId" type="hidden" value={recordId} />
      <input name="nextValue" type="hidden" value={String(nextValue)} />
      <Button className="px-4 py-2" disabled={isPending} type="submit" variant="secondary">
        {isPending ? "Updating..." : label}
      </Button>
      {state.status === "error" && state.message ? (
        <p className="max-w-[14rem] text-xs text-rose-700">{state.message}</p>
      ) : null}
    </form>
  );
}
