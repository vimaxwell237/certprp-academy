"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "placeholder"
> & {
  label: string;
  name: string;
  placeholder: string;
  helperText?: string;
};

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M10.584 5.407A9.84 9.84 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a17.817 17.817 0 0 1-4.192 4.963M14.12 14.121A3 3 0 0 1 9.88 9.88"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M6.71 6.709C4.323 8.217 2.75 12 2.75 12s3.75 6.75 9.75 6.75a9.76 9.76 0 0 0 4.042-.857"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function PasswordField({
  label,
  name,
  placeholder,
  helperText,
  className = "",
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {helperText ? <span className="block text-xs text-slate">{helperText}</span> : null}
      <div className="relative">
        <input
          {...inputProps}
          className={`w-full rounded-2xl border border-mist bg-pearl px-4 py-3 pr-14 text-base text-ink outline-none transition placeholder:text-slate/60 focus:border-cyan focus:bg-white ${className}`.trim()}
          name={name}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate transition hover:bg-cyan/10 hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
          onClick={() => setIsVisible((existing) => !existing)}
          type="button"
        >
          <span className="sr-only">
            {isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          </span>
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}
