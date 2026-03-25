import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AiTutorSessionEntry } from "@/types/ai-tutor";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RawAiTutorSession = {
  id: string;
  question: string;
  response: string;
  lesson_context: string | null;
  created_at: string;
};

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

function mapSession(row: RawAiTutorSession): AiTutorSessionEntry {
  return {
    id: row.id,
    question: row.question,
    response: row.response,
    lessonContext: row.lesson_context,
    createdAt: row.created_at
  };
}

export async function fetchAiTutorSessions(userId: string): Promise<AiTutorSessionEntry[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("ai_tutor_sessions")
    .select("id,question,response,lesson_context,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(`Failed to fetch AI tutor history: ${error.message}`);
  }

  return ((data as RawAiTutorSession[] | null) ?? []).map(mapSession);
}

export async function saveAiTutorSession(
  userId: string,
  input: {
    question: string;
    response: string;
    lessonContext?: string | null;
  }
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { error } = await supabase.from("ai_tutor_sessions").insert({
    user_id: userId,
    question: input.question,
    response: input.response,
    lesson_context: input.lessonContext ?? null
  });

  if (error) {
    throw new Error(`Failed to save AI tutor session: ${error.message}`);
  }
}
