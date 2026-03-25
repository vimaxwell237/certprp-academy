"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminActionState, AdminSelectOption } from "@/types/admin";

type FieldType = "text" | "textarea" | "number" | "url" | "select" | "checkbox";

export interface AdminEntityField {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  min?: number;
  step?: number;
  options?: AdminSelectOption[];
}

type AdminFormAction = (
  state: AdminActionState,
  formData: FormData
) => Promise<AdminActionState>;

export function AdminEntityForm<T extends object>({
  action,
  fields,
  initialValues,
  recordId,
  submitLabel,
  title
}: {
  action: AdminFormAction;
  fields: AdminEntityField[];
  initialValues: T;
  recordId?: string;
  submitLabel: string;
  title: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: null,
    fieldErrors: {},
    savedRecordId: null
  });

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();

    if (!recordId) {
      formRef.current?.reset();
    }
  }, [recordId, router, state.status]);

  return (
    <Card className="border-ink/5">
      <form action={formAction} className="space-y-5" ref={formRef}>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm text-slate">
            Use draft mode to stage changes before they become visible to learners.
          </p>
        </div>

        <input name="recordId" type="hidden" value={recordId ?? ""} />

        {fields.map((field) => {
          const error = state.fieldErrors[field.name];
          const defaultValue = (initialValues as Record<string, unknown>)[field.name];

          return (
            <label className="block space-y-2" htmlFor={field.name} key={field.name}>
              <span className="block text-sm font-semibold text-ink">{field.label}</span>
              {field.description ? (
                <span className="block text-xs text-slate">{field.description}</span>
              ) : null}

              {field.type === "textarea" ? (
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 6}
                />
              ) : null}

              {field.type === "select" ? (
                <select
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                  id={field.name}
                  name={field.name}
                >
                  <option value="">Select an option</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                      {option.hint ? ` - ${option.hint}` : ""}
                    </option>
                  ))}
                </select>
              ) : null}

              {field.type === "checkbox" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-3">
                  <input
                    className="h-4 w-4 rounded border-ink/20 text-cyan focus:ring-cyan"
                    defaultChecked={Boolean(defaultValue)}
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                  />
                  <span className="text-sm text-ink">
                    {field.description ?? "Enable this state"}
                  </span>
                </div>
              ) : null}

              {field.type !== "textarea" && field.type !== "select" && field.type !== "checkbox" ? (
                <input
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={
                    typeof defaultValue === "number"
                      ? String(defaultValue)
                      : typeof defaultValue === "string"
                        ? defaultValue
                        : ""
                  }
                  id={field.name}
                  min={field.min}
                  name={field.name}
                  placeholder={field.placeholder}
                  step={field.step}
                  type={field.type}
                />
              ) : null}

              {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
            </label>
          );
        })}

        {state.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.status === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
