import { fetchBillingAccessState } from "@/features/billing/data/billing-service";
import { buildSupportRequestHref } from "@/features/support/lib/support-link";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ActiveStudyPlan,
  DashboardGuidanceSnapshot,
  GuidanceLink,
  RecommendationItem,
  RecommendationsPageData,
  RecommendationSeverity,
  RecommendationType,
  StudyPlanItem,
  StudyPlanItemType
} from "@/types/guidance";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RelationValue<T> = T | T[] | null;

type RawCourseRef = {
  id?: string;
  title: string;
  slug: string;
};

type RawModuleRef = {
  id: string;
  title: string;
  slug: string;
  order_index?: number;
  course: RelationValue<RawCourseRef>;
};

type RawLessonRef = {
  id: string;
  title: string;
  slug: string;
  order_index?: number;
  module: RelationValue<RawModuleRef>;
};

type RawQuizRef = {
  id: string;
  title: string;
  slug: string;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
};

type RawQuizAttemptRow = {
  id: string;
  score: number;
  completed_at: string | null;
  quiz: RelationValue<RawQuizRef>;
};

type RawExamConfigRef = {
  id: string;
  title: string;
  slug: string;
};

type RawExamAttemptRow = {
  id: string;
  score: number | null;
  submitted_at: string | null;
  exam_config: RelationValue<RawExamConfigRef>;
};

type RawExamAnswerRow = {
  exam_attempt_id: string;
  module_slug_snapshot: string | null;
  module_title_snapshot: string | null;
  is_correct: boolean | null;
};

type RawLabRef = {
  id: string;
  title: string;
  slug: string;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
};

type RawLabProgressRow = {
  id: string;
  lab_id: string;
  status: "not_started" | "in_progress" | "completed";
  updated_at: string;
  lab: RelationValue<RawLabRef>;
};

type RawCliRef = {
  id: string;
  title: string;
  slug: string;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
};

type RawCliAttemptRow = {
  id: string;
  challenge_id: string;
  status: "not_started" | "in_progress" | "completed";
  updated_at: string;
  challenge: RelationValue<RawCliRef>;
};

type RawSupportRequestRow = {
  id: string;
  subject: string;
  category:
    | "general"
    | "lesson_clarification"
    | "quiz_help"
    | "exam_help"
    | "lab_help"
    | "cli_help";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  lesson: RelationValue<RawLessonRef>;
  lab: RelationValue<Pick<RawLabRef, "id" | "title" | "slug">>;
  cli_challenge: RelationValue<Pick<RawCliRef, "id" | "title" | "slug">>;
  quiz_attempt: RelationValue<{
    id: string;
    quiz: RelationValue<Pick<RawQuizRef, "id" | "title" | "slug">>;
  }>;
  exam_attempt: RelationValue<{
    id: string;
    exam: RelationValue<RawExamConfigRef>;
  }>;
};

type RawRecommendationRow = {
  id: string;
  recommendation_type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  rationale: string;
  is_dismissed: boolean;
  created_at: string;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
  quiz: RelationValue<RawQuizRef>;
  exam: RelationValue<RawExamConfigRef>;
  lab: RelationValue<RawLabRef>;
  cli_challenge: RelationValue<RawCliRef>;
  support_request: RelationValue<{
    id: string;
    subject: string;
  }>;
};

type RawStudyPlanRow = {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
};

type RawStudyPlanItemRow = {
  id: string;
  item_type: StudyPlanItemType;
  title: string;
  description: string;
  action_label: string;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
  quiz: RelationValue<RawQuizRef>;
  exam: RelationValue<RawExamConfigRef>;
  lab: RelationValue<RawLabRef>;
  cli_challenge: RelationValue<RawCliRef>;
  support_request: RelationValue<{
    id: string;
    subject: string;
  }>;
};

type RecommendationDraft = {
  recommendationType: RecommendationType;
  severity: RecommendationSeverity;
  moduleId: string | null;
  lessonId: string | null;
  quizId: string | null;
  examConfigId: string | null;
  labId: string | null;
  cliChallengeId: string | null;
  supportRequestId: string | null;
  title: string;
  description: string;
  rationale: string;
};

type PlanItemDraft = {
  itemType: StudyPlanItemType;
  moduleId: string | null;
  lessonId: string | null;
  quizId: string | null;
  examConfigId: string | null;
  labId: string | null;
  cliChallengeId: string | null;
  supportRequestId: string | null;
  title: string;
  description: string;
  actionLabel: string;
  orderIndex: number;
};

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

function moduleContextFromQuiz(quiz: RawQuizRef | null) {
  const lesson = relationFirst(quiz?.lesson);

  return relationFirst(quiz?.module) ?? relationFirst(lesson?.module) ?? null;
}

function buildLessonHref(lesson: RawLessonRef | null): GuidanceLink | null {
  if (!lesson) {
    return null;
  }

  const moduleRef = relationFirst(lesson.module);
  const courseRef = relationFirst(moduleRef?.course);

  if (!moduleRef || !courseRef) {
    return null;
  }

  return {
    label: "Open lesson",
    href: `${APP_ROUTES.courses}/${courseRef.slug}/${moduleRef.slug}/${lesson.slug}`
  };
}

function buildQuizHref(quiz: RawQuizRef | null): GuidanceLink | null {
  if (!quiz) {
    return null;
  }

  return {
    label: "Open quiz",
    href: `${APP_ROUTES.quizzes}/${quiz.slug}`
  };
}

function buildExamHref(exam: RawExamConfigRef | null): GuidanceLink | null {
  if (!exam) {
    return null;
  }

  return {
    label: "Open exam mode",
    href: `${APP_ROUTES.examSimulator}/${exam.slug}`
  };
}

function buildLabHref(lab: RawLabRef | null): GuidanceLink | null {
  if (!lab) {
    return null;
  }

  return {
    label: "Open lab",
    href: `${APP_ROUTES.labs}/${lab.slug}`
  };
}

function buildCliHref(challenge: RawCliRef | null): GuidanceLink | null {
  if (!challenge) {
    return null;
  }

  return {
    label: "Open CLI practice",
    href: `${APP_ROUTES.cliPractice}/${challenge.slug}`
  };
}

function buildSupportHref(
  request: { id: string; subject: string } | null,
  context: {
    lessonId?: string | null;
    labId?: string | null;
    cliChallengeId?: string | null;
    quizAttemptId?: string | null;
    examAttemptId?: string | null;
  } = {}
): GuidanceLink | null {
  if (request) {
    return {
      label: "Open support thread",
      href: `${APP_ROUTES.support}/${request.id}`
    };
  }

  return {
    label: "Request tutor help",
    href: buildSupportRequestHref({
      category: "lesson_clarification",
      subject: "Need targeted help with a weak area",
      lessonId: context.lessonId ?? null,
      labId: context.labId ?? null,
      cliChallengeId: context.cliChallengeId ?? null,
      quizAttemptId: context.quizAttemptId ?? null,
      examAttemptId: context.examAttemptId ?? null
    })
  };
}

function buildRecommendationLink(row: RawRecommendationRow): GuidanceLink | null {
  const lesson = relationFirst(row.lesson);
  const quiz = relationFirst(row.quiz);
  const exam = relationFirst(row.exam);
  const lab = relationFirst(row.lab);
  const cliChallenge = relationFirst(row.cli_challenge);
  const supportRequest = relationFirst(row.support_request);

  return (
    buildLessonHref(lesson) ??
    buildQuizHref(quiz) ??
    buildExamHref(exam) ??
    buildLabHref(lab) ??
    buildCliHref(cliChallenge) ??
    buildSupportHref(supportRequest)
  );
}

function buildStudyPlanItemLink(row: RawStudyPlanItemRow): GuidanceLink | null {
  const lesson = relationFirst(row.lesson);
  const quiz = relationFirst(row.quiz);
  const exam = relationFirst(row.exam);
  const lab = relationFirst(row.lab);
  const cliChallenge = relationFirst(row.cli_challenge);
  const supportRequest = relationFirst(row.support_request);

  return (
    buildLessonHref(lesson) ??
    buildQuizHref(quiz) ??
    buildExamHref(exam) ??
    buildLabHref(lab) ??
    buildCliHref(cliChallenge) ??
    buildSupportHref(supportRequest)
  );
}

async function fetchLessonCatalog(client: ServerSupabaseClient) {
  const { data, error } = await client
    .from("lessons")
    .select(
      "id,title,slug,order_index,module:modules(id,title,slug,order_index,course:courses(id,title,slug))"
    )
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch lesson catalog: ${error.message}`);
  }

  return ((data as RawLessonRef[] | null) ?? []).sort((a, b) => {
    const moduleA = relationFirst(a.module);
    const moduleB = relationFirst(b.module);
    const moduleOrderDiff = (moduleA?.order_index ?? 0) - (moduleB?.order_index ?? 0);

    if (moduleOrderDiff !== 0) {
      return moduleOrderDiff;
    }

    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });
}

async function fetchCompletedLessonIds(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true);

  if (error) {
    throw new Error(`Failed to fetch lesson progress for guidance: ${error.message}`);
  }

  return new Set(((data as Array<{ lesson_id: string }> | null) ?? []).map((row) => row.lesson_id));
}

async function fetchQuizAttempts(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("quiz_attempts")
    .select(
      "id,score,completed_at,quiz:quizzes(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))))"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch quiz attempts for guidance: ${error.message}`);
  }

  return (data as RawQuizAttemptRow[] | null) ?? [];
}

async function fetchExamSignals(client: ServerSupabaseClient, userId: string) {
  const { data: attemptsData, error: attemptsError } = await client
    .from("exam_attempts")
    .select("id,score,submitted_at,exam_config:exam_configs(id,title,slug)")
    .eq("user_id", userId)
    .neq("status", "in_progress")
    .order("submitted_at", { ascending: false });

  if (attemptsError) {
    throw new Error(`Failed to fetch exam attempts for guidance: ${attemptsError.message}`);
  }

  const attempts = (attemptsData as RawExamAttemptRow[] | null) ?? [];

  if (attempts.length === 0) {
    return {
      attempts,
      answers: [] as RawExamAnswerRow[]
    };
  }

  const { data: answersData, error: answersError } = await client
    .from("exam_attempt_answers")
    .select("exam_attempt_id,module_slug_snapshot,module_title_snapshot,is_correct")
    .in(
      "exam_attempt_id",
      attempts.map((attempt) => attempt.id)
    );

  if (answersError) {
    throw new Error(`Failed to fetch exam answer signals: ${answersError.message}`);
  }

  return {
    attempts,
    answers: (answersData as RawExamAnswerRow[] | null) ?? []
  };
}

async function fetchLabSignals(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("lab_progress")
    .select(
      "id,lab_id,status,updated_at,lab:labs(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))))"
    )
    .eq("user_id", userId)
    .neq("status", "not_started")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch lab guidance signals: ${error.message}`);
  }

  return (data as RawLabProgressRow[] | null) ?? [];
}

async function fetchCliSignals(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("cli_attempts")
    .select(
      "id,challenge_id,status,updated_at,challenge:cli_challenges(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))))"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch CLI guidance signals: ${error.message}`);
  }

  return (data as RawCliAttemptRow[] | null) ?? [];
}

async function fetchSupportSignals(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("support_requests")
    .select(
      "id,subject,category,status,created_at,lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))),lab:labs(id,title,slug),cli_challenge:cli_challenges(id,title,slug),quiz_attempt:quiz_attempts(id,quiz:quizzes(id,title,slug)),exam_attempt:exam_attempts(id,exam:exam_configs(id,title,slug))"
    )
    .eq("learner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch support guidance signals: ${error.message}`);
  }

  return (data as RawSupportRequestRow[] | null) ?? [];
}

async function fetchRelatedAssetMaps(client: ServerSupabaseClient) {
  const [quizzesData, labsData, cliData] = await Promise.all([
    client
      .from("quizzes")
      .select(
        "id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))"
      )
      .eq("is_published", true),
    client
      .from("labs")
      .select(
        "id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))"
      )
      .eq("is_published", true),
    client
      .from("cli_challenges")
      .select(
        "id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))"
      )
      .eq("is_published", true)
  ]);

  if (quizzesData.error) {
    throw new Error(`Failed to fetch quiz asset map: ${quizzesData.error.message}`);
  }

  if (labsData.error) {
    throw new Error(`Failed to fetch lab asset map: ${labsData.error.message}`);
  }

  if (cliData.error) {
    throw new Error(`Failed to fetch CLI asset map: ${cliData.error.message}`);
  }

  const quizzes = (quizzesData.data as RawQuizRef[] | null) ?? [];
  const labs = (labsData.data as RawLabRef[] | null) ?? [];
  const cliChallenges = (cliData.data as RawCliRef[] | null) ?? [];

  const quizzesByModule = new Map<string, RawQuizRef>();
  const labsByModule = new Map<string, RawLabRef>();
  const cliByModule = new Map<string, RawCliRef>();

  for (const quiz of quizzes) {
    const moduleRef = moduleContextFromQuiz(quiz);

    if (moduleRef && !quizzesByModule.has(moduleRef.id)) {
      quizzesByModule.set(moduleRef.id, quiz);
    }
  }

  for (const lab of labs) {
    const moduleRef = relationFirst(lab.module);

    if (moduleRef && !labsByModule.has(moduleRef.id)) {
      labsByModule.set(moduleRef.id, lab);
    }
  }

  for (const challenge of cliChallenges) {
    const moduleRef = relationFirst(challenge.module);

    if (moduleRef && !cliByModule.has(moduleRef.id)) {
      cliByModule.set(moduleRef.id, challenge);
    }
  }

  return {
    quizzesByModule,
    labsByModule,
    cliByModule
  };
}

async function buildRecommendationDrafts(
  client: ServerSupabaseClient,
  userId: string
): Promise<{
  drafts: RecommendationDraft[];
  hasActivity: boolean;
}> {
  const billingAccess = await fetchBillingAccessState(userId);
  const [
    lessons,
    completedLessonIds,
    quizAttempts,
    examSignals,
    labSignals,
    cliSignals,
    supportSignals,
    assetMaps
  ] = await Promise.all([
    fetchLessonCatalog(client),
    fetchCompletedLessonIds(client, userId),
    fetchQuizAttempts(client, userId),
    fetchExamSignals(client, userId),
    fetchLabSignals(client, userId),
    fetchCliSignals(client, userId),
    fetchSupportSignals(client, userId),
    fetchRelatedAssetMaps(client)
  ]);

  const drafts: RecommendationDraft[] = [];
  const firstIncompleteLesson = lessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? null;
  const hasActivity =
    completedLessonIds.size > 0 ||
    quizAttempts.length > 0 ||
    examSignals.attempts.length > 0 ||
    labSignals.length > 0 ||
    cliSignals.length > 0 ||
    supportSignals.length > 0;

  if (!hasActivity && firstIncompleteLesson) {
    const moduleRef = relationFirst(firstIncompleteLesson.module);

    drafts.push({
      recommendationType: "low_activity",
      severity: "low",
      moduleId: moduleRef?.id ?? null,
      lessonId: firstIncompleteLesson.id,
      quizId: null,
      examConfigId: null,
      labId: null,
      cliChallengeId: null,
      supportRequestId: null,
      title: `Start with ${moduleRef?.title ?? "your first module"}`,
      description:
        "Begin your next lesson to establish momentum before adding more advanced practice.",
      rationale:
        "No recent learning activity was detected, so the best next step is a small lesson-based action."
    });
  }

  if (quizAttempts.length > 0) {
    const moduleStats = new Map<
      string,
      {
        module: RawModuleRef;
        latestQuiz: RawQuizRef | null;
        totalScore: number;
        attempts: number;
      }
    >();

    for (const attempt of quizAttempts) {
      const quiz = relationFirst(attempt.quiz);
      const moduleRef = moduleContextFromQuiz(quiz);

      if (!quiz || !moduleRef) {
        continue;
      }

      const existing = moduleStats.get(moduleRef.id) ?? {
        module: moduleRef,
        latestQuiz: quiz,
        totalScore: 0,
        attempts: 0
      };

      existing.totalScore += attempt.score;
      existing.attempts += 1;

      if (!existing.latestQuiz) {
        existing.latestQuiz = quiz;
      }

      moduleStats.set(moduleRef.id, existing);
    }

    const weakestQuizModule = Array.from(moduleStats.values())
      .map((entry) => ({
        ...entry,
        averageScore: Math.round(entry.totalScore / entry.attempts)
      }))
      .filter((entry) => entry.averageScore < 75)
      .sort((a, b) => a.averageScore - b.averageScore)[0];

    if (weakestQuizModule) {
      const reviewLesson =
        lessons.find(
          (lesson) => relationFirst(lesson.module)?.id === weakestQuizModule.module.id
        ) ?? null;

      drafts.push({
        recommendationType: "low_quiz_average",
        severity: weakestQuizModule.averageScore < 60 ? "high" : "medium",
        moduleId: weakestQuizModule.module.id,
        lessonId: reviewLesson?.id ?? null,
        quizId: weakestQuizModule.latestQuiz?.id ?? null,
        examConfigId: null,
        labId: null,
        cliChallengeId: null,
        supportRequestId: null,
        title: `Revisit ${weakestQuizModule.module.title} and retake the quiz`,
        description: `Your quiz average in ${weakestQuizModule.module.title} is ${weakestQuizModule.averageScore}%. Review the core lesson flow, then retake the module quiz.`,
        rationale:
          "Consistent quiz performance below 75% is a reliable indicator that the module needs reinforcement before broader practice."
      });
    }
  }

  if (examSignals.answers.length > 0) {
    const byModule = new Map<
      string,
      {
        moduleSlug: string;
        moduleTitle: string;
        total: number;
        correct: number;
      }
    >();

    for (const answer of examSignals.answers) {
      if (!answer.module_slug_snapshot) {
        continue;
      }

      const existing = byModule.get(answer.module_slug_snapshot) ?? {
        moduleSlug: answer.module_slug_snapshot,
        moduleTitle: answer.module_title_snapshot ?? "Mixed Domain",
        total: 0,
        correct: 0
      };

      existing.total += 1;

      if (answer.is_correct) {
        existing.correct += 1;
      }

      byModule.set(answer.module_slug_snapshot, existing);
    }

    const weakestDomain = Array.from(byModule.values())
      .map((entry) => ({
        ...entry,
        score: Math.round((entry.correct / entry.total) * 100)
      }))
      .filter((entry) => entry.score < 70)
      .sort((a, b) => a.score - b.score)[0];

    if (weakestDomain) {
      const targetModule =
        lessons
          .map((lesson) => relationFirst(lesson.module))
          .find((moduleRef) => moduleRef?.slug === weakestDomain.moduleSlug) ?? null;
      const targetLab = targetModule ? assetMaps.labsByModule.get(targetModule.id) ?? null : null;
      const targetCli = targetModule ? assetMaps.cliByModule.get(targetModule.id) ?? null : null;
      const targetQuiz =
        targetModule ? assetMaps.quizzesByModule.get(targetModule.id) ?? null : null;

      drafts.push({
        recommendationType: "weak_exam_domain",
        severity: weakestDomain.score < 55 ? "high" : "medium",
        moduleId: targetModule?.id ?? null,
        lessonId: null,
        quizId: targetQuiz?.id ?? null,
        examConfigId: relationFirst(examSignals.attempts[0]?.exam_config)?.id ?? null,
        labId: targetLab?.id ?? null,
        cliChallengeId: targetCli?.id ?? null,
        supportRequestId: null,
        title: `Target ${weakestDomain.moduleTitle} after your exam attempts`,
        description:
          targetLab || targetCli
            ? `Your exam-domain performance in ${weakestDomain.moduleTitle} is ${weakestDomain.score}%. Follow up with hands-on practice before the next exam session.`
            : `Your exam-domain performance in ${weakestDomain.moduleTitle} is ${weakestDomain.score}%. Reinforce the topic with targeted review and another quiz attempt.`,
        rationale:
          "Exam-domain breakdowns highlight weak areas that need narrower follow-up than another full mock exam."
      });
    }
  }

  const unfinishedLab = labSignals.find((row) => row.status === "in_progress") ?? null;

  if (unfinishedLab) {
    const lab = relationFirst(unfinishedLab.lab);
    const moduleRef = relationFirst(lab?.module);

    drafts.push({
      recommendationType: "unfinished_lab",
      severity: "medium",
      moduleId: moduleRef?.id ?? null,
      lessonId: null,
      quizId: null,
      examConfigId: null,
      labId: lab?.id ?? null,
      cliChallengeId: null,
      supportRequestId: null,
      title: `Finish the ${lab?.title ?? "current"} lab`,
      description:
        "You already started a hands-on lab. Completing it is the shortest route to turn partial effort into retained skill.",
      rationale:
        "Unfinished labs usually signal lost momentum in applied practice, so they should be completed before opening new tasks."
    });
  }

  const unfinishedCli = cliSignals.find((row) => row.status === "in_progress") ?? null;

  if (unfinishedCli) {
    const challenge = relationFirst(unfinishedCli.challenge);
    const moduleRef = relationFirst(challenge?.module);

    drafts.push({
      recommendationType: "unfinished_cli",
      severity: "medium",
      moduleId: moduleRef?.id ?? null,
      lessonId: null,
      quizId: null,
      examConfigId: null,
      labId: null,
      cliChallengeId: challenge?.id ?? null,
      supportRequestId: null,
      title: `Resume ${challenge?.title ?? "your CLI practice"}`,
      description:
        "The guided terminal session is already in progress. Finish it before context from the command sequence fades.",
      rationale:
        "CLI practice works best when the configuration sequence stays fresh, so in-progress attempts are strong next actions."
    });
  }

  const supportCategoryCounts = new Map<string, number>();

  for (const request of supportSignals) {
    supportCategoryCounts.set(
      request.category,
      (supportCategoryCounts.get(request.category) ?? 0) + 1
    );
  }

  const repeatedSupportTopic = supportSignals.find(
    (request) => (supportCategoryCounts.get(request.category) ?? 0) >= 2
  );

  if (repeatedSupportTopic) {
    const lesson = relationFirst(repeatedSupportTopic.lesson);
    const lab = relationFirst(repeatedSupportTopic.lab);
    const cliChallenge = relationFirst(repeatedSupportTopic.cli_challenge);
    const quizAttempt = relationFirst(repeatedSupportTopic.quiz_attempt);
    const examAttempt = relationFirst(repeatedSupportTopic.exam_attempt);
    const quiz = relationFirst(quizAttempt?.quiz);
    const exam = relationFirst(examAttempt?.exam);

    drafts.push({
      recommendationType: "support_revision",
      severity: billingAccess.hasTutorPlan ? "medium" : "low",
      moduleId: relationFirst(lesson?.module)?.id ?? null,
      lessonId: lesson?.id ?? null,
      quizId: quiz?.id ?? null,
      examConfigId: exam?.id ?? null,
      labId: lab?.id ?? null,
      cliChallengeId: cliChallenge?.id ?? null,
      supportRequestId: billingAccess.hasTutorPlan ? repeatedSupportTopic.id : null,
      title: `Stabilize the topic behind your ${repeatedSupportTopic.category.replaceAll("_", " ")}`,
      description: billingAccess.hasTutorPlan
        ? "You have asked for help on this topic more than once. Review the linked study context, then continue the support thread if the blocker remains."
        : "You have asked for help on this topic more than once. Revisit the linked context before moving on to new material.",
      rationale:
        "Repeated support activity around the same topic usually indicates a persistent gap that needs structured revision."
    });
  }

  if (firstIncompleteLesson) {
    const moduleRef = relationFirst(firstIncompleteLesson.module);

    drafts.push({
      recommendationType: "next_action",
      severity: drafts.length === 0 ? "medium" : "low",
      moduleId: moduleRef?.id ?? null,
      lessonId: firstIncompleteLesson.id,
      quizId: null,
      examConfigId: null,
      labId: null,
      cliChallengeId: null,
      supportRequestId: null,
      title: `Continue with ${firstIncompleteLesson.title}`,
      description:
        "A lesson-based next action keeps the study loop moving even while you work through remediation.",
      rationale:
        "A small, concrete next lesson prevents analysis paralysis and keeps course momentum alive."
    });
  }

  const uniqueDrafts = drafts.filter(
    (draft, index, items) =>
      items.findIndex(
        (candidate) =>
          candidate.recommendationType === draft.recommendationType &&
          candidate.moduleId === draft.moduleId &&
          candidate.lessonId === draft.lessonId &&
          candidate.quizId === draft.quizId &&
          candidate.labId === draft.labId &&
          candidate.cliChallengeId === draft.cliChallengeId
      ) === index
  );

  const severityWeight: Record<RecommendationSeverity, number> = {
    high: 3,
    medium: 2,
    low: 1
  };

  uniqueDrafts.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

  return {
    drafts: uniqueDrafts.slice(0, 6),
    hasActivity
  };
}

export async function generateRecommendationsForUser(userId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { drafts } = await buildRecommendationDrafts(supabase, userId);

  const { error: deleteError } = await supabase
    .from("learner_recommendations")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to clear old recommendations: ${deleteError.message}`);
  }

  if (drafts.length > 0) {
    const { error: insertError } = await supabase.from("learner_recommendations").insert(
      drafts.map((draft) => ({
        user_id: userId,
        recommendation_type: draft.recommendationType,
        severity: draft.severity,
        module_id: draft.moduleId,
        lesson_id: draft.lessonId,
        quiz_id: draft.quizId,
        exam_config_id: draft.examConfigId,
        lab_id: draft.labId,
        cli_challenge_id: draft.cliChallengeId,
        support_request_id: draft.supportRequestId,
        title: draft.title,
        description: draft.description,
        rationale: draft.rationale
      }))
    );

    if (insertError) {
      throw new Error(`Failed to store recommendations: ${insertError.message}`);
    }
  }
}

async function fetchRecommendationRows(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("learner_recommendations")
    .select(
      "id,recommendation_type,severity,title,description,rationale,is_dismissed,created_at,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))),quiz:quizzes(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),exam:exam_configs(id,title,slug),lab:labs(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),cli_challenge:cli_challenges(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),support_request:support_requests(id,subject)"
    )
    .eq("user_id", userId)
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch learner recommendations: ${error.message}`);
  }

  return (data as RawRecommendationRow[] | null) ?? [];
}

export async function fetchRecommendationsPageData(
  userId: string
): Promise<RecommendationsPageData> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      recommendations: [],
      generatedAt: null,
      hasActivity: false
    };
  }

  const [recommendationRows, signalSummary] = await Promise.all([
    fetchRecommendationRows(supabase, userId),
    buildRecommendationDrafts(supabase, userId)
  ]);

  return {
    recommendations: recommendationRows.map((row) => ({
      id: row.id,
      recommendationType: row.recommendation_type,
      severity: row.severity,
      title: row.title,
      description: row.description,
      rationale: row.rationale,
      createdAt: row.created_at,
      isDismissed: row.is_dismissed,
      link: buildRecommendationLink(row)
    })),
    generatedAt: recommendationRows[0]?.created_at ?? null,
    hasActivity: signalSummary.hasActivity
  };
}

export async function dismissRecommendationForUser(userId: string, recommendationId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { error } = await supabase
    .from("learner_recommendations")
    .update({
      is_dismissed: true
    })
    .eq("id", recommendationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to dismiss recommendation: ${error.message}`);
  }
}

function mapRecommendationToPlanItems(
  recommendation: RecommendationItem,
  row: RawRecommendationRow | null,
  orderIndex: number
): PlanItemDraft {
  switch (recommendation.recommendationType) {
    case "low_quiz_average":
      return {
        itemType: "quiz_retry",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: relationFirst(row?.lesson)?.id ?? null,
        quizId: relationFirst(row?.quiz)?.id ?? null,
        examConfigId: null,
        labId: null,
        cliChallengeId: null,
        supportRequestId: null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: relationFirst(row?.quiz) ? "Retake quiz" : "Review lesson",
        orderIndex
      };
    case "weak_exam_domain":
      return {
        itemType: "exam_follow_up",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: relationFirst(row?.lesson)?.id ?? null,
        quizId: relationFirst(row?.quiz)?.id ?? null,
        examConfigId: relationFirst(row?.exam)?.id ?? null,
        labId: relationFirst(row?.lab)?.id ?? null,
        cliChallengeId: relationFirst(row?.cli_challenge)?.id ?? null,
        supportRequestId: null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: relationFirst(row?.lab)
          ? "Open lab"
          : relationFirst(row?.cli_challenge)
            ? "Open CLI practice"
            : "Open targeted review",
        orderIndex
      };
    case "unfinished_lab":
      return {
        itemType: "lab_completion",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: null,
        quizId: null,
        examConfigId: null,
        labId: relationFirst(row?.lab)?.id ?? null,
        cliChallengeId: null,
        supportRequestId: null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: "Finish lab",
        orderIndex
      };
    case "unfinished_cli":
      return {
        itemType: "cli_completion",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: null,
        quizId: null,
        examConfigId: null,
        labId: null,
        cliChallengeId: relationFirst(row?.cli_challenge)?.id ?? null,
        supportRequestId: null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: "Resume CLI practice",
        orderIndex
      };
    case "support_revision":
      return {
        itemType: "support_follow_up",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: relationFirst(row?.lesson)?.id ?? null,
        quizId: relationFirst(row?.quiz)?.id ?? null,
        examConfigId: relationFirst(row?.exam)?.id ?? null,
        labId: relationFirst(row?.lab)?.id ?? null,
        cliChallengeId: relationFirst(row?.cli_challenge)?.id ?? null,
        supportRequestId: relationFirst(row?.support_request)?.id ?? null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: relationFirst(row?.support_request) ? "Open support" : "Review topic",
        orderIndex
      };
    default:
      return {
        itemType: "next_action",
        moduleId: relationFirst(row?.module)?.id ?? null,
        lessonId: relationFirst(row?.lesson)?.id ?? null,
        quizId: null,
        examConfigId: null,
        labId: null,
        cliChallengeId: null,
        supportRequestId: null,
        title: recommendation.title,
        description: recommendation.description,
        actionLabel: "Continue learning",
        orderIndex
      };
  }
}

export async function generateStudyPlanForUser(userId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const accessState = await fetchBillingAccessState(userId);

  if (!accessState.isPaid) {
    throw new Error("Study plans require Premium or Tutor Plan access.");
  }

  const recommendationRows = await fetchRecommendationRows(supabase, userId);

  if (recommendationRows.length === 0) {
    await generateRecommendationsForUser(userId);
  }

  const freshRows = await fetchRecommendationRows(supabase, userId);
  const recommendations = freshRows.map((row) => ({
    id: row.id,
    recommendationType: row.recommendation_type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    rationale: row.rationale,
    createdAt: row.created_at,
    isDismissed: row.is_dismissed,
    link: buildRecommendationLink(row)
  }));

  const { error: archiveError } = await supabase
    .from("study_plans")
    .update({
      status: "archived"
    })
    .eq("user_id", userId)
    .eq("status", "active");

  if (archiveError) {
    throw new Error(`Failed to archive prior study plans: ${archiveError.message}`);
  }

  const { data: planData, error: planError } = await supabase
    .from("study_plans")
    .insert({
      user_id: userId,
      title: "CCNA Remediation Plan",
      description: "A prioritized study plan generated from your recent learning and practice history.",
      status: "active"
    })
    .select("id")
    .single();

  if (planError) {
    throw new Error(`Failed to create study plan: ${planError.message}`);
  }

  const planItems = recommendations
    .slice(0, 6)
    .map((recommendation, index) =>
      mapRecommendationToPlanItems(
        recommendation,
        freshRows.find((row) => row.id === recommendation.id) ?? null,
        index + 1
      )
    );

  if (planItems.length > 0) {
    const { error: itemError } = await supabase.from("study_plan_items").insert(
      planItems.map((item) => ({
        study_plan_id: planData.id as string,
        item_type: item.itemType,
        module_id: item.moduleId,
        lesson_id: item.lessonId,
        quiz_id: item.quizId,
        exam_config_id: item.examConfigId,
        lab_id: item.labId,
        cli_challenge_id: item.cliChallengeId,
        support_request_id: item.supportRequestId,
        title: item.title,
        description: item.description,
        action_label: item.actionLabel,
        order_index: item.orderIndex
      }))
    );

    if (itemError) {
      throw new Error(`Failed to create study plan items: ${itemError.message}`);
    }
  }
}

async function fetchActiveStudyPlanRow(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("study_plans")
    .select("id,title,description,status,created_at,updated_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active study plan: ${error.message}`);
  }

  if (data) {
    return data as RawStudyPlanRow;
  }

  const { data: completedData, error: completedError } = await client
    .from("study_plans")
    .select("id,title,description,status,created_at,updated_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (completedError) {
    throw new Error(`Failed to fetch completed study plan: ${completedError.message}`);
  }

  return (completedData as RawStudyPlanRow | null) ?? null;
}

export async function fetchActiveStudyPlan(userId: string): Promise<ActiveStudyPlan | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const plan = await fetchActiveStudyPlanRow(supabase, userId);

  if (!plan) {
    return null;
  }

  const { data, error } = await supabase
    .from("study_plan_items")
    .select(
      "id,item_type,title,description,action_label,order_index,is_completed,completed_at,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug))),quiz:quizzes(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),exam:exam_configs(id,title,slug),lab:labs(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),cli_challenge:cli_challenges(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)),lesson:lessons(id,title,slug,module:modules(id,title,slug,course:courses(id,title,slug)))),support_request:support_requests(id,subject)"
    )
    .eq("study_plan_id", plan.id)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch study plan items: ${error.message}`);
  }

  const items = ((data as RawStudyPlanItemRow[] | null) ?? []).map<StudyPlanItem>((row) => ({
    id: row.id,
    itemType: row.item_type,
    title: row.title,
    description: row.description,
    actionLabel: row.action_label,
    orderIndex: row.order_index,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    link: buildStudyPlanItemLink(row)
  }));
  const completedItems = items.filter((item) => item.isCompleted).length;
  const totalItems = items.length;
  const progressPercentage =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    status: plan.status,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
    items,
    completedItems,
    totalItems,
    progressPercentage,
    nextPendingItem: items.find((item) => !item.isCompleted) ?? null
  };
}

export async function updateStudyPlanItemCompletion(
  userId: string,
  itemId: string,
  isCompleted: boolean
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const activePlan = await fetchActiveStudyPlanRow(supabase, userId);

  if (!activePlan) {
    throw new Error("No active study plan is available.");
  }

  const { error } = await supabase
    .from("study_plan_items")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq("id", itemId)
    .eq("study_plan_id", activePlan.id);

  if (error) {
    throw new Error(`Failed to update study plan item: ${error.message}`);
  }

  const refreshedPlan = await fetchActiveStudyPlan(userId);

  if (
    refreshedPlan &&
    refreshedPlan.totalItems > 0 &&
    refreshedPlan.completedItems === refreshedPlan.totalItems
  ) {
    await supabase
      .from("study_plans")
      .update({
        status: "completed"
      })
      .eq("id", refreshedPlan.id)
      .eq("user_id", userId);
  }
}

export async function fetchDashboardGuidanceSnapshot(
  userId: string
): Promise<DashboardGuidanceSnapshot | null> {
  const [recommendationsData, activePlan] = await Promise.all([
    fetchRecommendationsPageData(userId),
    fetchActiveStudyPlan(userId)
  ]);

  const topRecommendation = recommendationsData.recommendations[0] ?? null;
  const weakAreaSummary = topRecommendation
    ? {
        title: topRecommendation.title,
        summary: topRecommendation.rationale
      }
    : null;

  return {
    weakAreaSummary,
    topRecommendation,
    activeStudyPlan: activePlan
      ? {
          title: activePlan.title,
          progressPercentage: activePlan.progressPercentage,
          completedItems: activePlan.completedItems,
          totalItems: activePlan.totalItems
        }
      : null,
    nextRecommendedAction: activePlan?.nextPendingItem?.link ?? topRecommendation?.link ?? null
  };
}
