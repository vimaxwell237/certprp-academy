function getErrorMessageText(error: unknown) {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
}

const sensitiveErrorPatterns = [
  /service role/i,
  /environment variables? .*not configured/i,
  /api key/i,
  /secret/i,
  /token/i,
  /credential/i
];

function shouldHidePublicErrorMessage(message: string) {
  return sensitiveErrorPatterns.some((pattern) => pattern.test(message));
}

export function getPublicErrorMessage(error: unknown, fallback: string) {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  const message = getErrorMessageText(error);

  if (!message || shouldHidePublicErrorMessage(message)) {
    return fallback;
  }

  return message;
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

export function isPasswordRecoveryRateLimitError(error: unknown) {
  const message = getErrorMessageText(error)?.toLowerCase();

  if (!message) {
    return false;
  }

  return (
    message.includes("email rate limit exceeded") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("over_email_send_rate_limit")
  );
}

export function getSafePasswordRecoveryErrorMessage(error: unknown) {
  if (isPasswordRecoveryRateLimitError(error)) {
    return "Too many reset emails were requested recently. Wait a minute, then use the newest reset email in your inbox or try again.";
  }

  if (process.env.NODE_ENV !== "production") {
    return getErrorMessageText(error) ?? "We could not send the reset email right now. Please try again.";
  }

  return "We could not send the reset email right now. Check your inbox and spam folder for a recent reset email, then try again in a minute.";
}
