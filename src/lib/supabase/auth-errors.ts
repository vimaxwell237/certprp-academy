type AuthErrorLike = {
  code?: string;
  message?: string;
};

export function isRefreshTokenReuseError(error: unknown) {
  const authError = error as AuthErrorLike | null | undefined;
  const code = authError?.code?.toLowerCase();
  const message = authError?.message?.toLowerCase() ?? "";

  return code === "refresh_token_already_used" || message.includes("refresh token: already used");
}

export function isRecoverableAuthSessionError(error: unknown) {
  return isRefreshTokenReuseError(error);
}
