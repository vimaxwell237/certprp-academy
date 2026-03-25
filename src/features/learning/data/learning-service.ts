import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  CourseDetail,
  CourseSummary,
  DashboardLearningSnapshot,
  LessonDetail,
  LessonNavLink
} from "@/types/learning";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

interface RawLesson {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  order_index: number;
  estimated_minutes: number;
  video_url: string | null;
  is_published?: boolean;
}

interface RawModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  is_published?: boolean;
  lessons: RawLesson[] | null;
}

interface RawCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  certification: Array<{ name: string; slug: string; is_published?: boolean }> | null;
  modules: RawModule[] | null;
}

function calculateProgress(completedLessons: number, lessonCount: number) {
  if (lessonCount === 0) {
    return 0;
  }

  return Math.round((completedLessons / lessonCount) * 100);
}

function getVisibleLessons(lessons: RawLesson[] | null | undefined) {
  return (lessons ?? []).filter((lesson) => lesson.is_published !== false);
}

function getVisibleModules(modules: RawModule[] | null | undefined) {
  return (modules ?? []).filter((module) => module.is_published !== false);
}

function toLessonNavLink(
  courseSlug: string,
  moduleSlug: string,
  lesson: Pick<RawLesson, "title" | "slug" | "summary" | "estimated_minutes">
): LessonNavLink {
  return {
    title: lesson.title,
    courseSlug,
    moduleSlug,
    lessonSlug: lesson.slug,
    summary: lesson.summary,
    estimatedMinutes: lesson.estimated_minutes
  };
}

function calculateEstimatedMinutesTotal(
  lessons: Array<{ estimatedMinutes: number }>
): number {
  return lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);
}

function findContinueLesson(
  courseSlug: string,
  modules: Array<{
    slug: string;
    lessons: Array<{
      title: string;
      slug: string;
      summary: string;
      estimatedMinutes: number;
      completed: boolean;
    }>;
  }>
): LessonNavLink | null {
  for (const moduleItem of modules) {
    const nextIncompleteLesson = moduleItem.lessons.find((lesson) => !lesson.completed);

    if (nextIncompleteLesson) {
      return {
        title: nextIncompleteLesson.title,
        courseSlug,
        moduleSlug: moduleItem.slug,
        lessonSlug: nextIncompleteLesson.slug,
        summary: nextIncompleteLesson.summary,
        estimatedMinutes: nextIncompleteLesson.estimatedMinutes
      };
    }
  }

  const firstLesson = modules[0]?.lessons[0];
  const firstModule = modules[0];

  if (!firstLesson || !firstModule) {
    return null;
  }

  return {
    title: firstLesson.title,
    courseSlug,
    moduleSlug: firstModule.slug,
    lessonSlug: firstLesson.slug,
    summary: firstLesson.summary,
    estimatedMinutes: firstLesson.estimatedMinutes
  };
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

export async function fetchUserProgress(
  userId: string,
  lessonIds: string[],
  client?: ServerSupabaseClient
) {
  if (lessonIds.length === 0) {
    return new Set<string>();
  }

  const supabase = client ?? (await getSupabaseClient());

  if (!supabase) {
    return new Set<string>();
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", lessonIds);

  if (error) {
    throw new Error(`Failed to fetch user progress: ${error.message}`);
  }

  return new Set((data ?? []).map((entry) => entry.lesson_id as string));
}

function mapCourseSummary(
  course: RawCourse,
  completedLessons: Set<string>
): CourseSummary {
  const certification = course.certification?.[0];
  const modules = [...(course.modules ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const lessonIds = modules.flatMap((module) =>
    [...(module.lessons ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((lesson) => lesson.id)
  );
  const completedCount = lessonIds.filter((lessonId) =>
    completedLessons.has(lessonId)
  ).length;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    level: course.level,
    certificationName: certification?.name ?? "Certification",
    certificationSlug: certification?.slug ?? "unknown",
    moduleCount: modules.length,
    lessonCount: lessonIds.length,
    completedLessons: completedCount,
    progressPercentage: calculateProgress(completedCount, lessonIds.length)
  };
}

export async function fetchCourses(userId: string): Promise<CourseSummary[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,slug,description,level,certification:certifications(name,slug,is_published),modules(id,title,slug,description,order_index,is_published,lessons(id,title,slug,summary,order_index,estimated_minutes,video_url,is_published))"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  const courses = ((data as RawCourse[] | null) ?? []).filter(
    (course) => course.certification?.[0]?.is_published !== false
  );
  const lessonIds = courses.flatMap((course) =>
    getVisibleModules(course.modules).flatMap((module) =>
      getVisibleLessons(module.lessons).map((lesson) => lesson.id)
    )
  );
  const progress = await fetchUserProgress(userId, lessonIds, supabase);

  return courses.map((course) => mapCourseSummary(course, progress));
}

function mapCourseDetail(
  course: RawCourse,
  completedLessons: Set<string>
): CourseDetail {
  const certification = course.certification?.[0];
  const modules = [...(course.modules ?? [])]
    .filter((module) => module.is_published !== false)
    .sort((a, b) => a.order_index - b.order_index)
    .map((module) => {
      const lessons = [...getVisibleLessons(module.lessons)]
        .sort((a, b) => a.order_index - b.order_index)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          orderIndex: lesson.order_index,
          estimatedMinutes: lesson.estimated_minutes,
          videoUrl: lesson.video_url,
          completed: completedLessons.has(lesson.id)
        }));
      const completedCount = lessons.filter((lesson) => lesson.completed).length;
      const nextLessonCandidate =
        lessons.find((lesson) => !lesson.completed) ?? lessons[0] ?? null;

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        description: module.description,
        orderIndex: module.order_index,
        lessons,
        lessonCount: lessons.length,
        completedLessons: completedCount,
        progressPercentage: calculateProgress(completedCount, lessons.length),
        estimatedMinutesTotal: calculateEstimatedMinutesTotal(lessons),
        nextLesson: nextLessonCandidate
          ? {
              title: nextLessonCandidate.title,
              courseSlug: course.slug,
              moduleSlug: module.slug,
              lessonSlug: nextLessonCandidate.slug,
              summary: nextLessonCandidate.summary,
              estimatedMinutes: nextLessonCandidate.estimatedMinutes
            }
          : null
      };
    });

  const lessonCount = modules.reduce((total, module) => total + module.lessonCount, 0);
  const completedCount = modules.reduce(
    (total, module) => total + module.completedLessons,
    0
  );
  const estimatedMinutesTotal = modules.reduce(
    (total, module) => total + module.estimatedMinutesTotal,
    0
  );
  const continueLesson = findContinueLesson(course.slug, modules);

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    level: course.level,
    certificationName: certification?.name ?? "Certification",
    certificationSlug: certification?.slug ?? "unknown",
    modules,
    moduleCount: modules.length,
    lessonCount,
    completedLessons: completedCount,
    progressPercentage: calculateProgress(completedCount, lessonCount),
    estimatedMinutesTotal,
    continueLesson
  };
}

export async function fetchCourseDetail(
  userId: string,
  courseSlug: string
): Promise<CourseDetail | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,slug,description,level,certification:certifications(name,slug,is_published),modules(id,title,slug,description,order_index,is_published,lessons(id,title,slug,summary,order_index,estimated_minutes,video_url,is_published))"
    )
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch course detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const course = data as RawCourse;

  if (course.certification?.[0]?.is_published === false) {
    return null;
  }
  const lessonIds = getVisibleModules(course.modules).flatMap((module) =>
    getVisibleLessons(module.lessons).map((lesson) => lesson.id)
  );
  const progress = await fetchUserProgress(userId, lessonIds, supabase);

  return mapCourseDetail(course, progress);
}

async function fetchNextLessonLink(
  client: ServerSupabaseClient,
  moduleId: string,
  currentLessonOrder: number,
  moduleOrder: number,
  courseId: string,
  courseSlug: string
): Promise<LessonNavLink | null> {
  const { data: nextLessonInModule } = await client
    .from("lessons")
    .select("title,slug,summary,estimated_minutes,module:modules(slug)")
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .gt("order_index", currentLessonOrder)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextLessonInModule) {
    const nextModuleSlug = (
      nextLessonInModule.module as Array<{ slug: string }> | null
    )?.[0]?.slug;

    if (!nextModuleSlug) {
      return null;
    }

    return {
      title: nextLessonInModule.title as string,
      courseSlug,
      moduleSlug: nextModuleSlug,
      lessonSlug: nextLessonInModule.slug as string,
      summary: nextLessonInModule.summary as string,
      estimatedMinutes: nextLessonInModule.estimated_minutes as number
    };
  }

  const { data: nextModule } = await client
    .from("modules")
    .select("id,slug")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .gt("order_index", moduleOrder)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextModule) {
    return null;
  }

  const { data: firstLessonInNextModule } = await client
    .from("lessons")
    .select("title,slug,summary,estimated_minutes")
    .eq("module_id", nextModule.id as string)
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstLessonInNextModule) {
    return null;
  }

  return {
    title: firstLessonInNextModule.title as string,
    courseSlug,
    moduleSlug: nextModule.slug as string,
    lessonSlug: firstLessonInNextModule.slug as string,
    summary: firstLessonInNextModule.summary as string,
    estimatedMinutes: firstLessonInNextModule.estimated_minutes as number
  };
}

async function fetchPreviousLessonLink(
  client: ServerSupabaseClient,
  moduleId: string,
  currentLessonOrder: number,
  moduleOrder: number,
  courseId: string,
  courseSlug: string
): Promise<LessonNavLink | null> {
  const { data: previousLessonInModule } = await client
    .from("lessons")
    .select("title,slug,summary,estimated_minutes,module:modules(slug)")
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .lt("order_index", currentLessonOrder)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previousLessonInModule) {
    const previousModuleSlug = (
      previousLessonInModule.module as Array<{ slug: string }> | null
    )?.[0]?.slug;

    if (!previousModuleSlug) {
      return null;
    }

    return {
      title: previousLessonInModule.title as string,
      courseSlug,
      moduleSlug: previousModuleSlug,
      lessonSlug: previousLessonInModule.slug as string,
      summary: previousLessonInModule.summary as string,
      estimatedMinutes: previousLessonInModule.estimated_minutes as number
    };
  }

  const { data: previousModule } = await client
    .from("modules")
    .select("id,slug")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .lt("order_index", moduleOrder)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!previousModule) {
    return null;
  }

  const { data: lastLessonInPreviousModule } = await client
    .from("lessons")
    .select("title,slug,summary,estimated_minutes")
    .eq("module_id", previousModule.id as string)
    .eq("is_published", true)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastLessonInPreviousModule) {
    return null;
  }

  return {
    title: lastLessonInPreviousModule.title as string,
    courseSlug,
    moduleSlug: previousModule.slug as string,
    lessonSlug: lastLessonInPreviousModule.slug as string,
    summary: lastLessonInPreviousModule.summary as string,
    estimatedMinutes: lastLessonInPreviousModule.estimated_minutes as number
  };
}

export async function fetchLessonDetail(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<LessonDetail | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id,title,slug,certification:certifications(is_published)")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (courseError) {
    throw new Error(`Failed to fetch course for lesson: ${courseError.message}`);
  }

  if (!courseData) {
    return null;
  }

  if (
    (
      (courseData as {
        certification: Array<{ is_published?: boolean }> | null;
      }).certification?.[0]?.is_published
    ) === false
  ) {
    return null;
  }

  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("id,title,slug,order_index")
    .eq("course_id", courseData.id as string)
    .eq("slug", moduleSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (moduleError) {
    throw new Error(`Failed to fetch module for lesson: ${moduleError.message}`);
  }

  if (!moduleData) {
    return null;
  }

  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select(
      "id,title,slug,summary,content,order_index,estimated_minutes,video_url"
    )
    .eq("module_id", moduleData.id as string)
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (lessonError) {
    throw new Error(`Failed to fetch lesson detail: ${lessonError.message}`);
  }

  if (!lessonData) {
    return null;
  }

  const { data: progressData } = await supabase
    .from("user_progress")
    .select("completed")
    .eq("user_id", userId)
    .eq("lesson_id", lessonData.id as string)
    .maybeSingle();

  const { data: moduleLessonRows, error: moduleLessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleData.id as string)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (moduleLessonsError) {
    throw new Error(
      `Failed to fetch lesson ordering for module: ${moduleLessonsError.message}`
    );
  }

  const moduleLessonCount = (moduleLessonRows ?? []).length;
  const currentLessonNumber =
    (moduleLessonRows ?? []).findIndex((lesson) => lesson.id === lessonData.id) + 1;

  const [previousLesson, nextLesson] = await Promise.all([
    fetchPreviousLessonLink(
      supabase,
      moduleData.id as string,
      lessonData.order_index as number,
      moduleData.order_index as number,
      courseData.id as string,
      courseSlug
    ),
    fetchNextLessonLink(
      supabase,
      moduleData.id as string,
      lessonData.order_index as number,
      moduleData.order_index as number,
      courseData.id as string,
      courseSlug
    )
  ]);

  return {
    id: lessonData.id as string,
    title: lessonData.title as string,
    slug: lessonData.slug as string,
    summary: lessonData.summary as string,
    content: lessonData.content as string,
    estimatedMinutes: lessonData.estimated_minutes as number,
    videoUrl: lessonData.video_url as string | null,
    completed: Boolean(progressData?.completed),
    course: {
      title: courseData.title as string,
      slug: courseData.slug as string
    },
    module: {
      title: moduleData.title as string,
      slug: moduleData.slug as string
    },
    currentLessonNumber:
      currentLessonNumber > 0 ? currentLessonNumber : lessonData.order_index,
    moduleLessonCount,
    previousLesson,
    nextLesson
  };
}

export async function updateLessonCompletion(
  userId: string,
  lessonId: string,
  completed: boolean
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return;
  }

  const completedAt = completed ? new Date().toISOString() : null;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed,
      completed_at: completedAt
    },
    {
      onConflict: "user_id,lesson_id"
    }
  );

  if (error) {
    throw new Error(`Failed to update lesson completion: ${error.message}`);
  }
}

export async function fetchDashboardLearningSnapshot(
  userId: string
): Promise<DashboardLearningSnapshot | null> {
  const courses = await fetchCourses(userId);

  if (courses.length === 0) {
    return null;
  }

  const ccnaCourse =
    courses.find((course) => course.slug === "ccna-200-301-preparation") ??
    courses[0];
  const detailedCourse = await fetchCourseDetail(userId, ccnaCourse.slug);

  return {
    courseTitle: ccnaCourse.title,
    courseSlug: ccnaCourse.slug,
    certificationName: ccnaCourse.certificationName,
    totalModules: ccnaCourse.moduleCount,
    totalLessons: ccnaCourse.lessonCount,
    completedLessons: ccnaCourse.completedLessons,
    progressPercentage: ccnaCourse.progressPercentage,
    estimatedMinutesTotal: detailedCourse?.estimatedMinutesTotal ?? 0,
    continueLesson: detailedCourse?.continueLesson ?? null
  };
}
