import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { validateCliCommand } from "@/features/cli/lib/validation";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  CliAttemptState,
  CliAttemptStatus,
  CliChallengeDetail,
  CliChallengeListItem,
  CliCommandSubmissionResult,
  DashboardCliSnapshot,
  RelatedCliChallengeSummary
} from "@/types/cli";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServiceRoleSupabaseClient>>
>;
type DashboardSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;
type ReadSupabaseClient = ServerSupabaseClient | DashboardSupabaseClient;

type RelationValue<T> = T | T[] | null;

type RawModuleRef = {
  id?: string;
  title: string;
  slug: string;
  course: RelationValue<{
    title: string;
    slug: string;
  }>;
};

type RawLessonRef = {
  id?: string;
  title: string;
  slug: string;
};

type RawCliStep = {
  id: string;
  step_number: number;
  prompt: string;
  expected_command_patterns: string[] | null;
  validation_type: "exact" | "normalized" | "pattern";
  hints: string | null;
  explanation: string | null;
};

type RawCliChallenge = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  scenario: string;
  objectives: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
  steps?: RawCliStep[] | null;
};

type RawCliAttempt = {
  id: string;
  challenge_id: string;
  status: CliAttemptStatus;
  current_step: number;
  completed_at: string | null;
  updated_at: string;
  challenge?: RelationValue<{
    title: string;
    slug: string;
  }>;
};

type RawCliStepResult = {
  id: string;
  cli_step_id: string;
  entered_command: string;
  is_correct: boolean;
  feedback: string;
  answered_at: string;
  step?: RelationValue<{
    step_number: number;
  }>;
};

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getSupabaseClient() {
  return createServiceRoleSupabaseClient();
}

async function getReadSupabaseClient() {
  if (hasSupabaseServiceRoleEnv()) {
    return createServiceRoleSupabaseClient();
  }

  return createServerSupabaseClient();
}

function mapStatus(
  challengeId: string,
  attempts: RawCliAttempt[]
): { status: CliAttemptStatus; currentStep: number | null } {
  const challengeAttempts = attempts.filter((attempt) => attempt.challenge_id === challengeId);
  const activeAttempt = challengeAttempts.find((attempt) => attempt.status === "in_progress");

  if (activeAttempt) {
    return {
      status: "in_progress",
      currentStep: activeAttempt.current_step
    };
  }

  const completedAttempt = challengeAttempts.find((attempt) => attempt.status === "completed");

  if (completedAttempt) {
    return {
      status: "completed",
      currentStep: completedAttempt.current_step
    };
  }

  return {
    status: "not_started",
    currentStep: null
  };
}

async function fetchAttemptRows(
  userId: string,
  challengeIds?: string[],
  client?: ReadSupabaseClient
) {
  const supabase = client ?? (await getSupabaseClient());

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("cli_attempts")
    .select("id,challenge_id,status,current_step,completed_at,updated_at,challenge:cli_challenges(title,slug)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (challengeIds && challengeIds.length > 0) {
    query = query.in("challenge_id", challengeIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch CLI attempts: ${error.message}`);
  }

  return (data as RawCliAttempt[] | null) ?? [];
}

export async function fetchCliChallenges(
  userId: string
): Promise<CliChallengeListItem[]> {
  const supabase = await getReadSupabaseClient();
  const canReadSteps = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return [];
  }

  const { data, error } = canReadSteps
    ? await supabase
        .from("cli_challenges")
        .select(
          "id,title,slug,summary,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug),steps:cli_steps(id)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("cli_challenges")
        .select(
          "id,title,slug,summary,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch CLI challenges: ${error.message}`);
  }

  const challenges = (data as Array<
    Omit<RawCliChallenge, "steps"> & { steps: Array<{ id: string }> | null }
  > | null) ?? [];
  const attempts = await fetchAttemptRows(
    userId,
    challenges.map((challenge) => challenge.id),
    supabase
  );

  return challenges.map((challenge) => {
    const moduleRef = relationFirst(challenge.module);
    const lessonRef = relationFirst(challenge.lesson);
    const status = mapStatus(challenge.id, attempts);

    return {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      summary: challenge.summary,
      difficulty: challenge.difficulty,
      estimatedMinutes: challenge.estimated_minutes,
      moduleTitle: moduleRef?.title ?? "Module",
      moduleSlug: moduleRef?.slug ?? "",
      lessonTitle: lessonRef?.title ?? null,
      lessonSlug: lessonRef?.slug ?? null,
      stepCount: (challenge.steps ?? []).length,
      status: status.status,
      currentStep: status.currentStep
    };
  });
}

async function fetchChallengeBySlug(
  client: ServerSupabaseClient,
  challengeSlug: string
) {
  const { data, error } = await client
    .from("cli_challenges")
    .select(
      "id,title,slug,summary,scenario,objectives,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug),steps:cli_steps(id,step_number,prompt,expected_command_patterns,validation_type,hints,explanation)"
    )
    .eq("slug", challengeSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch CLI challenge detail: ${error.message}`);
  }

  return (data as RawCliChallenge | null) ?? null;
}

function mapSteps(challenge: RawCliChallenge) {
  return [...(challenge.steps ?? [])]
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => ({
      id: step.id,
      stepNumber: step.step_number,
      prompt: step.prompt,
      validationType: step.validation_type,
      hint: step.hints,
      explanation: step.explanation
    }));
}

export async function fetchCliChallengeDetail(
  userId: string,
  challengeSlug: string
): Promise<CliChallengeDetail | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const challenge = await fetchChallengeBySlug(supabase, challengeSlug);

  if (!challenge) {
    return null;
  }

  const moduleRef = relationFirst(challenge.module);
  const courseRef = relationFirst(moduleRef?.course);
  const lessonRef = relationFirst(challenge.lesson);
  const attempts = await fetchAttemptRows(userId, [challenge.id], supabase);
  const status = mapStatus(challenge.id, attempts);

  return {
    id: challenge.id,
    title: challenge.title,
    slug: challenge.slug,
    summary: challenge.summary,
    scenario: challenge.scenario,
    objectives: challenge.objectives,
    difficulty: challenge.difficulty,
    estimatedMinutes: challenge.estimated_minutes,
    moduleTitle: moduleRef?.title ?? "Module",
    moduleSlug: moduleRef?.slug ?? "",
    courseTitle: courseRef?.title ?? "Course",
    courseSlug: courseRef?.slug ?? "",
    lessonTitle: lessonRef?.title ?? null,
    lessonSlug: lessonRef?.slug ?? null,
    stepCount: (challenge.steps ?? []).length,
    status: status.status,
    currentStep: status.currentStep,
    steps: mapSteps(challenge)
  };
}

async function fetchActiveAttempt(
  client: ServerSupabaseClient,
  userId: string,
  challengeId: string
) {
  const { data, error } = await client
    .from("cli_attempts")
    .select("id,challenge_id,status,current_step,completed_at,updated_at")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active CLI attempt: ${error.message}`);
  }

  return (data as RawCliAttempt | null) ?? null;
}

async function fetchAttemptStateById(
  client: ServerSupabaseClient,
  userId: string,
  challengeSlug: string,
  attemptId: string
): Promise<CliAttemptState | null> {
  const challenge = await fetchChallengeBySlug(client, challengeSlug);

  if (!challenge) {
    return null;
  }

  const { data: attemptData, error: attemptError } = await client
    .from("cli_attempts")
    .select("id,challenge_id,status,current_step,completed_at,updated_at")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (attemptError) {
    throw new Error(`Failed to fetch CLI attempt state: ${attemptError.message}`);
  }

  if (!attemptData) {
    return null;
  }

  const { data: resultsData, error: resultsError } = await client
    .from("cli_attempt_step_results")
    .select("id,cli_step_id,entered_command,is_correct,feedback,answered_at,step:cli_steps(step_number)")
    .eq("cli_attempt_id", attemptId)
    .order("answered_at", { ascending: true });

  if (resultsError) {
    throw new Error(`Failed to fetch CLI attempt results: ${resultsError.message}`);
  }

  const results = (dataToResults(resultsData as RawCliStepResult[] | null) ?? []);
  const latestResult = results[results.length - 1] ?? null;

  return {
    attemptId,
    challengeId: challenge.id,
    challengeSlug: challenge.slug,
    challengeTitle: challenge.title,
    status: (attemptData as RawCliAttempt).status,
    currentStep: (attemptData as RawCliAttempt).current_step,
    totalSteps: (challenge.steps ?? []).length,
    completedAt: (attemptData as RawCliAttempt).completed_at,
    latestFeedback: latestResult?.feedback ?? null,
    latestCommand: latestResult?.enteredCommand ?? null,
    results,
    steps: mapSteps(challenge)
  };
}

function dataToResults(resultsData: RawCliStepResult[] | null) {
  return ((resultsData ?? []).map((result) => ({
    id: result.id,
    cliStepId: result.cli_step_id,
    stepNumber: relationFirst(result.step)?.step_number ?? 0,
    enteredCommand: result.entered_command,
    isCorrect: result.is_correct,
    feedback: result.feedback,
    answeredAt: result.answered_at
  })) as CliAttemptState["results"]);
}

export async function fetchActiveCliAttemptState(
  userId: string,
  challengeSlug: string
): Promise<CliAttemptState | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const challenge = await fetchChallengeBySlug(supabase, challengeSlug);

  if (!challenge) {
    return null;
  }

  const activeAttempt = await fetchActiveAttempt(supabase, userId, challenge.id);

  if (!activeAttempt) {
    return null;
  }

  return fetchAttemptStateById(supabase, userId, challengeSlug, activeAttempt.id);
}

export async function startOrResumeCliAttempt(
  userId: string,
  challengeSlug: string
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const challenge = await fetchChallengeBySlug(supabase, challengeSlug);

  if (!challenge) {
    throw new Error("CLI challenge was not found or is not published.");
  }

  if ((challenge.steps ?? []).length === 0) {
    throw new Error("CLI challenge does not have any configured steps yet.");
  }

  const activeAttempt = await fetchActiveAttempt(supabase, userId, challenge.id);

  if (activeAttempt) {
    const attempt = await fetchAttemptStateById(
      supabase,
      userId,
      challenge.slug,
      activeAttempt.id
    );

    if (!attempt) {
      throw new Error("CLI challenge attempt could not be restored.");
    }

    return attempt;
  }

  const { data, error } = await supabase
    .from("cli_attempts")
    .insert({
      user_id: userId,
      challenge_id: challenge.id,
      status: "in_progress",
      current_step: 1
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to start CLI challenge: ${error.message}`);
  }

  const attempt = await fetchAttemptStateById(
    supabase,
    userId,
    challenge.slug,
    data.id as string
  );

  if (!attempt) {
    throw new Error("CLI challenge attempt could not be initialized.");
  }

  return attempt;
}

export async function submitCliCommand(
  userId: string,
  challengeSlug: string,
  attemptId: string,
  enteredCommand: string
): Promise<CliCommandSubmissionResult> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const challenge = await fetchChallengeBySlug(supabase, challengeSlug);

  if (!challenge) {
    throw new Error("CLI challenge was not found.");
  }

  const attempt = await fetchAttemptStateById(supabase, userId, challengeSlug, attemptId);

  if (!attempt) {
    throw new Error("CLI attempt was not found.");
  }

  if (attempt.status === "completed") {
    return {
      attempt,
      commandAccepted: true,
      feedback: "This CLI challenge is already completed."
    };
  }

  const currentStep = [...(challenge.steps ?? [])]
    .sort((a, b) => a.step_number - b.step_number)
    .find((step) => step.step_number === attempt.currentStep);

  if (!currentStep) {
    throw new Error("Current CLI step could not be resolved.");
  }

  const validation = validateCliCommand({
    enteredCommand,
    expectedPatterns: currentStep.expected_command_patterns ?? [],
    validationType: currentStep.validation_type,
    explanation: currentStep.explanation
  });

  const { error: resultError } = await supabase.from("cli_attempt_step_results").insert({
    cli_attempt_id: attemptId,
    cli_step_id: currentStep.id,
    entered_command: enteredCommand.trim(),
    is_correct: validation.isCorrect,
    feedback: validation.feedback
  });

  if (resultError) {
    throw new Error(`Failed to record CLI step result: ${resultError.message}`);
  }

  if (validation.isCorrect) {
    const totalSteps = (challenge.steps ?? []).length;
    const nextStep = Math.min(attempt.currentStep + 1, totalSteps);

    const updatePayload =
      attempt.currentStep >= totalSteps
        ? {
            status: "completed" as const,
            current_step: totalSteps,
            completed_at: new Date().toISOString()
          }
        : {
            status: "in_progress" as const,
            current_step: nextStep
          };

    const { error: updateError } = await supabase
      .from("cli_attempts")
      .update(updatePayload)
      .eq("id", attemptId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to update CLI attempt progress: ${updateError.message}`);
    }
  }

  const updatedAttempt = await fetchAttemptStateById(
    supabase,
    userId,
    challengeSlug,
    attemptId
  );

  if (!updatedAttempt) {
    throw new Error("CLI attempt state could not be refreshed.");
  }

  return {
    attempt: updatedAttempt,
    commandAccepted: validation.isCorrect,
    feedback: validation.feedback
  };
}

export async function fetchModuleCliChallengeIndex(
  userId: string,
  moduleIds: string[]
): Promise<Record<string, RelatedCliChallengeSummary[]>> {
  const supabase = await getReadSupabaseClient();
  const canReadSteps = hasSupabaseServiceRoleEnv();

  if (!supabase || moduleIds.length === 0) {
    return {};
  }

  const { data, error } = canReadSteps
    ? await supabase
        .from("cli_challenges")
        .select("id,title,slug,difficulty,estimated_minutes,module_id,steps:cli_steps(id)")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("cli_challenges")
        .select("id,title,slug,difficulty,estimated_minutes,module_id")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch related CLI challenges: ${error.message}`);
  }

  const challenges =
    ((data as Array<{
      id: string;
      title: string;
      slug: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      estimated_minutes: number;
      module_id: string;
      steps: Array<{ id: string }> | null;
    }> | null) ?? []);
  const attempts = await fetchAttemptRows(
    userId,
    challenges.map((challenge) => challenge.id),
    supabase
  );

  return challenges.reduce<Record<string, RelatedCliChallengeSummary[]>>((acc, challenge) => {
    const existing = acc[challenge.module_id] ?? [];
    const status = mapStatus(challenge.id, attempts);

    existing.push({
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      difficulty: challenge.difficulty,
      estimatedMinutes: challenge.estimated_minutes,
      stepCount: (challenge.steps ?? []).length,
      status: status.status
    });
    acc[challenge.module_id] = existing;

    return acc;
  }, {});
}

export async function fetchRelatedCliChallengesForLessonContext(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<RelatedCliChallengeSummary[]> {
  const supabase = await getReadSupabaseClient();
  const canReadSteps = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return [];
  }

  const { data: courseData } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (!courseData) {
    return [];
  }

  const { data: moduleData } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseData.id as string)
    .eq("slug", moduleSlug)
    .maybeSingle();

  if (!moduleData) {
    return [];
  }

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleData.id as string)
    .eq("slug", lessonSlug)
    .maybeSingle();

  const { data, error } = canReadSteps
    ? await supabase
        .from("cli_challenges")
        .select("id,title,slug,difficulty,estimated_minutes,lesson_id,module_id,steps:cli_steps(id)")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("cli_challenges")
        .select("id,title,slug,difficulty,estimated_minutes,lesson_id,module_id")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch related CLI lesson challenges: ${error.message}`);
  }

  const challenges =
    ((data as Array<{
      id: string;
      title: string;
      slug: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      estimated_minutes: number;
      lesson_id: string | null;
      module_id: string;
      steps: Array<{ id: string }> | null;
    }> | null) ?? []).sort((a, b) => {
      const aScore = a.lesson_id && a.lesson_id === (lessonData?.id as string | undefined) ? 0 : 1;
      const bScore = b.lesson_id && b.lesson_id === (lessonData?.id as string | undefined) ? 0 : 1;

      return aScore - bScore;
    });
  const attempts = await fetchAttemptRows(
    userId,
    challenges.map((challenge) => challenge.id),
    supabase
  );

  return challenges.map((challenge) => {
    const status = mapStatus(challenge.id, attempts);

    return {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      difficulty: challenge.difficulty,
      estimatedMinutes: challenge.estimated_minutes,
      stepCount: (challenge.steps ?? []).length,
      status: status.status
    };
  });
}

export async function fetchDashboardCliSnapshot(
  userId: string
): Promise<DashboardCliSnapshot | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("cli_challenges")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (countError) {
    throw new Error(`Failed to count CLI challenges: ${countError.message}`);
  }

  const attempts = await fetchAttemptRows(userId, undefined, supabase);
  const latestByChallenge = new Map<string, RawCliAttempt>();

  for (const attempt of attempts) {
    if (!latestByChallenge.has(attempt.challenge_id)) {
      latestByChallenge.set(attempt.challenge_id, attempt);
    }
  }

  const latestAttempts = Array.from(latestByChallenge.values());
  const latestAttempt = attempts[0];
  const latestChallenge = relationFirst(latestAttempt?.challenge);

  return {
    totalChallengesAvailable: count ?? 0,
    challengesStarted: latestAttempts.filter((attempt) => attempt.status !== "not_started").length,
    challengesCompleted: latestAttempts.filter((attempt) => attempt.status === "completed").length,
    latestActivity:
      latestAttempt && latestChallenge
        ? {
            id: latestAttempt.challenge_id,
            title: latestChallenge.title,
            slug: latestChallenge.slug,
            status: latestAttempt.status,
            updatedAt: latestAttempt.updated_at
          }
        : null
  };
}
