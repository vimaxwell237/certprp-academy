type AuthErrorLike = {
  code?: string;
  message?: string;
};

const RECOVERABLE_AUTH_ERROR_CODES = new Set([
  "bad_jwt",
  "refresh_token_already_used",
  "refresh_token_not_found",
  "session_not_found"
]);

const RECOVERABLE_AUTH_MESSAGE_PATTERNS = [
  "auth session missing",
  "invalid refresh token",
  "jwt expired",
  "refresh token not found",
  "refresh token: already used",
  "session expired",
  "session from session_id claim in jwt does not exist",
  "user from sub claim in jwt does not exist"
] as const;

export function isRefreshTokenReuseError(error: unknown) {
  const authError = error as AuthErrorLike | null | undefined;
  const code = authError?.code?.toLowerCase();
  const message = authError?.message?.toLowerCase() ?? "";

  return code === "refresh_token_already_used" || message.includes("refresh token: already used");
}

export function isRecoverableAuthSessionError(error: unknown) {
  const authError = error as AuthErrorLike | null | undefined;
  const code = authError?.code?.toLowerCase();
  const message = authError?.message?.toLowerCase() ?? "";

  return (
    isRefreshTokenReuseError(error) ||
    (typeof code === "string" && RECOVERABLE_AUTH_ERROR_CODES.has(code)) ||
    RECOVERABLE_AUTH_MESSAGE_PATTERNS.some((pattern) => message.includes(pattern))
  );
}
