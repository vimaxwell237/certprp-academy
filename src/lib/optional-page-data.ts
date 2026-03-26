import { isMissingServiceRoleConfigError } from "@/lib/supabase/admin";

export async function loadOptionalPageData<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (isMissingServiceRoleConfigError(error)) {
      return fallback;
    }

    console.error(`[optional-page-data] ${label}`, error);

    return fallback;
  }
}
