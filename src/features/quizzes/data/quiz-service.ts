import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { getQuizQuestionImagePublicUrl } from "@/lib/quiz-question-images";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculateQuizScore,
  getWeakPerformanceLabel,
  type QuizAnswerKey
} from "@/features/quizzes/lib/scoring";
import type {
  DashboardQuizSnapshot,
  QuizAttemptHistoryItem,
  QuizAttemptResult,
  QuizDetail,
  QuizListItem,
  RelatedQuizSummary
} from "@/types/quiz";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServiceRoleSupabaseClient>>
>;
type DashboardSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;
type ReadSupabaseClient = ServerSupabaseClient | DashboardSupabaseClient;

type RelationValue<T> = T | T[] | null;

type RawCourseRef = {
  title: string;
  slug: string;
};

type RawModuleRef = {
  id?: string;
  title: string;
  slug: string;
  course: RelationValue<RawCourseRef>;
};

type RawLessonRef = {
  id?: string;
  title: string;
  slug: string;
  module: RelationValue<RawModuleRef>;
};

type RawQuizRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  module_id: string | null;
  lesson_id: string | null;
  module: RawModuleRef[] | null;
  lesson: RawLessonRef[] | null;
  questions?: Array<{ id: string; show_in_quiz?: boolean }> | null;
};

type RawQuizQuestionPublic = {
  id: string;
  question_text: string;
  difficulty: "easy" | "medium" | "hard";
  order_index: number;
  show_in_quiz: boolean;
  question_type: "single_choice";
  question_image_path: string | null;
  question_image_alt: string;
  question_image_path_secondary: string | null;
  question_image_alt_secondary: string;
  options: Array<{
    id: string;
    option_text: string;
    order_index: number;
  }> | null;
};

type RawQuizQuestionPrivate = {
  id: string;
  question_text: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  order_index: number;
  show_in_quiz: boolean;
  question_type: "single_choice";
  question_image_path: string | null;
  question_image_alt: string;
  question_image_path_secondary: string | null;
  question_image_alt_secondary: string;
  options: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }> | null;
};

type RpcQuizDetailRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  course_title: string;
  course_slug: string;
  module_title: string | null;
  module_slug: string | null;
  lesson_title: string | null;
  lesson_slug: string | null;
  questions: Array<{
    id: string;
    question_text: string;
    difficulty: "easy" | "medium" | "hard";
    order_index: number;
    question_type: "single_choice";
    question_image_path: string | null;
    question_image_alt: string;
    question_image_path_secondary: string | null;
    question_image_alt_secondary: string;
    options: Array<{
      id: string;
      option_text: string;
      order_index: number;
    }> | null;
  }> | null;
};

type RpcQuizAttemptResultRow = {
  attempt_id: string;
  quiz_title: string;
  quiz_slug: string;
  description: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string | null;
  course_title: string;
  course_slug: string;
  module_title: string | null;
  module_slug: string | null;
  review: Array<{
    id: string;
    question_text: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    question_image_path: string | null;
    question_image_alt: string;
    question_image_path_secondary: string | null;
    question_image_alt_secondary: string;
    is_correct: boolean;
    selected_option_id: string | null;
    correct_option_id: string | null;
    options: Array<{
      id: string;
      option_text: string;
      is_correct: boolean;
      is_selected: boolean;
    }> | null;
  }> | null;
};

type RpcQuizSubmitResultRow = {
  attempt_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
};

type RawAttemptRow = {
  id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string | null;
  quiz: Array<{
    id?: string;
  title: string;
  slug: string;
  description?: string;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
  }>;
};

function getSupabaseClient() {
  return createServiceRoleSupabaseClient();
}

async function getReadSupabaseClient() {
  if (hasSupabaseServiceRoleEnv()) {
    return createServiceRoleSupabaseClient();
  }

  return createServerSupabaseClient();
}

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function resolveQuizContext(quiz: {
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
}) {
  const lessonRef = relationFirst(quiz.lesson);
  const moduleRef = relationFirst(quiz.module) ?? relationFirst(lessonRef?.module) ?? null;
  const courseRef = relationFirst(moduleRef?.course) ?? null;

  return {
    courseTitle: courseRef?.title ?? "Course",
    courseSlug: courseRef?.slug ?? "",
    moduleTitle: moduleRef?.title ?? null,
    moduleSlug: moduleRef?.slug ?? null,
    lessonTitle: lessonRef?.title ?? null,
    lessonSlug: lessonRef?.slug ?? null
  };
}

function buildAttemptHistoryItem(row: RawAttemptRow): QuizAttemptHistoryItem {
  const quiz = relationFirst(row.quiz);

  return {
    id: row.id,
    quizTitle: quiz?.title ?? "Quiz",
    quizSlug: quiz?.slug ?? "",
    score: row.score,
    correctAnswers: row.correct_answers,
    totalQuestions: row.total_questions,
    completedAt: row.completed_at
  };
}

function buildQuizAttemptMetrics(
  quizId: string,
  attempts: RawAttemptRow[]
): Pick<QuizListItem, "attemptsTaken" | "latestScore" | "averageScore"> {
  const quizAttempts = attempts.filter((attempt) => relationFirst(attempt.quiz)?.id === quizId);
  const attemptsTaken = quizAttempts.length;
  const latestScore = attemptsTaken > 0 ? quizAttempts[0].score : null;
  const averageScore =
    attemptsTaken > 0
      ? Math.round(
          quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / attemptsTaken
        )
      : null;

  return {
    attemptsTaken,
    latestScore,
    averageScore
  };
}

async function fetchAttemptRows(
  userId: string,
  quizIds?: string[],
  client?: ReadSupabaseClient
) {
  const supabase = client ?? (await getReadSupabaseClient());

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("quiz_attempts")
    .select("id,score,correct_answers,total_questions,completed_at,quiz:quizzes(id,title,slug)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (quizIds && quizIds.length > 0) {
    query = query.in("quiz_id", quizIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch quiz attempts: ${error.message}`);
  }

  return (data as RawAttemptRow[] | null) ?? [];
}

export async function fetchQuizList(userId: string): Promise<QuizListItem[]> {
  const supabase = await getReadSupabaseClient();
  const canReadQuestionCounts = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return [];
  }

  const { data, error } = canReadQuestionCounts
    ? await supabase
        .from("quizzes")
        .select(
          "id,title,slug,description,module_id,lesson_id,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(title,slug))),questions:quiz_questions(id,show_in_quiz)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("quizzes")
        .select(
          "id,title,slug,description,module_id,lesson_id,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(title,slug)))"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch quizzes: ${error.message}`);
  }

  const quizzes = (data as RawQuizRow[] | null) ?? [];
  const attempts = await fetchAttemptRows(
    userId,
    quizzes.map((quiz) => quiz.id),
    supabase
  );

  return quizzes.map((quiz) => {
    const context = resolveQuizContext(quiz);
    const metrics = buildQuizAttemptMetrics(quiz.id, attempts);

    return {
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      questionCount:
        quiz.questions?.filter((question) => question.show_in_quiz !== false).length ?? 0,
      courseTitle: context.courseTitle,
      courseSlug: context.courseSlug,
      moduleTitle: context.moduleTitle,
      moduleSlug: context.moduleSlug,
      lessonTitle: context.lessonTitle,
      lessonSlug: context.lessonSlug,
      attemptsTaken: metrics.attemptsTaken,
      latestScore: metrics.latestScore,
      averageScore: metrics.averageScore
    };
  });
}

export async function fetchQuizDetail(
  userId: string,
  quizSlug: string
): Promise<QuizDetail | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return fetchQuizDetailWithRpc(userId, quizSlug);
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id,title,slug,description,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(title,slug))),questions:quiz_questions(id,question_text,difficulty,order_index,show_in_quiz,question_type,question_image_path,question_image_alt,question_image_path_secondary,question_image_alt_secondary,options:question_options(id,option_text,order_index))"
    )
    .eq("slug", quizSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch quiz detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const quiz = data as Omit<RawQuizRow, "questions"> & {
    questions: RawQuizQuestionPublic[] | null;
  };
  const attempts = await fetchAttemptRows(userId, [quiz.id], supabase);
  const metrics = buildQuizAttemptMetrics(quiz.id, attempts);
  const context = resolveQuizContext(quiz);
  const questions = [...(quiz.questions ?? [])]
    .filter((question) => question.show_in_quiz !== false)
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => ({
      id: question.id,
      questionText: question.question_text,
      orderIndex: question.order_index,
      questionType: question.question_type,
      difficulty: question.difficulty,
      questionImageUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path
      ),
      questionImageAlt: question.question_image_alt,
      questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path_secondary
      ),
      questionImageSecondaryAlt: question.question_image_alt_secondary,
      options: [...(question.options ?? [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          optionText: option.option_text,
          orderIndex: option.order_index
        }))
    }));

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description,
    questionCount: questions.length,
    courseTitle: context.courseTitle,
    courseSlug: context.courseSlug,
    moduleTitle: context.moduleTitle,
    moduleSlug: context.moduleSlug,
    lessonTitle: context.lessonTitle,
    lessonSlug: context.lessonSlug,
    attemptsTaken: metrics.attemptsTaken,
    latestScore: metrics.latestScore,
    questions
  };
}

async function fetchQuizDetailWithRpc(
  userId: string,
  quizSlug: string
): Promise<QuizDetail | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_published_quiz_detail", {
    target_quiz_slug: quizSlug
  });

  if (error) {
    throw new Error(`Failed to fetch quiz detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const quiz = data as RpcQuizDetailRow;
  const attempts = await fetchAttemptRows(userId, [quiz.id], supabase);
  const metrics = buildQuizAttemptMetrics(quiz.id, attempts);
  const questions = [...(quiz.questions ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => ({
      id: question.id,
      questionText: question.question_text,
      orderIndex: question.order_index,
      questionType: question.question_type,
      difficulty: question.difficulty,
      questionImageUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path
      ),
      questionImageAlt: question.question_image_alt,
      questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path_secondary
      ),
      questionImageSecondaryAlt: question.question_image_alt_secondary,
      options: [...(question.options ?? [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          optionText: option.option_text,
          orderIndex: option.order_index
        }))
    }));

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description,
    questionCount: questions.length,
    courseTitle: quiz.course_title,
    courseSlug: quiz.course_slug,
    moduleTitle: quiz.module_title,
    moduleSlug: quiz.module_slug,
    lessonTitle: quiz.lesson_title,
    lessonSlug: quiz.lesson_slug,
    attemptsTaken: metrics.attemptsTaken,
    latestScore: metrics.latestScore,
    questions
  };
}

async function fetchQuizForScoring(
  quizSlug: string,
  client: ServerSupabaseClient
) {
  const { data, error } = await client
    .from("quizzes")
    .select(
      "id,title,slug,is_published,questions:quiz_questions(id,question_text,explanation,difficulty,order_index,show_in_quiz,question_type,question_image_path,question_image_alt,question_image_path_secondary,question_image_alt_secondary,options:question_options(id,option_text,is_correct,order_index))"
    )
    .eq("slug", quizSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch quiz for scoring: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data as {
    id: string;
    title: string;
    slug: string;
    questions: RawQuizQuestionPrivate[] | null;
  };
}

export async function submitQuizAttemptAndStore(
  userId: string,
  quizSlug: string,
  submittedAnswers: Record<string, string | null>
) {
  if (!hasSupabaseServiceRoleEnv()) {
    return submitQuizAttemptAndStoreWithRpc(userId, quizSlug, submittedAnswers);
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const quiz = await fetchQuizForScoring(quizSlug, supabase);

  if (!quiz) {
    throw new Error("Quiz was not found or is not published.");
  }

  const sortedQuestions = [...(quiz.questions ?? [])]
    .filter((question) => question.show_in_quiz !== false)
    .sort((a, b) => a.order_index - b.order_index);

  if (sortedQuestions.length === 0) {
    throw new Error("Quiz does not contain any questions yet.");
  }

  const answerKeys: QuizAnswerKey[] = sortedQuestions.map((question) => {
    const correctOptionId =
      [...(question.options ?? [])].find((option) => option.is_correct)?.id ?? null;

    return {
      questionId: question.id,
      correctOptionId,
      selectedOptionId: submittedAnswers[question.id] ?? null
    };
  });

  const summary = calculateQuizScore(answerKeys);

  const { data: attemptData, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quiz.id,
      score: summary.score,
      total_questions: summary.totalQuestions,
      correct_answers: summary.correctAnswers,
      completed_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (attemptError) {
    throw new Error(`Failed to create quiz attempt: ${attemptError.message}`);
  }

  const answerRows = answerKeys.map((answer) => ({
    quiz_attempt_id: attemptData.id as string,
    question_id: answer.questionId,
    selected_option_id: answer.selectedOptionId,
    is_correct:
      answer.correctOptionId !== null &&
      answer.selectedOptionId === answer.correctOptionId
  }));

  const { error: answersError } = await supabase
    .from("quiz_attempt_answers")
    .insert(answerRows);

  if (answersError) {
    throw new Error(
      `Failed to store quiz answers: ${answersError.message}`
    );
  }

  return {
    attemptId: attemptData.id as string,
    score: summary.score,
    totalQuestions: summary.totalQuestions,
    correctAnswers: summary.correctAnswers
  };
}

async function submitQuizAttemptAndStoreWithRpc(
  _userId: string,
  quizSlug: string,
  submittedAnswers: Record<string, string | null>
) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { data, error } = await supabase.rpc("submit_published_quiz_attempt", {
    target_quiz_slug: quizSlug,
    submitted_answers: submittedAnswers
  });

  if (error) {
    throw new Error(`Failed to submit quiz attempt: ${error.message}`);
  }

  if (!data) {
    throw new Error("Quiz was not found or is not published.");
  }

  const result = data as RpcQuizSubmitResultRow;

  return {
    attemptId: result.attempt_id,
    score: result.score,
    totalQuestions: result.total_questions,
    correctAnswers: result.correct_answers
  };
}

export async function fetchQuizAttemptResult(
  userId: string,
  quizSlug: string,
  attemptId: string
): Promise<QuizAttemptResult | null> {
  if (!hasSupabaseServiceRoleEnv()) {
    return fetchQuizAttemptResultWithRpc(userId, quizSlug, attemptId);
  }

  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: attemptData, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select(
      "id,score,total_questions,correct_answers,completed_at,quiz:quizzes(id,title,slug,description,module:modules(title,slug,course:courses(title,slug)),lesson:lessons(title,slug,module:modules(title,slug,course:courses(title,slug))))"
    )
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (attemptError) {
    throw new Error(`Failed to fetch quiz attempt: ${attemptError.message}`);
  }

  if (!attemptData) {
    return null;
  }

  const attempt = attemptData as RawAttemptRow;
  const quiz = relationFirst(attempt.quiz);

  if (!quiz || quiz.slug !== quizSlug) {
    return null;
  }

  const context = resolveQuizContext(quiz);

  const { data: questionsData, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(
      "id,question_text,explanation,difficulty,order_index,show_in_quiz,question_type,question_image_path,question_image_alt,question_image_path_secondary,question_image_alt_secondary,options:question_options(id,option_text,is_correct,order_index)"
    )
    .eq("quiz_id", quiz.id as string)
    .order("order_index", { ascending: true });

  if (questionsError) {
    throw new Error(`Failed to fetch quiz review: ${questionsError.message}`);
  }

  const { data: answersData, error: answersError } = await supabase
    .from("quiz_attempt_answers")
    .select("question_id,selected_option_id,is_correct")
    .eq("quiz_attempt_id", attemptId);

  if (answersError) {
    throw new Error(`Failed to fetch attempt answers: ${answersError.message}`);
  }

  const answersByQuestionId = new Map(
    ((answersData as Array<{
      question_id: string;
      selected_option_id: string | null;
      is_correct: boolean;
    }> | null) ?? []).map((answer) => [answer.question_id, answer])
  );

  const review = ((questionsData as RawQuizQuestionPrivate[] | null) ?? [])
    .filter((question) => answersByQuestionId.has(question.id))
    .map((question) => {
      const answer = answersByQuestionId.get(question.id);
      const options = [...(question.options ?? [])].sort(
        (a, b) => a.order_index - b.order_index
      );
      const correctOption = options.find((option) => option.is_correct) ?? null;

      return {
        id: question.id,
        questionText: question.question_text,
        explanation: question.explanation,
        difficulty: question.difficulty,
        questionImageUrl: getQuizQuestionImagePublicUrl(
          supabase,
          question.question_image_path
        ),
        questionImageAlt: question.question_image_alt,
        questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
          supabase,
          question.question_image_path_secondary
        ),
        questionImageSecondaryAlt: question.question_image_alt_secondary,
        isCorrect: Boolean(answer?.is_correct),
        selectedOptionId: answer?.selected_option_id ?? null,
        correctOptionId: correctOption?.id ?? null,
        options: options.map((option) => ({
          id: option.id,
          optionText: option.option_text,
          isCorrect: option.is_correct,
          isSelected: answer?.selected_option_id === option.id
        }))
      };
    });

  return {
    attemptId: attempt.id,
    quizTitle: quiz.title,
    quizSlug: quiz.slug,
    description: quiz.description ?? "",
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    correctAnswers: attempt.correct_answers,
    incorrectAnswers: attempt.total_questions - attempt.correct_answers,
    completedAt: attempt.completed_at,
    courseTitle: context.courseTitle,
    courseSlug: context.courseSlug,
    moduleTitle: context.moduleTitle,
    moduleSlug: context.moduleSlug,
    review
  };
}

async function fetchQuizAttemptResultWithRpc(
  _userId: string,
  quizSlug: string,
  attemptId: string
): Promise<QuizAttemptResult | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_quiz_attempt_review", {
    target_attempt_id: attemptId,
    target_quiz_slug: quizSlug
  });

  if (error) {
    throw new Error(`Failed to fetch quiz attempt: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const result = data as RpcQuizAttemptResultRow;

  return {
    attemptId: result.attempt_id,
    quizTitle: result.quiz_title,
    quizSlug: result.quiz_slug,
    description: result.description,
    score: result.score,
    totalQuestions: result.total_questions,
    correctAnswers: result.correct_answers,
    incorrectAnswers: result.total_questions - result.correct_answers,
    completedAt: result.completed_at,
    courseTitle: result.course_title,
    courseSlug: result.course_slug,
    moduleTitle: result.module_title,
    moduleSlug: result.module_slug,
    review: [...(result.review ?? [])].map((question) => ({
      id: question.id,
      questionText: question.question_text,
      explanation: question.explanation,
      difficulty: question.difficulty,
      questionImageUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path
      ),
      questionImageAlt: question.question_image_alt,
      questionImageSecondaryUrl: getQuizQuestionImagePublicUrl(
        supabase,
        question.question_image_path_secondary
      ),
      questionImageSecondaryAlt: question.question_image_alt_secondary,
      isCorrect: question.is_correct,
      selectedOptionId: question.selected_option_id,
      correctOptionId: question.correct_option_id,
      options: [...(question.options ?? [])].map((option) => ({
        id: option.id,
        optionText: option.option_text,
        isCorrect: option.is_correct,
        isSelected: option.is_selected
      }))
    }))
  };
}

export async function fetchQuizAttemptHistory(
  userId: string,
  limit = 6
): Promise<QuizAttemptHistoryItem[]> {
  const attempts = await fetchAttemptRows(userId);

  return attempts.slice(0, limit).map(buildAttemptHistoryItem);
}

export async function fetchDashboardQuizSnapshot(
  userId: string
): Promise<DashboardQuizSnapshot | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const attempts = await fetchAttemptRows(userId, undefined, supabase);

  if (attempts.length === 0) {
    return {
      attemptsTaken: 0,
      averageScore: null,
      latestResult: null,
      weakPerformance: null
    };
  }

  const latestResult = buildAttemptHistoryItem(attempts[0]);
  const averageScore = Math.round(
    attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
  );
  const weakestAttempt = [...attempts].sort((a, b) => a.score - b.score)[0];
  const weakPerformance =
    weakestAttempt.score < 75
      ? {
          quizTitle: weakestAttempt.quiz?.[0]?.title ?? "Quiz",
          score: weakestAttempt.score,
          label: getWeakPerformanceLabel(weakestAttempt.score)
        }
      : null;

  return {
    attemptsTaken: attempts.length,
    averageScore,
    latestResult,
    weakPerformance
  };
}

export async function fetchModuleQuizIndex(
  userId: string,
  moduleIds: string[]
): Promise<Record<string, RelatedQuizSummary>> {
  const supabase = await getReadSupabaseClient();
  const canReadQuestionCounts = hasSupabaseServiceRoleEnv();

  if (!supabase || moduleIds.length === 0) {
    return {};
  }

  const { data, error } = canReadQuestionCounts
    ? await supabase
        .from("quizzes")
        .select("id,title,slug,description,module_id,questions:quiz_questions(id,show_in_quiz)")
        .in("module_id", moduleIds)
        .eq("is_published", true)
    : await supabase
        .from("quizzes")
        .select("id,title,slug,description,module_id")
        .in("module_id", moduleIds)
        .eq("is_published", true);

  if (error) {
    throw new Error(`Failed to fetch related quizzes: ${error.message}`);
  }

  const quizzes = ((data as Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    module_id: string | null;
    questions: Array<{ id: string; show_in_quiz?: boolean }> | null;
  }> | null) ?? []);
  const attempts = await fetchAttemptRows(
    userId,
    quizzes.map((quiz) => quiz.id),
    supabase
  );

  return quizzes.reduce<Record<string, RelatedQuizSummary>>((acc, quiz) => {
    if (!quiz.module_id) {
      return acc;
    }

    const metrics = buildQuizAttemptMetrics(quiz.id, attempts);

    acc[quiz.module_id] = {
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      questionCount:
        quiz.questions?.filter((question) => question.show_in_quiz !== false).length ?? 0,
      attemptsTaken: metrics.attemptsTaken,
      latestScore: metrics.latestScore
    };

    return acc;
  }, {});
}

export async function fetchRelatedQuizForLessonContext(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<RelatedQuizSummary | null> {
  const supabase = await getReadSupabaseClient();
  const canReadQuestionCounts = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return null;
  }

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError) {
    throw new Error(`Failed to resolve lesson quiz course: ${courseError.message}`);
  }

  if (!courseData) {
    return null;
  }

  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseData.id as string)
    .eq("slug", moduleSlug)
    .maybeSingle();

  if (moduleError) {
    throw new Error(`Failed to resolve lesson quiz module: ${moduleError.message}`);
  }

  if (!moduleData) {
    return null;
  }

  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleData.id as string)
    .eq("slug", lessonSlug)
    .maybeSingle();

  if (lessonError) {
    throw new Error(`Failed to resolve lesson quiz lesson: ${lessonError.message}`);
  }

  if (lessonData?.id) {
    const { data: lessonQuizData } = canReadQuestionCounts
      ? await supabase
          .from("quizzes")
          .select(
            "id,title,slug,description,module_id,lesson_id,questions:quiz_questions(id,show_in_quiz)"
          )
          .eq("is_published", true)
          .eq("lesson_id", lessonData.id as string)
          .maybeSingle()
      : await supabase
          .from("quizzes")
          .select("id,title,slug,description,module_id,lesson_id")
          .eq("is_published", true)
          .eq("lesson_id", lessonData.id as string)
          .maybeSingle();

    if (lessonQuizData) {
      const resolvedLessonQuiz = lessonQuizData as {
        id: string;
        title: string;
        slug: string;
        description: string;
        questions?: Array<{ id: string; show_in_quiz?: boolean }> | null;
      };
      const attempts = await fetchAttemptRows(userId, [resolvedLessonQuiz.id], supabase);
      const metrics = buildQuizAttemptMetrics(resolvedLessonQuiz.id, attempts);

      return {
        id: resolvedLessonQuiz.id,
        title: resolvedLessonQuiz.title,
        slug: resolvedLessonQuiz.slug,
        description: resolvedLessonQuiz.description,
        questionCount:
          (resolvedLessonQuiz.questions ?? []).filter(
            (question) => question.show_in_quiz !== false
          ).length,
        attemptsTaken: metrics.attemptsTaken,
        latestScore: metrics.latestScore
      };
    }
  }

  const { data: moduleQuizData, error: moduleQuizError } = canReadQuestionCounts
    ? await supabase
        .from("quizzes")
        .select("id,title,slug,description,module_id,questions:quiz_questions(id,show_in_quiz)")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .maybeSingle()
    : await supabase
        .from("quizzes")
        .select("id,title,slug,description,module_id")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .maybeSingle();

  if (moduleQuizError) {
    throw new Error(`Failed to fetch related module quiz: ${moduleQuizError.message}`);
  }

  if (!moduleQuizData) {
    return null;
  }

  const resolvedModuleQuiz = moduleQuizData as {
    id: string;
    title: string;
    slug: string;
    description: string;
    questions?: Array<{ id: string; show_in_quiz?: boolean }> | null;
  };
  const attempts = await fetchAttemptRows(userId, [resolvedModuleQuiz.id], supabase);
  const metrics = buildQuizAttemptMetrics(resolvedModuleQuiz.id, attempts);

  return {
    id: resolvedModuleQuiz.id,
    title: resolvedModuleQuiz.title,
    slug: resolvedModuleQuiz.slug,
    description: resolvedModuleQuiz.description,
    questionCount:
      (resolvedModuleQuiz.questions ?? []).filter(
        (question) => question.show_in_quiz !== false
      ).length,
    attemptsTaken: metrics.attemptsTaken,
    latestScore: metrics.latestScore
  };
}
