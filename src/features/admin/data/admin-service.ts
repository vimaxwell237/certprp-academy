import type { PostgrestError } from "@supabase/supabase-js";

import { AdminFormError } from "@/features/admin/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminCertificationRecord,
  AdminCliChallengeRecord,
  AdminCourseRecord,
  AdminDashboardSnapshot,
  AdminDashboardStats,
  AdminLabRecord,
  AdminLessonRecord,
  AdminModuleRecord,
  AdminPlanRecord,
  AdminQuizRecord,
  AdminSelectOption,
  AdminTutorRecord,
  CertificationMutationInput,
  CliChallengeMutationInput,
  CourseMutationInput,
  LabMutationInput,
  LessonMutationInput,
  ModuleMutationInput,
  PlanMutationInput,
  QuizMutationInput,
  TutorMutationInput
} from "@/types/admin";
import type { PlanInterval } from "@/types/billing";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RelationValue<T> = T | T[] | null;

type PublicationState = {
  id: string;
  is_published: boolean;
};

type CoursePublicationState = PublicationState & {
  certification_id: string;
};

type ModulePublicationState = PublicationState & {
  course_id: string;
};

type LessonPublicationState = PublicationState & {
  module_id: string;
};

type RawCertification = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_published: boolean;
  created_at: string;
  courses: Array<{ id: string }> | null;
};

type RawCourse = {
  id: string;
  certification_id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  is_published: boolean;
  created_at: string;
  certification: RelationValue<{ id?: string; name: string; slug?: string; is_published?: boolean }>;
  modules: Array<{ id: string; lessons: Array<{ id: string }> | null }> | null;
};

type RawModule = {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  course: RelationValue<{
    id?: string;
    title: string;
    slug: string;
    is_published?: boolean;
  }>;
  lessons: Array<{ id: string }> | null;
};

type RawLesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  estimated_minutes: number;
  video_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  module: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
    course: RelationValue<{
      title: string;
    }>;
  }>;
};

type RawQuiz = {
  id: string;
  module_id: string | null;
  lesson_id: string | null;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  created_at: string;
  questions: Array<{ id: string }> | null;
  module: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
    course: RelationValue<{ title: string; is_published?: boolean }>;
  }>;
  lesson: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
    module: RelationValue<{
      title: string;
      is_published?: boolean;
      course: RelationValue<{ title: string; is_published?: boolean }>;
    }>;
  }>;
};

type RawLab = {
  id: string;
  module_id: string;
  lesson_id: string | null;
  title: string;
  slug: string;
  summary: string;
  instructions: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
  module: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
    course: RelationValue<{ title: string; is_published?: boolean }>;
  }>;
  lesson: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
  }>;
};

type RawCliChallenge = {
  id: string;
  module_id: string;
  lesson_id: string | null;
  title: string;
  slug: string;
  summary: string;
  scenario: string;
  objectives: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
  steps: Array<{ id: string }> | null;
  module: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
    course: RelationValue<{ title: string; is_published?: boolean }>;
  }>;
  lesson: RelationValue<{
    id?: string;
    title: string;
    is_published?: boolean;
  }>;
};

type RawTutor = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  expertise: string[] | null;
  is_active: boolean;
  created_at: string;
};

type RawPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_amount: number;
  price_currency: string;
  billing_interval: PlanInterval;
  is_active: boolean;
  created_at: string;
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

function throwIfWriteError(
  error: PostgrestError | null,
  message: string,
  fieldErrors: Record<string, string> = {}
) {
  if (!error) {
    return;
  }

  if (error.code === "23505") {
    throw new AdminFormError("A conflicting record already exists.", fieldErrors);
  }

  if (error.code === "23503") {
    throw new AdminFormError("A required related record could not be found.", fieldErrors);
  }

  throw new Error(`${message}: ${error.message}`);
}

function getEmptyAdminDashboardStats(): AdminDashboardStats {
  return {
    certifications: { total: 0, published: 0, draft: 0 },
    courses: { total: 0, published: 0, draft: 0 },
    lessons: { total: 0, published: 0, draft: 0 },
    quizzes: { total: 0, published: 0, draft: 0 },
    labs: { total: 0, published: 0, draft: 0 },
    cliChallenges: { total: 0, published: 0, draft: 0 },
    tutors: { total: 0, active: 0, inactive: 0 },
    plans: { total: 0, active: 0, inactive: 0 }
  };
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function countRows(
  client: ServerSupabaseClient,
  table: string,
  filter?: {
    column: string;
    value: boolean;
  }
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let query = client.from(table).select("*", { count: "exact", head: true });

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { count, error } = await query;

    if (!error) {
      return count ?? 0;
    }

    if (attempt === 0 && error.message.toLowerCase().includes("fetch failed")) {
      await wait(250);
      continue;
    }

    throw new Error(`Failed to count ${table}: ${error.message}`);
  }

  return 0;
}

async function ensureGlobalSlugUnique(
  client: ServerSupabaseClient,
  table: string,
  slug: string,
  currentId?: string
) {
  let query = client.from(table).select("id").eq("slug", slug);

  if (currentId) {
    query = query.neq("id", currentId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    throw new Error(`Failed to validate ${table} slug uniqueness: ${error.message}`);
  }

  if (data) {
    throw new AdminFormError("Slug is already in use.", {
      slug: "Slug is already in use."
    });
  }
}

async function ensureScopedUnique(
  client: ServerSupabaseClient,
  table: string,
  column: string,
  value: string | number,
  scope: Record<string, string>,
  currentId: string | undefined,
  fieldName: string,
  message: string
) {
  let query = client.from(table).select("id").eq(column, value);

  for (const [scopeColumn, scopeValue] of Object.entries(scope)) {
    query = query.eq(scopeColumn, scopeValue);
  }

  if (currentId) {
    query = query.neq("id", currentId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    throw new Error(`Failed to validate ${table} uniqueness: ${error.message}`);
  }

  if (data) {
    throw new AdminFormError(message, {
      [fieldName]: message
    });
  }
}

async function fetchCertificationPublicationState(
  client: ServerSupabaseClient,
  certificationId: string
) {
  const { data, error } = await client
    .from("certifications")
    .select("id,is_published")
    .eq("id", certificationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve certification state: ${error.message}`);
  }

  if (!data) {
    throw new AdminFormError("Certification could not be found.", {
      certificationId: "Select a valid certification."
    });
  }

  return data as PublicationState;
}

async function fetchCoursePublicationState(client: ServerSupabaseClient, courseId: string) {
  const { data, error } = await client
    .from("courses")
    .select("id,is_published,certification_id")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve course state: ${error.message}`);
  }

  if (!data) {
    throw new AdminFormError("Course could not be found.", {
      courseId: "Select a valid course."
    });
  }

  return data as CoursePublicationState;
}

async function fetchModulePublicationState(client: ServerSupabaseClient, moduleId: string) {
  const { data, error } = await client
    .from("modules")
    .select("id,is_published,course_id")
    .eq("id", moduleId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve module state: ${error.message}`);
  }

  if (!data) {
    throw new AdminFormError("Module could not be found.", {
      moduleId: "Select a valid module."
    });
  }

  return data as ModulePublicationState;
}

async function fetchLessonPublicationState(client: ServerSupabaseClient, lessonId: string) {
  const { data, error } = await client
    .from("lessons")
    .select("id,is_published,module_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve lesson state: ${error.message}`);
  }

  if (!data) {
    throw new AdminFormError("Lesson could not be found.", {
      lessonId: "Select a valid lesson."
    });
  }

  return data as LessonPublicationState;
}

async function assertCoursePublishable(
  client: ServerSupabaseClient,
  certificationId: string
) {
  const certification = await fetchCertificationPublicationState(client, certificationId);

  if (!certification.is_published) {
    throw new AdminFormError("Publish the certification before publishing this course.", {
      isPublished: "The linked certification is still in draft."
    });
  }
}

async function assertModulePublishable(client: ServerSupabaseClient, courseId: string) {
  const course = await fetchCoursePublicationState(client, courseId);

  if (!course.is_published) {
    throw new AdminFormError("Publish the course before publishing this module.", {
      isPublished: "The linked course is still in draft."
    });
  }
}

async function assertLessonPublishable(client: ServerSupabaseClient, moduleId: string) {
  const moduleRecord = await fetchModulePublicationState(client, moduleId);

  if (!moduleRecord.is_published) {
    throw new AdminFormError("Publish the module before publishing this lesson.", {
      isPublished: "The linked module is still in draft."
    });
  }
}

async function resolveQuizParent(
  client: ServerSupabaseClient,
  input: Pick<QuizMutationInput, "moduleId" | "lessonId">
) {
  const selectedCount = Number(Boolean(input.moduleId)) + Number(Boolean(input.lessonId));

  if (selectedCount !== 1) {
    throw new AdminFormError("Choose either a module or a lesson for this quiz.", {
      moduleId: "Choose one linked parent.",
      lessonId: "Choose one linked parent."
    });
  }

  if (input.lessonId) {
    const lesson = await fetchLessonPublicationState(client, input.lessonId);

    return {
      moduleId: null,
      lessonId: lesson.id,
      publishReady: lesson.is_published
    };
  }

  const moduleRecord = await fetchModulePublicationState(client, input.moduleId!);

  return {
    moduleId: moduleRecord.id,
    lessonId: null,
    publishReady: moduleRecord.is_published
  };
}

async function resolveModuleAndLesson(
  client: ServerSupabaseClient,
  input: {
    moduleId: string;
    lessonId: string | null;
  }
) {
  const moduleRecord = await fetchModulePublicationState(client, input.moduleId);

  if (!input.lessonId) {
    return {
      moduleId: moduleRecord.id,
      lessonId: null,
      publishReady: moduleRecord.is_published
    };
  }

  const lesson = await fetchLessonPublicationState(client, input.lessonId);

  if (lesson.module_id !== moduleRecord.id) {
    throw new AdminFormError("The selected lesson does not belong to the selected module.", {
      lessonId: "Choose a lesson from the selected module."
    });
  }

  return {
    moduleId: moduleRecord.id,
    lessonId: lesson.id,
    publishReady: moduleRecord.is_published && lesson.is_published
  };
}

function mapCertification(record: RawCertification): AdminCertificationRecord {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    isPublished: record.is_published,
    courseCount: record.courses?.length ?? 0,
    createdAt: record.created_at
  };
}

function mapCourse(record: RawCourse): AdminCourseRecord {
  const certification = relationFirst(record.certification);
  const modules = record.modules ?? [];

  return {
    id: record.id,
    certificationId: record.certification_id,
    certificationName: certification?.name ?? "Certification",
    title: record.title,
    slug: record.slug,
    description: record.description,
    level: record.level,
    isPublished: record.is_published,
    moduleCount: modules.length,
    lessonCount: modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0),
    createdAt: record.created_at
  };
}

function mapModule(record: RawModule): AdminModuleRecord {
  const course = relationFirst(record.course);

  return {
    id: record.id,
    courseId: record.course_id,
    courseTitle: course?.title ?? "Course",
    courseSlug: course?.slug ?? "",
    title: record.title,
    slug: record.slug,
    description: record.description,
    orderIndex: record.order_index,
    isPublished: record.is_published,
    lessonCount: record.lessons?.length ?? 0,
    createdAt: record.created_at
  };
}

function mapLesson(record: RawLesson): AdminLessonRecord {
  const moduleRecord = relationFirst(record.module);
  const course = relationFirst(moduleRecord?.course);

  return {
    id: record.id,
    moduleId: record.module_id,
    moduleTitle: moduleRecord?.title ?? "Module",
    courseTitle: course?.title ?? "Course",
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    content: record.content,
    estimatedMinutes: record.estimated_minutes,
    videoUrl: record.video_url,
    orderIndex: record.order_index,
    isPublished: record.is_published,
    createdAt: record.created_at
  };
}

function mapQuiz(record: RawQuiz): AdminQuizRecord {
  const moduleRecord = relationFirst(record.module);
  const lesson = relationFirst(record.lesson);
  const lessonModule = relationFirst(lesson?.module);
  const course = relationFirst(moduleRecord?.course) ?? relationFirst(lessonModule?.course);
  const contextLabel = lesson
    ? `${course?.title ?? "Course"} / ${lessonModule?.title ?? "Module"} / ${lesson.title}`
    : `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"}`;

  return {
    id: record.id,
    moduleId: record.module_id,
    lessonId: record.lesson_id,
    title: record.title,
    slug: record.slug,
    description: record.description,
    isPublished: record.is_published,
    questionCount: record.questions?.length ?? 0,
    contextLabel,
    createdAt: record.created_at
  };
}

function mapLab(record: RawLab): AdminLabRecord {
  const moduleRecord = relationFirst(record.module);
  const course = relationFirst(moduleRecord?.course);
  const lesson = relationFirst(record.lesson);
  const contextLabel = lesson
    ? `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"} / ${lesson.title}`
    : `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"}`;

  return {
    id: record.id,
    moduleId: record.module_id,
    lessonId: record.lesson_id,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    instructions: record.instructions,
    difficulty: record.difficulty,
    estimatedMinutes: record.estimated_minutes,
    isPublished: record.is_published,
    contextLabel,
    createdAt: record.created_at
  };
}

function mapCliChallenge(record: RawCliChallenge): AdminCliChallengeRecord {
  const moduleRecord = relationFirst(record.module);
  const course = relationFirst(moduleRecord?.course);
  const lesson = relationFirst(record.lesson);
  const contextLabel = lesson
    ? `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"} / ${lesson.title}`
    : `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"}`;

  return {
    id: record.id,
    moduleId: record.module_id,
    lessonId: record.lesson_id,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    scenario: record.scenario,
    objectives: record.objectives,
    difficulty: record.difficulty,
    estimatedMinutes: record.estimated_minutes,
    isPublished: record.is_published,
    contextLabel,
    stepCount: record.steps?.length ?? 0,
    createdAt: record.created_at
  };
}

function mapTutor(record: RawTutor): AdminTutorRecord {
  return {
    id: record.id,
    userId: record.user_id,
    displayName: record.display_name,
    bio: record.bio,
    expertise: record.expertise ?? [],
    isActive: record.is_active,
    createdAt: record.created_at
  };
}

function mapPlan(record: RawPlan): AdminPlanRecord {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    priceAmount: record.price_amount,
    priceCurrency: record.price_currency,
    billingInterval: record.billing_interval,
    isActive: record.is_active,
    createdAt: record.created_at
  };
}

async function countPublishedMetric(
  client: ServerSupabaseClient,
  table: string
): Promise<AdminDashboardStats[keyof AdminDashboardStats]> {
  const total = await countRows(client, table);
  const published = await countRows(client, table, {
    column: "is_published",
    value: true
  });

  return {
    total,
    published,
    draft: total - published
  };
}

async function countActiveMetric(
  client: ServerSupabaseClient,
  table: string,
  column: string
): Promise<AdminDashboardStats[keyof AdminDashboardStats]> {
  const total = await countRows(client, table);
  const active = await countRows(client, table, {
    column,
    value: true
  });

  return {
    total,
    active,
    inactive: total - active
  };
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardSnapshot> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      stats: getEmptyAdminDashboardStats(),
      warning: "Supabase environment variables are missing for the admin dashboard."
    };
  }

  try {
    const certifications = await countPublishedMetric(supabase, "certifications");
    const courses = await countPublishedMetric(supabase, "courses");
    const lessons = await countPublishedMetric(supabase, "lessons");
    const quizzes = await countPublishedMetric(supabase, "quizzes");
    const labs = await countPublishedMetric(supabase, "labs");
    const cliChallenges = await countPublishedMetric(supabase, "cli_challenges");
    const tutors = await countActiveMetric(supabase, "tutor_profiles", "is_active");
    const plans = await countActiveMetric(supabase, "plans", "is_active");

    return {
      stats: {
        certifications,
        courses,
        lessons,
        quizzes,
        labs,
        cliChallenges,
        tutors,
        plans
      } as AdminDashboardStats,
      warning: null
    };
  } catch (error) {
    return {
      stats: getEmptyAdminDashboardStats(),
      warning:
        error instanceof Error
          ? error.message
          : "The admin dashboard metrics could not be loaded."
    };
  }
}

export async function fetchAdminCertificationOptions(): Promise<AdminSelectOption[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("certifications")
    .select("id,name,slug,is_published")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch certification options: ${error.message}`);
  }

  return (((data as Array<{ id: string; name: string; slug: string; is_published: boolean }> | null) ?? []).map(
    (record) => ({
      value: record.id,
      label: record.name,
      hint: record.slug,
      state: record.is_published ? "published" : "draft"
    })
  ));
}

export async function fetchAdminCourseOptions(): Promise<AdminSelectOption[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id,title,slug,is_published,certification:certifications(name)")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch course options: ${error.message}`);
  }

  return (((data as Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    certification: RelationValue<{ name: string }>;
  }> | null) ?? []).map((record) => ({
    value: record.id,
    label: record.title,
    hint: relationFirst(record.certification)?.name ?? record.slug,
    state: record.is_published ? "published" : "draft"
  })));
}

export async function fetchAdminModuleOptions(): Promise<AdminSelectOption[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("modules")
    .select("id,title,slug,is_published,course:courses(title)")
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch module options: ${error.message}`);
  }

  return (((data as Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    course: RelationValue<{ title: string }>;
  }> | null) ?? []).map((record) => ({
    value: record.id,
    label: record.title,
    hint: relationFirst(record.course)?.title ?? record.slug,
    state: record.is_published ? "published" : "draft"
  })));
}

export async function fetchAdminLessonOptions(): Promise<AdminSelectOption[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,slug,is_published,module:modules(title,course:courses(title))")
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch lesson options: ${error.message}`);
  }

  return (((data as Array<{
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    module: RelationValue<{ title: string; course: RelationValue<{ title: string }> }>;
  }> | null) ?? []).map((record) => {
    const moduleRecord = relationFirst(record.module);
    const course = relationFirst(moduleRecord?.course);

    return {
      value: record.id,
      label: record.title,
      hint: `${course?.title ?? "Course"} / ${moduleRecord?.title ?? "Module"}`,
      state: record.is_published ? "published" : "draft"
    };
  }));
}

export async function fetchAdminCertifications(): Promise<AdminCertificationRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("certifications")
    .select("id,name,slug,description,is_published,created_at,courses(id)")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch certifications: ${error.message}`);
  }

  return (((data as RawCertification[] | null) ?? []).map(mapCertification));
}

export async function fetchAdminCertification(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("certifications")
    .select("id,name,slug,description,is_published,created_at,courses(id)")
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch certification: ${error.message}`);
  }

  return data ? mapCertification(data as RawCertification) : null;
}

export async function fetchAdminCourses(): Promise<AdminCourseRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,certification_id,title,slug,description,level,is_published,created_at,certification:certifications(id,name,slug,is_published),modules(id,lessons(id))"
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return (((data as RawCourse[] | null) ?? []).map(mapCourse));
}

export async function fetchAdminCourse(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,certification_id,title,slug,description,level,is_published,created_at,certification:certifications(id,name,slug,is_published),modules(id,lessons(id))"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch course: ${error.message}`);
  }

  return data ? mapCourse(data as RawCourse) : null;
}

export async function fetchAdminModules(): Promise<AdminModuleRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("modules")
    .select(
      "id,course_id,title,slug,description,order_index,is_published,created_at,course:courses(id,title,slug,is_published),lessons(id)"
    )
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch modules: ${error.message}`);
  }

  return (((data as RawModule[] | null) ?? []).map(mapModule));
}

export async function fetchAdminModule(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("modules")
    .select(
      "id,course_id,title,slug,description,order_index,is_published,created_at,course:courses(id,title,slug,is_published),lessons(id)"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch module: ${error.message}`);
  }

  return data ? mapModule(data as RawModule) : null;
}

export async function fetchAdminLessons(): Promise<AdminLessonRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id,module_id,title,slug,summary,content,estimated_minutes,video_url,order_index,is_published,created_at,module:modules(id,title,is_published,course:courses(title))"
    )
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch lessons: ${error.message}`);
  }

  return (((data as RawLesson[] | null) ?? []).map(mapLesson));
}

export async function fetchAdminLesson(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id,module_id,title,slug,summary,content,estimated_minutes,video_url,order_index,is_published,created_at,module:modules(id,title,is_published,course:courses(title))"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lesson: ${error.message}`);
  }

  return data ? mapLesson(data as RawLesson) : null;
}

export async function fetchAdminQuizzes(): Promise<AdminQuizRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id,module_id,lesson_id,title,slug,description,is_published,created_at,questions:quiz_questions(id),module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published,module:modules(title,is_published,course:courses(title,is_published)))"
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch quizzes: ${error.message}`);
  }

  return (((data as RawQuiz[] | null) ?? []).map(mapQuiz));
}

export async function fetchAdminQuiz(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id,module_id,lesson_id,title,slug,description,is_published,created_at,questions:quiz_questions(id),module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published,module:modules(title,is_published,course:courses(title,is_published)))"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch quiz: ${error.message}`);
  }

  return data ? mapQuiz(data as RawQuiz) : null;
}

export async function fetchAdminLabs(): Promise<AdminLabRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("labs")
    .select(
      "id,module_id,lesson_id,title,slug,summary,instructions,difficulty,estimated_minutes,is_published,created_at,module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published)"
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch labs: ${error.message}`);
  }

  return (((data as RawLab[] | null) ?? []).map(mapLab));
}

export async function fetchAdminLab(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("labs")
    .select(
      "id,module_id,lesson_id,title,slug,summary,instructions,difficulty,estimated_minutes,is_published,created_at,module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published)"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lab: ${error.message}`);
  }

  return data ? mapLab(data as RawLab) : null;
}

export async function fetchAdminCliChallenges(): Promise<AdminCliChallengeRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("cli_challenges")
    .select(
      "id,module_id,lesson_id,title,slug,summary,scenario,objectives,difficulty,estimated_minutes,is_published,created_at,steps:cli_steps(id),module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published)"
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch CLI challenges: ${error.message}`);
  }

  return (((data as RawCliChallenge[] | null) ?? []).map(mapCliChallenge));
}

export async function fetchAdminCliChallenge(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("cli_challenges")
    .select(
      "id,module_id,lesson_id,title,slug,summary,scenario,objectives,difficulty,estimated_minutes,is_published,created_at,steps:cli_steps(id),module:modules(id,title,is_published,course:courses(title,is_published)),lesson:lessons(id,title,is_published)"
    )
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch CLI challenge: ${error.message}`);
  }

  return data ? mapCliChallenge(data as RawCliChallenge) : null;
}

export async function fetchAdminTutors(): Promise<AdminTutorRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tutor profiles: ${error.message}`);
  }

  return (((data as RawTutor[] | null) ?? []).map(mapTutor));
}

export async function fetchAdminTutor(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active,created_at")
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch tutor profile: ${error.message}`);
  }

  return data ? mapTutor(data as RawTutor) : null;
}

export async function fetchAdminPlans(): Promise<AdminPlanRecord[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id,name,slug,description,price_amount,price_currency,billing_interval,is_active,created_at")
    .order("price_amount", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return (((data as RawPlan[] | null) ?? []).map(mapPlan));
}

export async function fetchAdminPlan(recordId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id,name,slug,description,price_amount,price_currency,billing_interval,is_active,created_at")
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return data ? mapPlan(data as RawPlan) : null;
}

export async function saveAdminCertification(input: CertificationMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await ensureGlobalSlugUnique(supabase, "certifications", input.slug, input.id);

  if (input.id) {
    const { error } = await supabase
      .from("certifications")
      .update({
        name: input.name,
        slug: input.slug,
        description: input.description,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update certification", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("certifications")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create certification", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("Certification creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminCourse(input: CourseMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await fetchCertificationPublicationState(supabase, input.certificationId);
  await ensureGlobalSlugUnique(supabase, "courses", input.slug, input.id);

  if (input.isPublished) {
    await assertCoursePublishable(supabase, input.certificationId);
  }

  if (input.id) {
    const { error } = await supabase
      .from("courses")
      .update({
        certification_id: input.certificationId,
        title: input.title,
        slug: input.slug,
        description: input.description,
        level: input.level,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update course", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      certification_id: input.certificationId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      level: input.level,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create course", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("Course creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminModule(input: ModuleMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await fetchCoursePublicationState(supabase, input.courseId);
  await ensureScopedUnique(
    supabase,
    "modules",
    "slug",
    input.slug,
    { course_id: input.courseId },
    input.id,
    "slug",
    "Slug is already used in this course."
  );
  await ensureScopedUnique(
    supabase,
    "modules",
    "order_index",
    input.orderIndex,
    { course_id: input.courseId },
    input.id,
    "orderIndex",
    "This order index is already used in this course."
  );

  if (input.isPublished) {
    await assertModulePublishable(supabase, input.courseId);
  }

  if (input.id) {
    const { error } = await supabase
      .from("modules")
      .update({
        course_id: input.courseId,
        title: input.title,
        slug: input.slug,
        description: input.description,
        order_index: input.orderIndex,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update module", {
      slug: "Slug is already used in this course.",
      orderIndex: "This order index is already used in this course."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("modules")
    .insert({
      course_id: input.courseId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      order_index: input.orderIndex,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create module", {
    slug: "Slug is already used in this course.",
    orderIndex: "This order index is already used in this course."
  });

  if (!data) {
    throw new Error("Module creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminLesson(input: LessonMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await fetchModulePublicationState(supabase, input.moduleId);
  await ensureScopedUnique(
    supabase,
    "lessons",
    "slug",
    input.slug,
    { module_id: input.moduleId },
    input.id,
    "slug",
    "Slug is already used in this module."
  );
  await ensureScopedUnique(
    supabase,
    "lessons",
    "order_index",
    input.orderIndex,
    { module_id: input.moduleId },
    input.id,
    "orderIndex",
    "This order index is already used in this module."
  );

  if (input.isPublished) {
    await assertLessonPublishable(supabase, input.moduleId);
  }

  if (input.id) {
    const { error } = await supabase
      .from("lessons")
      .update({
        module_id: input.moduleId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        content: input.content,
        estimated_minutes: input.estimatedMinutes,
        video_url: input.videoUrl,
        order_index: input.orderIndex,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update lesson", {
      slug: "Slug is already used in this module.",
      orderIndex: "This order index is already used in this module."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: input.moduleId,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      estimated_minutes: input.estimatedMinutes,
      video_url: input.videoUrl,
      order_index: input.orderIndex,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create lesson", {
    slug: "Slug is already used in this module.",
    orderIndex: "This order index is already used in this module."
  });

  if (!data) {
    throw new Error("Lesson creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminQuiz(input: QuizMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const parent = await resolveQuizParent(supabase, input);
  await ensureGlobalSlugUnique(supabase, "quizzes", input.slug, input.id);

  if (input.isPublished && !parent.publishReady) {
    throw new AdminFormError("Publish the linked module or lesson before publishing this quiz.", {
      isPublished: "The linked learning content is still in draft."
    });
  }

  if (input.id) {
    const { error } = await supabase
      .from("quizzes")
      .update({
        module_id: parent.moduleId,
        lesson_id: parent.lessonId,
        title: input.title,
        slug: input.slug,
        description: input.description,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update quiz", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      module_id: parent.moduleId,
      lesson_id: parent.lessonId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create quiz", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("Quiz creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminLab(input: LabMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const parent = await resolveModuleAndLesson(supabase, {
    moduleId: input.moduleId,
    lessonId: input.lessonId
  });
  await ensureGlobalSlugUnique(supabase, "labs", input.slug, input.id);

  if (input.isPublished && !parent.publishReady) {
    throw new AdminFormError("Publish the linked module or lesson before publishing this lab.", {
      isPublished: "The linked learning content is still in draft."
    });
  }

  if (input.id) {
    const { error } = await supabase
      .from("labs")
      .update({
        module_id: parent.moduleId,
        lesson_id: parent.lessonId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        instructions: input.instructions,
        difficulty: input.difficulty,
        estimated_minutes: input.estimatedMinutes,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update lab", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("labs")
    .insert({
      module_id: parent.moduleId,
      lesson_id: parent.lessonId,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      instructions: input.instructions,
      difficulty: input.difficulty,
      estimated_minutes: input.estimatedMinutes,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create lab", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("Lab creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminCliChallenge(input: CliChallengeMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const parent = await resolveModuleAndLesson(supabase, {
    moduleId: input.moduleId,
    lessonId: input.lessonId
  });
  await ensureGlobalSlugUnique(supabase, "cli_challenges", input.slug, input.id);

  if (input.isPublished && !parent.publishReady) {
    throw new AdminFormError(
      "Publish the linked module or lesson before publishing this CLI challenge.",
      {
        isPublished: "The linked learning content is still in draft."
      }
    );
  }

  if (input.id) {
    const { error } = await supabase
      .from("cli_challenges")
      .update({
        module_id: parent.moduleId,
        lesson_id: parent.lessonId,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        scenario: input.scenario,
        objectives: input.objectives,
        difficulty: input.difficulty,
        estimated_minutes: input.estimatedMinutes,
        is_published: input.isPublished
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update CLI challenge", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("cli_challenges")
    .insert({
      module_id: parent.moduleId,
      lesson_id: parent.lessonId,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      scenario: input.scenario,
      objectives: input.objectives,
      difficulty: input.difficulty,
      estimated_minutes: input.estimatedMinutes,
      is_published: input.isPublished
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create CLI challenge", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("CLI challenge creation did not return a record ID.");
  }

  return data.id as string;
}

async function syncTutorRole(client: ServerSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_roles")
    .select("id,role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve tutor role sync: ${error.message}`);
  }

  if (data?.role === "admin") {
    return;
  }

  if (data) {
    const { error: updateError } = await client
      .from("user_roles")
      .update({ role: "tutor" })
      .eq("id", data.id as string);

    throwIfWriteError(updateError, "Failed to sync tutor role");

    return;
  }

  const { error: insertError } = await client.from("user_roles").insert({
    user_id: userId,
    role: "tutor"
  });

  throwIfWriteError(insertError, "Failed to sync tutor role", {
    userId: "Tutor user ID is invalid."
  });
}

export async function saveAdminTutor(input: TutorMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await ensureScopedUnique(
    supabase,
    "tutor_profiles",
    "user_id",
    input.userId,
    {},
    input.id,
    "userId",
    "A tutor profile already exists for this user ID."
  );

  if (input.id) {
    const { error } = await supabase
      .from("tutor_profiles")
      .update({
        user_id: input.userId,
        display_name: input.displayName,
        bio: input.bio,
        expertise: input.expertise,
        is_active: input.isActive
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update tutor profile", {
      userId: "Tutor user ID is invalid."
    });

    await syncTutorRole(supabase, input.userId);

    return input.id;
  }

  const { data, error } = await supabase
    .from("tutor_profiles")
    .insert({
      user_id: input.userId,
      display_name: input.displayName,
      bio: input.bio,
      expertise: input.expertise,
      is_active: input.isActive
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create tutor profile", {
    userId: "Tutor user ID is invalid."
  });

  await syncTutorRole(supabase, input.userId);

  if (!data) {
    throw new Error("Tutor profile creation did not return a record ID.");
  }

  return data.id as string;
}

export async function saveAdminPlan(input: PlanMutationInput) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  await ensureGlobalSlugUnique(supabase, "plans", input.slug, input.id);

  if (input.id) {
    const { error } = await supabase
      .from("plans")
      .update({
        name: input.name,
        slug: input.slug,
        description: input.description,
        price_amount: input.priceAmount,
        billing_interval: input.billingInterval,
        is_active: input.isActive
      })
      .eq("id", input.id);

    throwIfWriteError(error, "Failed to update plan", {
      slug: "Slug is already in use."
    });

    return input.id;
  }

  const { data, error } = await supabase
    .from("plans")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      price_amount: input.priceAmount,
      billing_interval: input.billingInterval,
      is_active: input.isActive
    })
    .select("id")
    .single();

  throwIfWriteError(error, "Failed to create plan", {
    slug: "Slug is already in use."
  });

  if (!data) {
    throw new Error("Plan creation did not return a record ID.");
  }

  return data.id as string;
}

export async function setCertificationPublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminCertification(recordId);

  if (!record) {
    throw new AdminFormError("Certification could not be found.");
  }

  return saveAdminCertification({ ...record, isPublished });
}

export async function setCoursePublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminCourse(recordId);

  if (!record) {
    throw new AdminFormError("Course could not be found.");
  }

  return saveAdminCourse({
    id: record.id,
    certificationId: record.certificationId,
    title: record.title,
    slug: record.slug,
    description: record.description,
    level: record.level,
    isPublished
  });
}

export async function setModulePublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminModule(recordId);

  if (!record) {
    throw new AdminFormError("Module could not be found.");
  }

  return saveAdminModule({
    id: record.id,
    courseId: record.courseId,
    title: record.title,
    slug: record.slug,
    description: record.description,
    orderIndex: record.orderIndex,
    isPublished
  });
}

export async function setLessonPublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminLesson(recordId);

  if (!record) {
    throw new AdminFormError("Lesson could not be found.");
  }

  return saveAdminLesson({
    id: record.id,
    moduleId: record.moduleId,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    content: record.content,
    estimatedMinutes: record.estimatedMinutes,
    videoUrl: record.videoUrl,
    orderIndex: record.orderIndex,
    isPublished
  });
}

export async function setQuizPublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminQuiz(recordId);

  if (!record) {
    throw new AdminFormError("Quiz could not be found.");
  }

  return saveAdminQuiz({
    id: record.id,
    moduleId: record.moduleId,
    lessonId: record.lessonId,
    title: record.title,
    slug: record.slug,
    description: record.description,
    isPublished
  });
}

export async function setLabPublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminLab(recordId);

  if (!record) {
    throw new AdminFormError("Lab could not be found.");
  }

  return saveAdminLab({
    id: record.id,
    moduleId: record.moduleId,
    lessonId: record.lessonId,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    instructions: record.instructions,
    difficulty: record.difficulty,
    estimatedMinutes: record.estimatedMinutes,
    isPublished
  });
}

export async function setCliChallengePublishState(recordId: string, isPublished: boolean) {
  const record = await fetchAdminCliChallenge(recordId);

  if (!record) {
    throw new AdminFormError("CLI challenge could not be found.");
  }

  return saveAdminCliChallenge({
    id: record.id,
    moduleId: record.moduleId,
    lessonId: record.lessonId,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    scenario: record.scenario,
    objectives: record.objectives,
    difficulty: record.difficulty,
    estimatedMinutes: record.estimatedMinutes,
    isPublished
  });
}

export async function setTutorActiveState(recordId: string, isActive: boolean) {
  const record = await fetchAdminTutor(recordId);

  if (!record) {
    throw new AdminFormError("Tutor profile could not be found.");
  }

  return saveAdminTutor({
    id: record.id,
    userId: record.userId,
    displayName: record.displayName,
    bio: record.bio,
    expertise: record.expertise,
    isActive
  });
}

export async function setPlanActiveState(recordId: string, isActive: boolean) {
  const record = await fetchAdminPlan(recordId);

  if (!record) {
    throw new AdminFormError("Plan could not be found.");
  }

  return saveAdminPlan({
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    priceAmount: record.priceAmount,
    billingInterval: record.billingInterval,
    isActive
  });
}
