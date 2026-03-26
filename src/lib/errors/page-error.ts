import { unstable_rethrow } from "next/navigation";

import { getPublicErrorMessage } from "./public-error";

export function getPublicPageErrorMessage(error: unknown, fallback: string) {
  unstable_rethrow(error);

  return getPublicErrorMessage(error, fallback);
}
