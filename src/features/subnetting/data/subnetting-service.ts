import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  GeneratedSubnetProblem,
  SubnetAnswerInput,
  SubnettingAttemptHistoryItem,
  SubnettingPracticeSnapshot
} from "@/types/subnetting";
import { validateSubnetAnswer } from "@/features/subnetting/lib/subnetting-engine";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RawSubnettingAttempt = {
  id: string;
  network: string;
  prefix: number;
  correct: boolean;
  score: number;
  time_taken: number;
  created_at: string;
};

export function buildEmptySubnettingSnapshot(): SubnettingPracticeSnapshot {
  return {
    stats: {
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      accuracyPercentage: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: 0,
      totalTimeSeconds: 0,
      latestAttemptAt: null
    },
    history: []
  };
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

function mapHistoryItem(row: RawSubnettingAttempt): SubnettingAttemptHistoryItem {
  return {
    id: row.id,
    network: row.network,
    prefix: row.prefix,
    correct: row.correct,
    score: row.score,
    timeTaken: row.time_taken,
    createdAt: row.created_at
  };
}

function buildSnapshot(rows: RawSubnettingAttempt[]): SubnettingPracticeSnapshot {
  if (rows.length === 0) {
    return buildEmptySubnettingSnapshot();
  }

  const totalAttempts = rows.length;
  const correctAttempts = rows.filter((row) => row.correct).length;
  const incorrectAttempts = totalAttempts - correctAttempts;
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const totalTimeSeconds = rows.reduce((sum, row) => sum + row.time_taken, 0);
  let currentStreak = 0;

  for (const row of rows) {
    if (!row.correct) {
      break;
    }

    currentStreak += 1;
  }

  return {
    stats: {
      totalAttempts,
      correctAttempts,
      incorrectAttempts,
      accuracyPercentage: Math.round((correctAttempts / totalAttempts) * 100),
      averageScore: Math.round(totalScore / totalAttempts),
      bestScore: Math.max(...rows.map((row) => row.score)),
      currentStreak,
      totalTimeSeconds,
      latestAttemptAt: rows[0]?.created_at ?? null
    },
    history: rows.slice(0, 12).map(mapHistoryItem)
  };
}

export async function fetchSubnettingPracticeSnapshot(
  userId: string
): Promise<SubnettingPracticeSnapshot> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return buildEmptySubnettingSnapshot();
  }

  const { data, error } = await supabase
    .from("subnetting_attempts")
    .select("id,network,prefix,correct,score,time_taken,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch subnetting history: ${error.message}`);
  }

  return buildSnapshot((data as RawSubnettingAttempt[] | null) ?? []);
}

export async function saveSubnettingAttempt(
  userId: string,
  input: {
    problem: GeneratedSubnetProblem;
    answers: SubnetAnswerInput;
    timeTaken: number;
  }
) {
  const validation = validateSubnetAnswer(input.problem, input.answers);
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      validation,
      snapshot: null,
      persistenceError: "Practice history is unavailable because Supabase is not configured."
    };
  }

  const { error } = await supabase.from("subnetting_attempts").insert({
    user_id: userId,
    network: input.problem.networkAddress,
    prefix: input.problem.prefixLength,
    correct: validation.isCorrect,
    score: validation.score,
    time_taken: Math.max(1, Math.round(input.timeTaken))
  });

  if (error) {
    return {
      validation,
      snapshot: null,
      persistenceError: `Practice result could not be saved: ${error.message}`
    };
  }

  const snapshot = await fetchSubnettingPracticeSnapshot(userId);

  return {
    validation,
    snapshot,
    persistenceError: null
  };
}
