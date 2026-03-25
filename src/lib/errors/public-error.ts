export function getPublicErrorMessage(error: unknown, fallback: string) {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function getSafeAuthErrorMessage(
  mode: "login" | "signup",
  error: unknown
) {
  if (!(error instanceof Error)) {
    return mode === "login"
      ? "We could not sign you in. Please check your credentials and try again."
      : "We could not create your account right now. Please review your details and try again.";
  }

  if (process.env.NODE_ENV !== "production") {
    return error.message;
  }

  return mode === "login"
    ? "We could not sign you in. Please check your credentials and try again."
    : "We could not create your account right now. If this email is already registered, try logging in instead.";
}
