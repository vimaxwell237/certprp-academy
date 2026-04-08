import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { getQuizQuestionImagePublicUrl } from "@/lib/quiz-question-images";
import {
  isDragDropAnswerComplete,
  isDragDropAnswerCorrect,
  normalizeDragDropAnswerPayload,
  normalizeDragDropInteractionConfig
} from "@/lib/questions/drag-drop";
import {
  buildMultipleChoiceAnswerPayload,
  isMultipleChoiceCorrect,
  normalizeMultipleChoiceAnswerPayload,
  normalizeSelectedOptionIds
} from "@/lib/questions/multiple-choice";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateExamScore,
  clampTimeUsed,
  isExamAnswerAnswered,
  selectExamQuestions,
  type ExamAnswerKey,
  type ExamBankQuestion
} from "@/features/exams/lib/exam-engine";
import type {
  DashboardExamSnapshot,
  ExamAttemptResult,
  ExamAttemptState,
  ExamConfigDetail,
  ExamConfigListItem,
  ExamDomainPerformance,
  ExamHistoryItem
} from "@/types/exam";
import type { MultipleChoiceAnswerPayload, QuestionType } from "@/types/questions";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServiceRoleSupabaseClient>>
>;
type DashboardSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;
type ReadSupabaseClient = ServerSupabaseClient | DashboardSupabaseClient;

type RelationValue<T> = T | T[] | null;

type RawExamConfig = {
  id: string;
  title: string;
  slug: string;
  description: string;
  exam_mode: "full_mock" | "quick_practice" | "random_mixed";
  selection_strategy: "random" | "balanced";
  included_module_slugs: string[];
  time_limit_minutes: number;
  question_count: number;
  passing_score: number;
};

type RawExamAttemptRow = {
  id: string;
  status: "in_progress" | "submitted" | "timed_out";
  score: number | null;
  correct_answers: number;
  total_questions: number;
  flagged_count: number;
  started_at: string;
  submitted_at: string | null;
  expires_at: string;
  duration_seconds: number;
  time_used_seconds: number | null;
  current_question_index: number;
  unanswered_answers: number;
  incorrect_answers: number;
  exam_config: RelationValue<{
    id?: string;
    title: string;
    slug: string;
    description?: string;
  }>;
};

type RawQuizBankRow = {
  module: RelationValue<{
    title: string;
    slug: string;
  }>;
  lesson: RelationValue<{
    module: RelationValue<{
      title: string;
      slug: string;
    }>;
  }>;
  questions: Array<{
    id: string;
    question_text: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    show_in_quiz: boolean;
    question_type: QuestionType;
    interaction_config: Record<string, unknown> | null;
    question_image_path: string | null;
    question_image_alt: string;
    question_image_path_secondary: string | null;
    question_image_alt_secondary: string;
    options: Array<{
      id: string;
      option_text: string;
      is_correct: boolean;
      match_key: string | null;
      order_index: number;
    }> | null;
  }> | null;
};

type RawAttemptAnswerRow = {
  id: string;
  question_id: string;
  selected_option_id: string | null;
  question_order: number;
  module_slug_snapshot: string | null;
  module_title_snapshot: string | null;
  question_text_snapshot: string;
  explanation_snapshot: string;
  difficulty_snapshot: "easy" | "medium" | "hard";
  question_type_snapshot: QuestionType;
  interaction_config_snapshot: Record<string, unknown> | null;
  question_image_path_snapshot: string | null;
  question_image_alt_snapshot: string;
  question_image_path_secondary_snapshot: string | null;
  question_image_alt_secondary_snapshot: string;
  answer_payload: Record<string, unknown> | null;
  options_snapshot:
    | Array<{
        id: string;
        optionText: string;
        orderIndex: number;
        isCorrect: boolean;
        matchKey: string | null;
      }>
    | null;
  correct_option_id: string | null;
  flagged: boolean;
  is_correct: boolean | null;
};

type RpcStartedExamAttemptRow = {
  attempt_id: string;
  exam_slug: string;
};

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function buildExamAnswerKey(answer: RawAttemptAnswerRow): ExamAnswerKey {
  if (answer.question_type_snapshot === "drag_drop_categorize") {
    const interactionConfig = normalizeDragDropInteractionConfig(
      answer.interaction_config_snapshot
    );

    return {
      questionType: "drag_drop_categorize",
      answerPayload: normalizeDragDropAnswerPayload(answer.answer_payload),
      items: [...(answer.options_snapshot ?? [])].map((option) => ({
        id: option.id,
        matchKey: option.matchKey
      })),
      bucketIds: interactionConfig?.buckets.map((bucket) => bucket.id) ?? []
    };
  }

  const correctOptionIds = [...(answer.options_snapshot ?? [])]
    .filter((option) => option.isCorrect)
    .map((option) => option.id);

  if (answer.question_type_snapshot === "multiple_choice") {
    return {
      questionType: "multiple_choice",
      correctOptionIds,
      selectedOptionIds:
        normalizeMultipleChoiceAnswerPayload(answer.answer_payload)?.selectedOptionIds ?? []
    };
  }

  return {
    questionType: "single_choice",
    correctOptionIds,
    selectedOptionIds: answer.selected_option_id ? [answer.selected_option_id] : []
  };
}

function resolveSelectedOptionIds(answer: RawAttemptAnswerRow) {
  if (answer.question_type_snapshot === "multiple_choice") {
    return normalizeMultipleChoiceAnswerPayload(answer.answer_payload)?.selectedOptionIds ?? [];
  }

  return answer.selected_option_id ? [answer.selected_option_id] : [];
}

async function getReadSupabaseClient() {
  if (hasSupabaseServiceRoleEnv()) {
    return createServiceRoleSupabaseClient();
  }

  return createServerSupabaseClient();
}

function buildExamHistoryItem(attempt: RawExamAttemptRow): ExamHistoryItem {
  const examConfig = relationFirst(attempt.exam_config);

  return {
    id: attempt.id,
    examTitle: examConfig?.title ?? "Exam",
    examSlug: examConfig?.slug ?? "",
    status: attempt.status,
    score: attempt.score,
    correctAnswers: attempt.correct_answers,
    totalQuestions: attempt.total_questions,
    flaggedCount: attempt.flagged_count,
    completedAt: attempt.submitted_at
  };
}

function buildConfigMetrics(configId: string, attempts: RawExamAttemptRow[]) {
  const configAttempts = attempts.filter(
    (attempt) => relationFirst(attempt.exam_config)?.id === configId
  );
  const completedAttempts = configAttempts.filter(
    (attempt) => attempt.status !== "in_progress"
  );
  const scores = completedAttempts
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== null);

  return {
    attemptsTaken: completedAttempts.length,
    latestScore: completedAttempts[0]?.score ?? null,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    lastAttemptAt: completedAttempts[0]?.submitted_at ?? null
  };
}

async function fetchExamAttemptRows(
  userId: string,
  examConfigIds?: string[],
  client?: ReadSupabaseClient
) {
  const supabase = client ?? (await getReadSupabaseClient());

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("exam_attempts")
    .select(
      "id,status,score,correct_answers,total_questions,flagged_count,started_at,submitted_at,expires_at,duration_seconds,time_used_seconds,current_question_index,incorrect_answers,unanswered_answers,exam_config:exam_configs(id,title,slug,description)"
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (examConfigIds && examConfigIds.length > 0) {
    query = query.in("exam_config_id", examConfigIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch exam attempts: ${error.message}`);
  }

  return (data as RawExamAttemptRow[] | null) ?? [];
}

export async function fetchExamConfigs(userId: string): Promise<ExamConfigListItem[]> {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("exam_configs")
    .select(
      "id,title,slug,description,exam_mode,selection_strategy,included_module_slugs,time_limit_minutes,question_count,passing_score"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exam configs: ${error.message}`);
  }

  const configs = (data as RawExamConfig[] | null) ?? [];
  const attempts = await fetchExamAttemptRows(
    userId,
    configs.map((config) => config.id),
    supabase
  );

  return configs.map((config) => {
    const metrics = buildConfigMetrics(config.id, attempts);

    return {
      id: config.id,
      title: config.title,
      slug: config.slug,
      description: config.description,
      examMode: config.exam_mode,
      timeLimitMinutes: config.time_limit_minutes,
      questionCount: config.question_count,
      passingScore: config.passing_score,
      attemptsTaken: metrics.attemptsTaken,
      latestScore: metrics.latestScore,
      bestScore: metrics.bestScore,
      lastAttemptAt: metrics.lastAttemptAt
    };
  });
}

export async function fetchExamConfigDetail(
  userId: string,
  examSlug: string
): Promise<ExamConfigDetail | null> {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("exam_configs")
    .select(
      "id,title,slug,description,exam_mode,selection_strategy,included_module_slugs,time_limit_minutes,question_count,passing_score"
    )
    .eq("slug", examSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch exam config detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const config = data as RawExamConfig;
  const attempts = await fetchExamAttemptRows(userId, [config.id], supabase);
  const metrics = buildConfigMetrics(config.id, attempts);
  const activeAttempt =
    attempts.find(
      (attempt) =>
        attempt.status === "in_progress" &&
        new Date(attempt.expires_at).getTime() > Date.now()
    ) ?? null;
  const completedAttempts = attempts.filter((attempt) => attempt.status !== "in_progress");

  return {
    id: config.id,
    title: config.title,
    slug: config.slug,
    description: config.description,
    examMode: config.exam_mode,
    timeLimitMinutes: config.time_limit_minutes,
    questionCount: config.question_count,
    passingScore: config.passing_score,
    attemptsTaken: metrics.attemptsTaken,
    latestScore: metrics.latestScore,
    bestScore: metrics.bestScore,
    lastAttemptAt: metrics.lastAttemptAt,
    activeAttemptId: activeAttempt?.id ?? null,
    activeAttemptStartedAt: activeAttempt?.started_at ?? null,
    activeAttemptExpiresAt: activeAttempt?.expires_at ?? null,
    recentAttempts: completedAttempts.slice(0, 5).map(buildExamHistoryItem)
  };
}

async function fetchExamQuestionBank(client: ServerSupabaseClient) {
  const { data, error } = await client
    .from("quizzes")
    .select(
      "module:modules(title,slug),lesson:lessons(module:modules(title,slug)),questions:quiz_questions(id,question_text,explanation,difficulty,show_in_quiz,question_type,interaction_config,question_image_path,question_image_alt,question_image_path_secondary,question_image_alt_secondary,options:question_options(id,option_text,is_correct,match_key,order_index))"
    )
    .eq("is_published", true);

  if (error) {
    throw new Error(`Failed to fetch exam question bank: ${error.message}`);
  }

  const quizRows = (data as RawQuizBankRow[] | null) ?? [];

  return quizRows.flatMap<ExamBankQuestion>((quiz) => {
    const moduleRef =
      relationFirst(quiz.module) ??
      relationFirst(relationFirst(quiz.lesson)?.module);

    return [...(quiz.questions ?? [])].map((question) => ({
      id: question.id,
      moduleSlug: moduleRef?.slug ?? null,
      moduleTitle: moduleRef?.title ?? null,
      showInQuiz: question.show_in_quiz,
      questionText: question.question_text,
      explanation: question.explanation,
      difficulty: question.difficulty,
      questionType: question.question_type,
      interactionConfig: normalizeDragDropInteractionConfig(question.interaction_config),
      questionImagePath: question.question_image_path,
      questionImageAlt: question.question_image_alt,
      questionImageSecondaryPath: question.question_image_path_secondary,
      questionImageSecondaryAlt: question.question_image_alt_secondary,
      options: [...(question.options ?? [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          optionText: option.option_text,
          isCorrect: option.is_correct,
          matchKey: option.match_key,
          orderIndex: option.order_index
        }))
    }));
  });
}

function mapExamAttemptState(
  client: ReadSupabaseClient,
  attempt: RawExamAttemptRow,
  answers: RawAttemptAnswerRow[]
): ExamAttemptState {
  const examConfig = relationFirst(attempt.exam_config);
  const remainingSeconds = Math.max(
    0,
    Math.ceil((new Date(attempt.expires_at).getTime() - Date.now()) / 1000)
  );

  return {
    attemptId: attempt.id,
    examId: examConfig?.id ?? "",
    examTitle: examConfig?.title ?? "Exam",
    examSlug: examConfig?.slug ?? "",
    status: attempt.status,
    startedAt: attempt.started_at,
    expiresAt: attempt.expires_at,
    submittedAt: attempt.submitted_at,
    durationSeconds: attempt.duration_seconds,
    totalQuestions: attempt.total_questions,
    currentQuestionIndex: attempt.current_question_index,
    answeredCount: answers.filter((answer) => isExamAnswerAnswered(buildExamAnswerKey(answer)))
      .length,
    flaggedCount: answers.filter((answer) => answer.flagged).length,
    remainingSeconds,
    questions: [...answers]
      .sort((a, b) => a.question_order - b.question_order)
      .map((answer) => {
        const interactionConfig = normalizeDragDropInteractionConfig(
          answer.interaction_config_snapshot
        );
        const answerPayload =
          answer.question_type_snapshot === "drag_drop_categorize"
            ? normalizeDragDropAnswerPayload(answer.answer_payload)
            : answer.question_type_snapshot === "multiple_choice"
              ? normalizeMultipleChoiceAnswerPayload(answer.answer_payload)
              : null;
        const selectedOptionIds = resolveSelectedOptionIds(answer);

        return {
          id: answer.id,
          questionId: answer.question_id,
          orderIndex: answer.question_order,
          moduleTitle: answer.module_title_snapshot,
          moduleSlug: answer.module_slug_snapshot,
          questionText: answer.question_text_snapshot,
          explanation: answer.explanation_snapshot,
          difficulty: answer.difficulty_snapshot,
          questionType: answer.question_type_snapshot,
          interactionConfig,
          questionImageUrl: getQuizQuestionImagePublicUrl(
            client,
            answer.question_image_path_snapshot
          ),
          questionImageAlt: answer.question_image_alt_snapshot,
          questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
            client,
            answer.question_image_path_secondary_snapshot
          ),
          questionImageSecondaryAlt: answer.question_image_alt_secondary_snapshot,
          selectedOptionId:
            answer.question_type_snapshot === "single_choice"
              ? answer.selected_option_id
              : null,
          selectedOptionIds,
          answerPayload,
          flagged: answer.flagged,
          options: [...(answer.options_snapshot ?? [])]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((option) => ({
              id: option.id,
              optionText: option.optionText,
              orderIndex: option.orderIndex
            }))
        };
      })
  };
}

async function fetchAttemptAnswers(
  client: ReadSupabaseClient,
  attemptId: string
) {
  const { data, error } = await client
    .from("exam_attempt_answers")
    .select(
      "id,question_id,selected_option_id,question_order,module_slug_snapshot,module_title_snapshot,question_text_snapshot,explanation_snapshot,difficulty_snapshot,question_type_snapshot,interaction_config_snapshot,question_image_path_snapshot,question_image_alt_snapshot,question_image_path_secondary_snapshot,question_image_alt_secondary_snapshot,answer_payload,options_snapshot,correct_option_id,flagged,is_correct"
    )
    .eq("exam_attempt_id", attemptId)
    .order("question_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exam attempt answers: ${error.message}`);
  }

  return (data as RawAttemptAnswerRow[] | null) ?? [];
}

async function fetchAttemptRow(
  client: ReadSupabaseClient,
  userId: string,
  attemptId: string
) {
  const { data, error } = await client
    .from("exam_attempts")
    .select(
      "id,status,score,correct_answers,total_questions,flagged_count,started_at,submitted_at,expires_at,duration_seconds,time_used_seconds,current_question_index,incorrect_answers,unanswered_answers,exam_config:exam_configs(id,title,slug,description)"
    )
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch exam attempt: ${error.message}`);
  }

  return (data as RawExamAttemptRow | null) ?? null;
}

async function startPublishedExamAttemptWithRpc(
  client: DashboardSupabaseClient,
  examSlug: string
) {
  const { data, error } = await client.rpc("start_published_exam_attempt", {
    target_exam_slug: examSlug
  });

  if (error) {
    if (error.message.toLowerCase().includes("start_published_exam_attempt")) {
      throw new Error(
        "The published exam start RPC is not available yet. Run the latest Supabase migration or full setup SQL."
      );
    }

    throw new Error(`Failed to start exam attempt: ${error.message}`);
  }

  if (!data) {
    throw new Error("Exam attempt could not be started.");
  }

  const attempt = data as RpcStartedExamAttemptRow;

  return {
    attemptId: attempt.attempt_id,
    examSlug: attempt.exam_slug
  };
}

export async function createExamAttemptForUser(
  userId: string,
  examSlug: string,
  options?: { forceRestart?: boolean }
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { data: configData, error: configError } = await supabase
    .from("exam_configs")
    .select(
      "id,title,slug,description,exam_mode,selection_strategy,included_module_slugs,time_limit_minutes,question_count,passing_score"
    )
    .eq("slug", examSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (configError) {
    throw new Error(`Failed to load exam config: ${configError.message}`);
  }

  if (!configData) {
    throw new Error("Exam config was not found or is not published.");
  }

  const config = configData as RawExamConfig;
  const { data: activeAttemptData, error: activeAttemptError } = await supabase
    .from("exam_attempts")
    .select("id,expires_at")
    .eq("user_id", userId)
    .eq("exam_config_id", config.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeAttemptError) {
    throw new Error(`Failed to check for an active exam attempt: ${activeAttemptError.message}`);
  }

  const forceRestart = options?.forceRestart === true;
  if (activeAttemptData) {
    const activeAttemptId = activeAttemptData.id as string;
    const activeExpiresAt = new Date(activeAttemptData.expires_at as string).getTime();

    if (!forceRestart && Date.now() < activeExpiresAt) {
      return {
        attemptId: activeAttemptId,
        examSlug: config.slug
      };
    }

    await submitExamAttemptForUser(userId, config.slug, activeAttemptId, "timeout");
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return startPublishedExamAttemptWithRpc(
      supabase as DashboardSupabaseClient,
      config.slug
    );
  }

  const questionBank = await fetchExamQuestionBank(supabase);
  const scopedQuestionBank =
    config.included_module_slugs.length > 0
      ? questionBank.filter(
          (question) =>
            question.moduleSlug !== null &&
            config.included_module_slugs.includes(question.moduleSlug)
        )
      : questionBank;

  const selectedQuestions = selectExamQuestions(scopedQuestionBank, {
    questionCount: config.question_count,
    selectionStrategy: config.selection_strategy
  });

  if (selectedQuestions.length === 0) {
    throw new Error("No published questions are available for this exam config.");
  }

  const startedAt = new Date();
  const durationSeconds = config.time_limit_minutes * 60;
  const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000).toISOString();

  const { data: attemptData, error: attemptError } = await supabase
    .from("exam_attempts")
    .insert({
      user_id: userId,
      exam_config_id: config.id,
      expires_at: expiresAt,
      duration_seconds: durationSeconds,
      total_questions: selectedQuestions.length,
      unanswered_answers: selectedQuestions.length
    })
    .select("id")
    .single();

  if (attemptError) {
    throw new Error(`Failed to create exam attempt: ${attemptError.message}`);
  }

  const answerRows = selectedQuestions.map((question, index) => ({
    exam_attempt_id: attemptData.id as string,
    question_id: question.id,
    question_order: index + 1,
    module_slug_snapshot: question.moduleSlug,
    module_title_snapshot: question.moduleTitle,
    question_text_snapshot: question.questionText,
    explanation_snapshot: question.explanation,
    difficulty_snapshot: question.difficulty,
    question_type_snapshot: question.questionType,
    interaction_config_snapshot: question.interactionConfig ?? {},
    question_image_path_snapshot: question.questionImagePath,
    question_image_alt_snapshot: question.questionImageAlt,
    question_image_path_secondary_snapshot: question.questionImageSecondaryPath,
    question_image_alt_secondary_snapshot: question.questionImageSecondaryAlt,
    options_snapshot: question.options.map((option) => ({
      id: option.id,
      optionText: option.optionText,
      orderIndex: option.orderIndex,
      isCorrect: option.isCorrect,
      matchKey: option.matchKey
    })),
    correct_option_id:
      question.questionType === "single_choice"
        ? question.options.find((option) => option.isCorrect)?.id ?? null
        : null
  }));

  const { error: answersError } = await supabase
    .from("exam_attempt_answers")
    .insert(answerRows);

  if (answersError) {
    throw new Error(`Failed to create exam attempt questions: ${answersError.message}`);
  }

  return {
    attemptId: attemptData.id as string,
    examSlug: config.slug
  };
}

export async function fetchExamAttemptState(
  userId: string,
  examSlug: string,
  attemptId: string
): Promise<ExamAttemptState | null> {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    return null;
  }

  const attempt = await fetchAttemptRow(supabase, userId, attemptId);

  if (!attempt) {
    return null;
  }

  if (relationFirst(attempt.exam_config)?.slug !== examSlug) {
    return null;
  }

  const answers = await fetchAttemptAnswers(supabase, attemptId);

  return mapExamAttemptState(supabase, attempt, answers);
}

type SubmitReason = "manual" | "timeout";

export async function submitExamAttemptForUser(
  userId: string,
  examSlug: string,
  attemptId: string,
  reason: SubmitReason
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const attempt = await fetchAttemptRow(supabase, userId, attemptId);

  if (!attempt) {
    throw new Error("Exam attempt was not found.");
  }

  const examConfig = relationFirst(attempt.exam_config);

  if (!examConfig || examConfig.slug !== examSlug) {
    throw new Error("Exam attempt does not belong to the requested exam.");
  }

  if (attempt.status !== "in_progress") {
    return {
      attemptId,
      examSlug,
      status: attempt.status,
      redirectPath: `/exam-simulator/${examSlug}/results/${attemptId}`
    };
  }

  const answers = await fetchAttemptAnswers(supabase, attemptId);
  const summary = calculateExamScore(
    answers.map((answer) => ({
      answer: buildExamAnswerKey(answer),
      flagged: answer.flagged
    }))
  );
  const submittedAt = new Date().toISOString();
  const nextStatus = reason === "timeout" ? "timed_out" : "submitted";
  const timeUsedSeconds = clampTimeUsed(
    attempt.started_at,
    submittedAt,
    attempt.duration_seconds
  );

  const { error: updateError } = await supabase
    .from("exam_attempts")
    .update({
      status: nextStatus,
      submitted_at: submittedAt,
      time_used_seconds: timeUsedSeconds,
      correct_answers: summary.correctAnswers,
      incorrect_answers: summary.incorrectAnswers,
      unanswered_answers: summary.unansweredCount,
      flagged_count: summary.flaggedCount,
      score: summary.score
    })
    .eq("id", attemptId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Failed to submit exam attempt: ${updateError.message}`);
  }

  return {
    attemptId,
    examSlug,
    status: nextStatus,
    redirectPath: `/exam-simulator/${examSlug}/results/${attemptId}`
  };
}

async function ensureMutableAttempt(
  userId: string,
  attemptId: string,
  client: ReadSupabaseClient
) {
  const attempt = await fetchAttemptRow(client, userId, attemptId);

  if (!attempt) {
    throw new Error("Exam attempt was not found.");
  }

  const examConfig = relationFirst(attempt.exam_config);

  if (!examConfig) {
    throw new Error("Exam config could not be resolved for this attempt.");
  }

  if (attempt.status !== "in_progress") {
    return {
      attempt,
      examSlug: examConfig.slug,
      redirectPath: `/exam-simulator/${examConfig.slug}/results/${attemptId}`
    };
  }

  const now = Date.now();
  const expiresAt = new Date(attempt.expires_at).getTime();

  if (now >= expiresAt) {
    const submission = await submitExamAttemptForUser(
      userId,
      examConfig.slug,
      attemptId,
      "timeout"
    );

    return {
      attempt: await fetchAttemptRow(client, userId, attemptId),
      examSlug: examConfig.slug,
      redirectPath: submission.redirectPath
    };
  }

  return {
    attempt,
    examSlug: examConfig.slug,
    redirectPath: null
  };
}

export async function saveExamAttemptAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  input: {
    selectedOptionId?: string | null;
    selectedOptionIds?: string[];
    answerPayload?: { placements: Record<string, string> } | null;
    currentQuestionIndex?: number;
  }
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const mutable = await ensureMutableAttempt(userId, attemptId, supabase);

  if (mutable.redirectPath) {
    return {
      status: "submitted" as const,
      redirectPath: mutable.redirectPath
    };
  }

  const { data: answerData, error: answerError } = await supabase
    .from("exam_attempt_answers")
    .select(
      "id,question_type_snapshot,interaction_config_snapshot,correct_option_id,options_snapshot"
    )
    .eq("exam_attempt_id", attemptId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (answerError) {
    throw new Error(`Failed to load exam answer row: ${answerError.message}`);
  }

  if (!answerData) {
    throw new Error("Question was not found in this exam attempt.");
  }

  const questionType = answerData.question_type_snapshot as QuestionType;
  const nowIso = new Date().toISOString();
  let updatePayload:
    | {
        selected_option_id: string | null;
        answer_payload: Record<string, unknown> | MultipleChoiceAnswerPayload | null;
        is_correct: boolean | null;
        answered_at: string | null;
      }
    | undefined;

  if (questionType === "drag_drop_categorize") {
    const interactionConfig = normalizeDragDropInteractionConfig(
      answerData.interaction_config_snapshot
    );
    const rawPayload = normalizeDragDropAnswerPayload(input.answerPayload) ?? {
      placements: {}
    };
    const validOptionIds =
      (
        (answerData.options_snapshot as Array<{ id: string; matchKey: string | null }> | null) ??
        []
      ).map((option) => option.id);
    const validBucketIds = interactionConfig?.buckets.map((bucket) => bucket.id) ?? [];

    for (const [itemId, bucketId] of Object.entries(rawPayload.placements)) {
      if (!validOptionIds.includes(itemId)) {
        throw new Error("One of the dragged items is not valid for this question.");
      }

      if (!validBucketIds.includes(bucketId)) {
        throw new Error("One of the selected drag-and-drop buckets is invalid.");
      }
    }

    const normalizedPayload = {
      placements: Object.fromEntries(
        Object.entries(rawPayload.placements).filter(([itemId]) =>
          validOptionIds.includes(itemId)
        )
      )
    };
    const isComplete = isDragDropAnswerComplete(
      validOptionIds,
      validBucketIds,
      normalizedPayload
    );
    const isCorrect = isDragDropAnswerCorrect(
      (
        (answerData.options_snapshot as Array<{ id: string; matchKey: string | null }> | null) ??
        []
      ).map((option) => ({
        id: option.id,
        matchKey: option.matchKey
      })),
      validBucketIds,
      normalizedPayload
    );

    updatePayload = {
      selected_option_id: null,
      answer_payload: normalizedPayload,
      is_correct: isComplete ? isCorrect : null,
      answered_at: Object.keys(normalizedPayload.placements).length > 0 ? nowIso : null
    };
  } else if (questionType === "multiple_choice") {
    const validOptionIds =
      ((answerData.options_snapshot as Array<{ id: string; isCorrect: boolean }> | null) ?? []).map(
        (option) => option.id
      );
    const correctOptionIds =
      ((answerData.options_snapshot as Array<{ id: string; isCorrect: boolean }> | null) ?? [])
        .filter((option) => option.isCorrect)
        .map((option) => option.id);
    const selectedOptionIds = normalizeSelectedOptionIds(input.selectedOptionIds).filter((optionId) =>
      validOptionIds.includes(optionId)
    );

    if (
      normalizeSelectedOptionIds(input.selectedOptionIds).some(
        (optionId) => !validOptionIds.includes(optionId)
      )
    ) {
      throw new Error("One of the selected options is not valid for this question.");
    }

    updatePayload = {
      selected_option_id: null,
      answer_payload:
        selectedOptionIds.length > 0
          ? buildMultipleChoiceAnswerPayload(selectedOptionIds)
          : null,
      is_correct:
        selectedOptionIds.length > 0
          ? isMultipleChoiceCorrect(correctOptionIds, selectedOptionIds)
          : null,
      answered_at: selectedOptionIds.length > 0 ? nowIso : null
    };
  } else {
    const selectedOptionId = input.selectedOptionId ?? null;
    const validOptionIds =
      ((answerData.options_snapshot as Array<{ id: string }> | null) ?? []).map(
        (option) => option.id
      );

    if (!selectedOptionId || !validOptionIds.includes(selectedOptionId)) {
      throw new Error("Selected option is not valid for this question.");
    }

    updatePayload = {
      selected_option_id: selectedOptionId,
      answer_payload: null,
      is_correct:
        (answerData.correct_option_id as string | null) !== null &&
        selectedOptionId === (answerData.correct_option_id as string | null),
      answered_at: nowIso
    };
  }

  const { error: updateError } = await supabase
    .from("exam_attempt_answers")
    .update(updatePayload)
    .eq("id", answerData.id as string);

  if (updateError) {
    throw new Error(`Failed to save exam answer: ${updateError.message}`);
  }

  if (input.currentQuestionIndex && input.currentQuestionIndex > 0) {
    await supabase
      .from("exam_attempts")
      .update({
        current_question_index: input.currentQuestionIndex
      })
      .eq("id", attemptId)
      .eq("user_id", userId);
  }

  return {
    status: "saved" as const
  };
}

export async function setExamAttemptFlag(
  userId: string,
  attemptId: string,
  questionId: string,
  flagged: boolean,
  currentQuestionIndex?: number
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const mutable = await ensureMutableAttempt(userId, attemptId, supabase);

  if (mutable.redirectPath) {
    return {
      status: "submitted" as const,
      redirectPath: mutable.redirectPath
    };
  }

  const { error: updateError } = await supabase
    .from("exam_attempt_answers")
    .update({
      flagged
    })
    .eq("exam_attempt_id", attemptId)
    .eq("question_id", questionId);

  if (updateError) {
    throw new Error(`Failed to update exam flag: ${updateError.message}`);
  }

  if (currentQuestionIndex && currentQuestionIndex > 0) {
    await supabase
      .from("exam_attempts")
      .update({
        current_question_index: currentQuestionIndex
      })
      .eq("id", attemptId)
      .eq("user_id", userId);
  }

  return {
    status: "saved" as const
  };
}

export async function saveExamAttemptNavigation(
  userId: string,
  attemptId: string,
  currentQuestionIndex: number
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const mutable = await ensureMutableAttempt(userId, attemptId, supabase);

  if (mutable.redirectPath) {
    return {
      status: "submitted" as const,
      redirectPath: mutable.redirectPath
    };
  }

  const { error } = await supabase
    .from("exam_attempts")
    .update({
      current_question_index: Math.max(1, currentQuestionIndex)
    })
    .eq("id", attemptId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to save exam navigation: ${error.message}`);
  }

  return {
    status: "saved" as const
  };
}

function buildDomainBreakdown(answers: RawAttemptAnswerRow[]): ExamDomainPerformance[] {
  const byDomain = answers.reduce<Map<string, ExamDomainPerformance>>((acc, answer) => {
    const moduleSlug = answer.module_slug_snapshot ?? "unknown";
    const existing = acc.get(moduleSlug) ?? {
      moduleTitle: answer.module_title_snapshot ?? "Mixed Domain",
      moduleSlug,
      totalQuestions: 0,
      correctAnswers: 0,
      score: 0
    };

    existing.totalQuestions += 1;

    if (answer.is_correct) {
      existing.correctAnswers += 1;
    }

    acc.set(moduleSlug, existing);

    return acc;
  }, new Map());

  return Array.from(byDomain.values())
    .map((domain) => ({
      ...domain,
      score:
        domain.totalQuestions === 0
          ? 0
          : Math.round((domain.correctAnswers / domain.totalQuestions) * 100)
    }))
    .sort((a, b) => a.moduleTitle.localeCompare(b.moduleTitle));
}

export async function fetchExamAttemptResult(
  userId: string,
  examSlug: string,
  attemptId: string
): Promise<ExamAttemptResult | null> {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    return null;
  }

  const attempt = await fetchAttemptRow(supabase, userId, attemptId);

  if (!attempt) {
    return null;
  }

  const examConfig = relationFirst(attempt.exam_config);

  if (!examConfig || examConfig.slug !== examSlug || attempt.status === "in_progress") {
    return null;
  }

  const answers = await fetchAttemptAnswers(supabase, attemptId);

  return {
    attemptId: attempt.id,
    examTitle: examConfig.title,
    examSlug: examConfig.slug,
    description: examConfig.description ?? "",
    status: attempt.status,
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    correctAnswers: attempt.correct_answers,
    incorrectAnswers: attempt.incorrect_answers,
    unansweredCount: attempt.unanswered_answers,
    flaggedCount: attempt.flagged_count,
    timeUsedSeconds: attempt.time_used_seconds ?? attempt.duration_seconds,
    startedAt: attempt.started_at,
    completedAt: attempt.submitted_at,
    domainBreakdown: buildDomainBreakdown(answers),
    review: answers.map((answer) => {
      const interactionConfig = normalizeDragDropInteractionConfig(
        answer.interaction_config_snapshot
      );
      const answerPayload = normalizeDragDropAnswerPayload(answer.answer_payload);
      const selectedOptionIds = resolveSelectedOptionIds(answer);
      const correctOptionIds = [...(answer.options_snapshot ?? [])]
        .filter((option) => option.isCorrect)
        .map((option) => option.id);

      return {
        id: answer.id,
        questionId: answer.question_id,
        questionText: answer.question_text_snapshot,
        explanation: answer.explanation_snapshot,
        moduleTitle: answer.module_title_snapshot,
        moduleSlug: answer.module_slug_snapshot,
        difficulty: answer.difficulty_snapshot,
        questionType: answer.question_type_snapshot,
        interactionConfig,
        questionImageUrl: getQuizQuestionImagePublicUrl(
          supabase,
          answer.question_image_path_snapshot
        ),
        questionImageAlt: answer.question_image_alt_snapshot,
        questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
          supabase,
          answer.question_image_path_secondary_snapshot
        ),
        questionImageSecondaryAlt: answer.question_image_alt_secondary_snapshot,
        flagged: answer.flagged,
        isCorrect: Boolean(answer.is_correct),
        selectedOptionId:
          answer.question_type_snapshot === "single_choice"
            ? answer.selected_option_id
            : null,
        selectedOptionIds,
        correctOptionId:
          answer.question_type_snapshot === "single_choice"
            ? answer.correct_option_id
            : null,
        correctOptionIds,
        options: [...(answer.options_snapshot ?? [])]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((option) => ({
            id: option.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            isSelected: selectedOptionIds.includes(option.id),
            correctBucketId: option.matchKey,
            selectedBucketId: answerPayload?.placements[option.id] ?? null
          }))
      };
    })
  };
}

export async function fetchExamAttemptHistory(
  userId: string,
  limit = 6
): Promise<ExamHistoryItem[]> {
  const attempts = await fetchExamAttemptRows(userId);

  return attempts
    .filter((attempt) => attempt.status !== "in_progress")
    .slice(0, limit)
    .map(buildExamHistoryItem);
}

export async function fetchDashboardExamSnapshot(
  userId: string
): Promise<DashboardExamSnapshot | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const attempts = (await fetchExamAttemptRows(userId, undefined, supabase)).filter(
    (attempt) => attempt.status !== "in_progress"
  );

  if (attempts.length === 0) {
    return {
      attemptsTaken: 0,
      averageScore: null,
      latestScore: null,
      bestScore: null,
      lastAttemptAt: null,
      recentAttempts: []
    };
  }

  const scores = attempts
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== null);

  return {
    attemptsTaken: attempts.length,
    averageScore:
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null,
    latestScore: attempts[0]?.score ?? null,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    lastAttemptAt: attempts[0]?.submitted_at ?? null,
    recentAttempts: attempts.slice(0, 4).map(buildExamHistoryItem)
  };
}
