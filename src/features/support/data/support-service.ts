import { createServerSupabaseClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type {
  DashboardSupportSnapshot,
  SupportCategory,
  SupportContextSummary,
  SupportCreateFormData,
  SupportOverviewData,
  SupportPriority,
  SupportRequestDetail,
  SupportRequestListItem,
  SupportStatus,
  TutorProfileSummary
} from "@/types/support";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RelationValue<T> = T | T[] | null;

type RawTutorProfile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  expertise: string[] | null;
  is_active: boolean;
};

type RawLessonContext = {
  id: string;
  title: string;
  slug: string;
  module: RelationValue<{
    slug: string;
    course: RelationValue<{
      slug: string;
    }>;
  }>;
};

type RawQuizAttemptContext = {
  id: string;
  quiz: RelationValue<{
    title: string;
    slug: string;
  }>;
};

type RawExamAttemptContext = {
  id: string;
  exam: RelationValue<{
    title: string;
    slug: string;
  }>;
};

type RawLabContext = {
  id: string;
  title: string;
  slug: string;
};

type RawCliChallengeContext = {
  id: string;
  title: string;
  slug: string;
};

type RawSupportMessage = {
  id: string;
  sender_user_id: string;
  message_body: string;
  created_at: string;
};

type RawSupportRequest = {
  id: string;
  learner_user_id: string;
  tutor_profile_id: string | null;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  created_at: string;
  updated_at: string;
  tutor: RelationValue<RawTutorProfile>;
  lesson: RelationValue<RawLessonContext>;
  quiz_attempt: RelationValue<RawQuizAttemptContext>;
  exam_attempt: RelationValue<RawExamAttemptContext>;
  lab: RelationValue<RawLabContext>;
  cli_challenge: RelationValue<RawCliChallengeContext>;
  messages: RawSupportMessage[] | null;
};

const SUPPORT_SUBJECT_MAX_LENGTH = 160;
const SUPPORT_MESSAGE_MAX_LENGTH = 5_000;

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

function mapTutorProfile(profile: RawTutorProfile | null): TutorProfileSummary | null {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.user_id,
    displayName: profile.display_name,
    bio: profile.bio,
    expertise: profile.expertise ?? [],
    isActive: profile.is_active
  };
}

function clipMessagePreview(messageBody: string) {
  const normalized = messageBody.trim().replace(/\s+/g, " ");

  return normalized.length > 120
    ? `${normalized.slice(0, 117)}...`
    : normalized;
}

function buildSupportContexts(request: {
  lesson: RelationValue<RawLessonContext>;
  quiz_attempt: RelationValue<RawQuizAttemptContext>;
  exam_attempt: RelationValue<RawExamAttemptContext>;
  lab: RelationValue<RawLabContext>;
  cli_challenge: RelationValue<RawCliChallengeContext>;
}): SupportContextSummary[] {
  const contexts: SupportContextSummary[] = [];
  const lesson = relationFirst(request.lesson);
  const lessonModule = relationFirst(lesson?.module);
  const lessonCourse = relationFirst(lessonModule?.course);
  const quizAttempt = relationFirst(request.quiz_attempt);
  const quiz = relationFirst(quizAttempt?.quiz);
  const examAttempt = relationFirst(request.exam_attempt);
  const exam = relationFirst(examAttempt?.exam);
  const lab = relationFirst(request.lab);
  const cliChallenge = relationFirst(request.cli_challenge);

  if (lesson && lessonModule && lessonCourse) {
    contexts.push({
      type: "lesson",
      label: `Lesson: ${lesson.title}`,
      href: `${APP_ROUTES.courses}/${lessonCourse.slug}/${lessonModule.slug}/${lesson.slug}`
    });
  }

  if (quizAttempt && quiz) {
    contexts.push({
      type: "quiz_attempt",
      label: `Quiz Attempt: ${quiz.title}`,
      href: `${APP_ROUTES.quizzes}/${quiz.slug}/results/${quizAttempt.id}`
    });
  }

  if (examAttempt && exam) {
    contexts.push({
      type: "exam_attempt",
      label: `Exam Attempt: ${exam.title}`,
      href: `${APP_ROUTES.examSimulator}/${exam.slug}/results/${examAttempt.id}`
    });
  }

  if (lab) {
    contexts.push({
      type: "lab",
      label: `Lab: ${lab.title}`,
      href: `${APP_ROUTES.labs}/${lab.slug}`
    });
  }

  if (cliChallenge) {
    contexts.push({
      type: "cli_challenge",
      label: `CLI Challenge: ${cliChallenge.title}`,
      href: `${APP_ROUTES.cliPractice}/${cliChallenge.slug}`
    });
  }

  return contexts;
}

function mapSupportRequestListItem(request: RawSupportRequest): SupportRequestListItem {
  const tutor = mapTutorProfile(relationFirst(request.tutor));
  const messages = [...(request.messages ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const lastMessage = messages[messages.length - 1] ?? null;

  return {
    id: request.id,
    subject: request.subject,
    category: request.category,
    status: request.status,
    priority: request.priority,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
    tutorDisplayName: tutor?.displayName ?? null,
    messageCount: messages.length,
    lastMessagePreview: lastMessage ? clipMessagePreview(lastMessage.message_body) : null,
    contexts: buildSupportContexts(request)
  };
}

async function fetchCurrentTutorProfile(
  userId: string,
  client?: ServerSupabaseClient
): Promise<TutorProfileSummary | null> {
  const supabase = client ?? (await getSupabaseClient());

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch current tutor profile: ${error.message}`);
  }

  return mapTutorProfile((data as RawTutorProfile | null) ?? null);
}

export async function fetchTutorCatalog(): Promise<TutorProfileSummary[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tutors: ${error.message}`);
  }

  return (((data as RawTutorProfile[] | null) ?? []).map((profile) =>
    mapTutorProfile(profile)
  ).filter(Boolean) as TutorProfileSummary[]);
}

async function fetchVisibleSupportRequests(client: ServerSupabaseClient) {
  const { data, error } = await client
    .from("support_requests")
    .select(
      "id,learner_user_id,tutor_profile_id,subject,category,status,priority,created_at,updated_at,tutor:tutor_profiles(id,user_id,display_name,bio,expertise,is_active),lesson:lessons(id,title,slug,module:modules(slug,course:courses(slug))),quiz_attempt:quiz_attempts(id,quiz:quizzes(title,slug)),exam_attempt:exam_attempts(id,exam:exam_configs(title,slug)),lab:labs(id,title,slug),cli_challenge:cli_challenges(id,title,slug),messages:support_messages(id,sender_user_id,message_body,created_at)"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch support requests: ${error.message}`);
  }

  return (data as RawSupportRequest[] | null) ?? [];
}

export async function fetchSupportOverview(userId: string): Promise<SupportOverviewData> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      learnerRequests: [],
      tutorRequests: [],
      tutorProfile: null
    };
  }

  const [visibleRequests, tutorProfile] = await Promise.all([
    fetchVisibleSupportRequests(supabase),
    fetchCurrentTutorProfile(userId, supabase)
  ]);

  const learnerRequests = visibleRequests
    .filter((request) => request.learner_user_id === userId)
    .map(mapSupportRequestListItem);

  const tutorRequests = tutorProfile
    ? visibleRequests
        .filter(
          (request) =>
            request.learner_user_id !== userId &&
            (request.tutor_profile_id === tutorProfile.id ||
              (request.tutor_profile_id === null &&
                ["open", "in_progress"].includes(request.status)))
        )
        .map(mapSupportRequestListItem)
    : [];

  return {
    learnerRequests,
    tutorRequests,
    tutorProfile
  };
}

async function resolveSupportRequestById(
  requestId: string,
  client: ServerSupabaseClient
) {
  const { data, error } = await client
    .from("support_requests")
    .select(
      "id,learner_user_id,tutor_profile_id,subject,category,status,priority,created_at,updated_at,tutor:tutor_profiles(id,user_id,display_name,bio,expertise,is_active),lesson:lessons(id,title,slug,module:modules(slug,course:courses(slug))),quiz_attempt:quiz_attempts(id,quiz:quizzes(title,slug)),exam_attempt:exam_attempts(id,exam:exam_configs(title,slug)),lab:labs(id,title,slug),cli_challenge:cli_challenges(id,title,slug),messages:support_messages(id,sender_user_id,message_body,created_at)"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch support request detail: ${error.message}`);
  }

  return (data as RawSupportRequest | null) ?? null;
}

export async function fetchSupportRequestDetail(
  userId: string,
  requestId: string
): Promise<SupportRequestDetail | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [request, tutorProfile] = await Promise.all([
    resolveSupportRequestById(requestId, supabase),
    fetchCurrentTutorProfile(userId, supabase)
  ]);

  if (!request) {
    return null;
  }

  const assignedTutor = mapTutorProfile(relationFirst(request.tutor));
  const viewerRole =
    request.learner_user_id === userId || !tutorProfile ? "learner" : "tutor";
  const tutorCanAct =
    viewerRole === "tutor" &&
    tutorProfile !== null &&
    (request.tutor_profile_id === null || request.tutor_profile_id === tutorProfile.id);

  return {
    id: request.id,
    subject: request.subject,
    category: request.category,
    status: request.status,
    priority: request.priority,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
    learnerUserId: request.learner_user_id,
    tutorProfileId: request.tutor_profile_id,
    tutorDisplayName: assignedTutor?.displayName ?? null,
    tutorUserId: assignedTutor?.userId ?? null,
    viewerRole,
    canReply:
      request.learner_user_id === userId ||
      (viewerRole === "tutor" && tutorCanAct && request.status !== "closed"),
    canUpdateStatus: tutorCanAct,
    contexts: buildSupportContexts(request),
    messages: [...(request.messages ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((message) => {
        const senderRole =
          message.sender_user_id === userId
            ? "self"
            : message.sender_user_id === request.learner_user_id
              ? "learner"
              : "tutor";

        const senderLabel =
          senderRole === "self"
            ? "You"
            : senderRole === "learner"
              ? "Learner"
              : assignedTutor?.displayName ?? "Tutor";

        return {
          id: message.id,
          senderUserId: message.sender_user_id,
          senderLabel,
          senderRole,
          messageBody: message.message_body,
          createdAt: message.created_at
        };
      })
  };
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isSupportCategory(value: string): value is SupportCategory {
  return [
    "general",
    "lesson_clarification",
    "quiz_help",
    "exam_help",
    "lab_help",
    "cli_help"
  ].includes(value);
}

function isSupportPriority(value: string): value is SupportPriority {
  return ["low", "medium", "high"].includes(value);
}

async function resolveSupportContextInput(
  client: ServerSupabaseClient,
  userId: string,
  input: {
    lessonId?: string;
    quizAttemptId?: string;
    examAttemptId?: string;
    labId?: string;
    cliChallengeId?: string;
  }
) {
  const contextPreview: SupportContextSummary[] = [];
  const invalidContextReasons: string[] = [];
  const resolvedIds = {
    lessonId: "",
    quizAttemptId: "",
    examAttemptId: "",
    labId: "",
    cliChallengeId: ""
  };

  if (input.lessonId) {
    const { data, error } = await client
      .from("lessons")
      .select("id,title,slug,module:modules(slug,course:courses(slug))")
      .eq("id", input.lessonId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate lesson support context: ${error.message}`);
    }

    const lesson = (data as RawLessonContext | null) ?? null;
    const lessonModule = relationFirst(lesson?.module);
    const lessonCourse = relationFirst(lessonModule?.course);

    if (!lesson || !lessonModule || !lessonCourse) {
      invalidContextReasons.push("The linked lesson could not be resolved.");
    } else {
      resolvedIds.lessonId = lesson.id;
      contextPreview.push({
        type: "lesson",
        label: `Lesson: ${lesson.title}`,
        href: `${APP_ROUTES.courses}/${lessonCourse.slug}/${lessonModule.slug}/${lesson.slug}`
      });
    }
  }

  if (input.quizAttemptId) {
    const { data, error } = await client
      .from("quiz_attempts")
      .select("id,user_id,quiz:quizzes(title,slug)")
      .eq("id", input.quizAttemptId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate quiz support context: ${error.message}`);
    }

    const attempt = (data as (RawQuizAttemptContext & { user_id: string }) | null) ?? null;
    const quiz = relationFirst(attempt?.quiz);

    if (!attempt || !quiz) {
      invalidContextReasons.push("The linked quiz attempt is invalid for this learner.");
    } else {
      resolvedIds.quizAttemptId = attempt.id;
      contextPreview.push({
        type: "quiz_attempt",
        label: `Quiz Attempt: ${quiz.title}`,
        href: `${APP_ROUTES.quizzes}/${quiz.slug}/results/${attempt.id}`
      });
    }
  }

  if (input.examAttemptId) {
    const { data, error } = await client
      .from("exam_attempts")
      .select("id,user_id,exam:exam_configs(title,slug)")
      .eq("id", input.examAttemptId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate exam support context: ${error.message}`);
    }

    const attempt = (data as (RawExamAttemptContext & { user_id: string }) | null) ?? null;
    const exam = relationFirst(attempt?.exam);

    if (!attempt || !exam) {
      invalidContextReasons.push("The linked exam attempt is invalid for this learner.");
    } else {
      resolvedIds.examAttemptId = attempt.id;
      contextPreview.push({
        type: "exam_attempt",
        label: `Exam Attempt: ${exam.title}`,
        href: `${APP_ROUTES.examSimulator}/${exam.slug}/results/${attempt.id}`
      });
    }
  }

  if (input.labId) {
    const { data, error } = await client
      .from("labs")
      .select("id,title,slug")
      .eq("id", input.labId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate lab support context: ${error.message}`);
    }

    const lab = (data as RawLabContext | null) ?? null;

    if (!lab) {
      invalidContextReasons.push("The linked lab could not be resolved.");
    } else {
      resolvedIds.labId = lab.id;
      contextPreview.push({
        type: "lab",
        label: `Lab: ${lab.title}`,
        href: `${APP_ROUTES.labs}/${lab.slug}`
      });
    }
  }

  if (input.cliChallengeId) {
    const { data, error } = await client
      .from("cli_challenges")
      .select("id,title,slug")
      .eq("id", input.cliChallengeId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate CLI support context: ${error.message}`);
    }

    const challenge = (data as RawCliChallengeContext | null) ?? null;

    if (!challenge) {
      invalidContextReasons.push("The linked CLI challenge could not be resolved.");
    } else {
      resolvedIds.cliChallengeId = challenge.id;
      contextPreview.push({
        type: "cli_challenge",
        label: `CLI Challenge: ${challenge.title}`,
        href: `${APP_ROUTES.cliPractice}/${challenge.slug}`
      });
    }
  }

  return {
    contextPreview,
    invalidContextReasons,
    resolvedIds
  };
}

export async function fetchSupportCreateFormData(
  userId: string,
  searchParams: Record<string, string | string[] | undefined>
): Promise<SupportCreateFormData> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      tutors: [],
      contextPreview: [],
      invalidContextReasons: [],
      initialValues: {
        subject: "",
        category: "general",
        priority: "medium",
        tutorProfileId: "",
        lessonId: "",
        quizAttemptId: "",
        examAttemptId: "",
        labId: "",
        cliChallengeId: "",
        messageBody: ""
      }
    };
  }

  const initialCategory = readSearchParam(searchParams, "category");
  const initialPriority = readSearchParam(searchParams, "priority");
  const [tutors, resolvedContext] = await Promise.all([
    fetchTutorCatalog(),
    resolveSupportContextInput(supabase, userId, {
      lessonId: readSearchParam(searchParams, "lessonId"),
      quizAttemptId: readSearchParam(searchParams, "quizAttemptId"),
      examAttemptId: readSearchParam(searchParams, "examAttemptId"),
      labId: readSearchParam(searchParams, "labId"),
      cliChallengeId: readSearchParam(searchParams, "cliChallengeId")
    })
  ]);

  return {
    tutors,
    contextPreview: resolvedContext.contextPreview,
    invalidContextReasons: resolvedContext.invalidContextReasons,
    initialValues: {
      subject: readSearchParam(searchParams, "subject"),
      category: isSupportCategory(initialCategory) ? initialCategory : "general",
      priority: isSupportPriority(initialPriority) ? initialPriority : "medium",
      tutorProfileId: readSearchParam(searchParams, "tutorProfileId"),
      lessonId: resolvedContext.resolvedIds.lessonId,
      quizAttemptId: resolvedContext.resolvedIds.quizAttemptId,
      examAttemptId: resolvedContext.resolvedIds.examAttemptId,
      labId: resolvedContext.resolvedIds.labId,
      cliChallengeId: resolvedContext.resolvedIds.cliChallengeId,
      messageBody: readSearchParam(searchParams, "messageBody")
    }
  };
}

export async function createSupportRequestAndInitialMessage(
  userId: string,
  input: {
    tutorProfileId?: string;
    subject: string;
    category: SupportCategory;
    priority: SupportPriority;
    lessonId?: string;
    quizAttemptId?: string;
    examAttemptId?: string;
    labId?: string;
    cliChallengeId?: string;
    messageBody: string;
  }
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const subject = input.subject.trim();
  const messageBody = input.messageBody.trim();

  if (!subject) {
    throw new Error("Support request subject is required.");
  }

  if (subject.length > SUPPORT_SUBJECT_MAX_LENGTH) {
    throw new Error(
      `Support request subject must be ${SUPPORT_SUBJECT_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!messageBody) {
    throw new Error("Support request message is required.");
  }

  if (messageBody.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Support request message must be ${SUPPORT_MESSAGE_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!isSupportCategory(input.category)) {
    throw new Error("Support request category is invalid.");
  }

  if (!isSupportPriority(input.priority)) {
    throw new Error("Support request priority is invalid.");
  }

  const resolvedContext = await resolveSupportContextInput(supabase, userId, {
    lessonId: input.lessonId,
    quizAttemptId: input.quizAttemptId,
    examAttemptId: input.examAttemptId,
    labId: input.labId,
    cliChallengeId: input.cliChallengeId
  });

  if (resolvedContext.invalidContextReasons.length > 0) {
    throw new Error(resolvedContext.invalidContextReasons[0]);
  }

  let tutorProfileId: string | null = null;

  if (input.tutorProfileId) {
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("id", input.tutorProfileId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate selected tutor: ${error.message}`);
    }

    if (!data) {
      throw new Error("Selected tutor profile is not available.");
    }

    tutorProfileId = data.id as string;
  }

  const { data: requestData, error: requestError } = await supabase
    .from("support_requests")
    .insert({
      learner_user_id: userId,
      tutor_profile_id: tutorProfileId,
      subject,
      category: input.category,
      status: "open",
      priority: input.priority,
      lesson_id: resolvedContext.resolvedIds.lessonId || null,
      quiz_attempt_id: resolvedContext.resolvedIds.quizAttemptId || null,
      exam_attempt_id: resolvedContext.resolvedIds.examAttemptId || null,
      lab_id: resolvedContext.resolvedIds.labId || null,
      cli_challenge_id: resolvedContext.resolvedIds.cliChallengeId || null
    })
    .select("id")
    .single();

  if (requestError) {
    throw new Error(`Failed to create support request: ${requestError.message}`);
  }

  const { error: messageError } = await supabase
    .from("support_messages")
    .insert({
      support_request_id: requestData.id as string,
      sender_user_id: userId,
      message_body: messageBody
    });

  if (messageError) {
    throw new Error(`Failed to create support message: ${messageError.message}`);
  }

  return {
    requestId: requestData.id as string
  };
}

export async function postSupportReply(
  userId: string,
  input: {
    requestId: string;
    messageBody: string;
  }
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const messageBody = input.messageBody.trim();

  if (!messageBody) {
    throw new Error("Reply message is required.");
  }

  if (messageBody.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Reply message must be ${SUPPORT_MESSAGE_MAX_LENGTH} characters or fewer.`
    );
  }

  const [request, tutorProfile] = await Promise.all([
    resolveSupportRequestById(input.requestId, supabase),
    fetchCurrentTutorProfile(userId, supabase)
  ]);

  if (!request) {
    throw new Error("Support request was not found.");
  }

  if (request.status === "closed") {
    throw new Error("Closed support requests cannot accept new replies.");
  }

  const isLearner = request.learner_user_id === userId;
  const isTutorActor =
    tutorProfile !== null &&
    (request.tutor_profile_id === null || request.tutor_profile_id === tutorProfile.id);

  if (!isLearner && !isTutorActor) {
    throw new Error("You do not have access to reply in this support thread.");
  }

  if (isTutorActor) {
    const { error: requestUpdateError } = await supabase
      .from("support_requests")
      .update({
        tutor_profile_id: request.tutor_profile_id ?? tutorProfile.id,
        status: request.status === "resolved" ? "in_progress" : request.status === "open" ? "in_progress" : request.status
      })
      .eq("id", request.id);

    if (requestUpdateError) {
      throw new Error(
        `Failed to update tutor assignment for support request: ${requestUpdateError.message}`
      );
    }
  }

  const { error } = await supabase
    .from("support_messages")
    .insert({
      support_request_id: request.id,
      sender_user_id: userId,
      message_body: messageBody
    });

  if (error) {
    throw new Error(`Failed to post support reply: ${error.message}`);
  }
}

function isSupportStatus(value: string): value is SupportStatus {
  return ["open", "in_progress", "resolved", "closed"].includes(value);
}

export async function updateSupportRequestStatus(
  userId: string,
  input: {
    requestId: string;
    status: SupportStatus;
  }
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  if (!isSupportStatus(input.status)) {
    throw new Error("Support request status is invalid.");
  }

  const [request, tutorProfile] = await Promise.all([
    resolveSupportRequestById(input.requestId, supabase),
    fetchCurrentTutorProfile(userId, supabase)
  ]);

  if (!request) {
    throw new Error("Support request was not found.");
  }

  if (!tutorProfile) {
    throw new Error("Only active tutors can update support request status.");
  }

  if (
    request.tutor_profile_id !== null &&
    request.tutor_profile_id !== tutorProfile.id
  ) {
    throw new Error("This support request is assigned to a different tutor.");
  }

  const { error } = await supabase
    .from("support_requests")
    .update({
      tutor_profile_id: request.tutor_profile_id ?? tutorProfile.id,
      status: input.status
    })
    .eq("id", request.id);

  if (error) {
    throw new Error(`Failed to update support request status: ${error.message}`);
  }
}

export async function fetchDashboardSupportSnapshot(
  userId: string
): Promise<DashboardSupportSnapshot | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [tutorProfile, learnerData, visibleRequests] = await Promise.all([
    fetchCurrentTutorProfile(userId, supabase),
    supabase
      .from("support_requests")
      .select("id,subject,status,updated_at")
      .eq("learner_user_id", userId)
      .order("updated_at", { ascending: false }),
    fetchVisibleSupportRequests(supabase)
  ]);

  if (learnerData.error) {
    throw new Error(`Failed to fetch learner support metrics: ${learnerData.error.message}`);
  }

  const learnerRequests =
    ((learnerData.data as Array<{
      id: string;
      subject: string;
      status: SupportStatus;
      updated_at: string;
    }> | null) ?? []);
  const openRequests = learnerRequests.filter((request) =>
    ["open", "in_progress"].includes(request.status)
  ).length;
  const resolvedRequests = learnerRequests.filter((request) =>
    ["resolved", "closed"].includes(request.status)
  ).length;
  const latestActivity = learnerRequests[0]
    ? {
        id: learnerRequests[0].id,
        subject: learnerRequests[0].subject,
        status: learnerRequests[0].status,
        updatedAt: learnerRequests[0].updated_at
      }
    : null;

  const tutorMetrics = tutorProfile
    ? (() => {
        const tutorVisible = visibleRequests.filter(
          (request) => request.learner_user_id !== userId
        );

        return {
          assignedOpenRequests: tutorVisible.filter(
            (request) =>
              request.tutor_profile_id === tutorProfile.id &&
              ["open", "in_progress"].includes(request.status)
          ).length,
          resolvedRequests: tutorVisible.filter(
            (request) =>
              request.tutor_profile_id === tutorProfile.id &&
              ["resolved", "closed"].includes(request.status)
          ).length,
          unassignedOpenRequests: tutorVisible.filter(
            (request) =>
              request.tutor_profile_id === null &&
              ["open", "in_progress"].includes(request.status)
          ).length
        };
      })()
    : null;

  return {
    openRequests,
    resolvedRequests,
    latestActivity,
    tutorProfile: tutorProfile
      ? {
          id: tutorProfile.id,
          displayName: tutorProfile.displayName
        }
      : null,
    tutorMetrics
  };
}
