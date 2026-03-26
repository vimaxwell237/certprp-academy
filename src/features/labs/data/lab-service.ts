import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DashboardLabSnapshot,
  LabDetail,
  LabFilterOptions,
  LabListItem,
  LabStatus,
  RelatedLabSummary
} from "@/types/lab";

type ServiceSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServiceRoleSupabaseClient>>
>;
type DashboardSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;
type ReadSupabaseClient = ServiceSupabaseClient | DashboardSupabaseClient;

type RelationValue<T> = T | T[] | null;

const LAB_FILES_BUCKET = "lab-files";

type ProgressEntry = {
  status: LabStatus;
  completedAt: string | null;
  updatedAt: string;
};

type RawLabFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: "packet_tracer" | "guide" | "topology" | "solution" | "reference";
  sort_order: number;
};

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

type RawLabRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  objectives?: string;
  instructions?: string;
  topology_notes?: string | null;
  expected_outcomes?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  module: RelationValue<RawModuleRef>;
  lesson: RelationValue<RawLessonRef>;
  files?: RawLabFile[] | null;
};

type RawLabProgressRow = {
  lab_id: string;
  status: LabStatus;
  completed_at: string | null;
  updated_at: string;
  lab?: RelationValue<{
    title: string;
    slug: string;
  }>;
};

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getReadSupabaseClient() {
  if (hasSupabaseServiceRoleEnv()) {
    return createServiceRoleSupabaseClient();
  }

  return createServerSupabaseClient();
}

async function fetchPublishedLabs(
  client: ReadSupabaseClient,
  includeFiles: boolean
) {
  const { data, error } = includeFiles
    ? await client
        .from("labs")
        .select(
          "id,title,slug,summary,objectives,instructions,topology_notes,expected_outcomes,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug),files:lab_files(id,file_name,file_path,file_type,sort_order)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await client
        .from("labs")
        .select(
          "id,title,slug,summary,objectives,instructions,topology_notes,expected_outcomes,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug)"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch labs: ${error.message}`);
  }

  return (data as RawLabRow[] | null) ?? [];
}

async function fetchLabProgressMap(
  userId: string,
  labIds: string[],
  client?: ReadSupabaseClient
) {
  if (labIds.length === 0) {
    return new Map<string, ProgressEntry>();
  }

  const supabase = client ?? (await getReadSupabaseClient());

  if (!supabase) {
    return new Map<string, ProgressEntry>();
  }

  const { data, error } = await supabase
    .from("lab_progress")
    .select("lab_id,status,completed_at,updated_at")
    .eq("user_id", userId)
    .in("lab_id", labIds);

  if (error) {
    throw new Error(`Failed to fetch lab progress: ${error.message}`);
  }

  return new Map(
    (((data as RawLabProgressRow[] | null) ?? []).map((entry) => [
      entry.lab_id,
      {
        status: entry.status,
        completedAt: entry.completed_at,
        updatedAt: entry.updated_at
      }
    ]) as Array<[string, ProgressEntry]>)
  );
}

function mapLabListItem(
  lab: RawLabRow,
  progressMap: Map<string, ProgressEntry>
): LabListItem {
  const moduleRef = relationFirst(lab.module);
  const lessonRef = relationFirst(lab.lesson);
  const progress = progressMap.get(lab.id);

  return {
    id: lab.id,
    title: lab.title,
    slug: lab.slug,
    summary: lab.summary,
    difficulty: lab.difficulty,
    estimatedMinutes: lab.estimated_minutes,
    moduleTitle: moduleRef?.title ?? "Module",
    moduleSlug: moduleRef?.slug ?? "",
    lessonTitle: lessonRef?.title ?? null,
    lessonSlug: lessonRef?.slug ?? null,
    status: progress?.status ?? "not_started",
    fileCount: (lab.files ?? []).length
  };
}

export async function fetchLabCatalog(
  userId: string,
  filters?: {
    moduleSlug?: string | null;
    difficulty?: string | null;
  }
): Promise<{
  labs: LabListItem[];
  filterOptions: LabFilterOptions;
}> {
  const supabase = await getReadSupabaseClient();
  const canReadFiles = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return {
      labs: [],
      filterOptions: {
        modules: [],
        difficulties: ["beginner", "intermediate", "advanced"]
      }
    };
  }

  const rawLabs = await fetchPublishedLabs(supabase, canReadFiles);
  const progressMap = await fetchLabProgressMap(
    userId,
    rawLabs.map((lab) => lab.id),
    supabase
  );
  const labs = rawLabs.map((lab) => mapLabListItem(lab, progressMap));
  const moduleMap = new Map(
    labs.map((lab) => [lab.moduleSlug, { slug: lab.moduleSlug, title: lab.moduleTitle }])
  );

  return {
    labs: labs.filter((lab) => {
      const matchesModule = filters?.moduleSlug ? lab.moduleSlug === filters.moduleSlug : true;
      const matchesDifficulty = filters?.difficulty
        ? lab.difficulty === filters.difficulty
        : true;

      return matchesModule && matchesDifficulty;
    }),
    filterOptions: {
      modules: Array.from(moduleMap.values()).sort((a, b) => a.title.localeCompare(b.title)),
      difficulties: ["beginner", "intermediate", "advanced"]
    }
  };
}

async function createSignedLabFileUrl(
  client: ServiceSupabaseClient,
  filePath: string
) {
  const { data, error } = await client.storage
    .from(LAB_FILES_BUCKET)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl ?? null;
}

export async function fetchLabDetail(
  userId: string,
  labSlug: string
): Promise<LabDetail | null> {
  const supabase = await getReadSupabaseClient();
  const canReadFiles = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return null;
  }

  const { data, error } = canReadFiles
    ? await supabase
        .from("labs")
        .select(
          "id,title,slug,summary,objectives,instructions,topology_notes,expected_outcomes,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug),files:lab_files(id,file_name,file_path,file_type,sort_order)"
        )
        .eq("slug", labSlug)
        .eq("is_published", true)
        .maybeSingle()
    : await supabase
        .from("labs")
        .select(
          "id,title,slug,summary,objectives,instructions,topology_notes,expected_outcomes,difficulty,estimated_minutes,module:modules(id,title,slug,course:courses(title,slug)),lesson:lessons(id,title,slug)"
        )
        .eq("slug", labSlug)
        .eq("is_published", true)
        .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lab detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const lab = data as RawLabRow;
  const moduleRef = relationFirst(lab.module);
  const courseRef = relationFirst(moduleRef?.course);
  const lessonRef = relationFirst(lab.lesson);
  const progressMap = await fetchLabProgressMap(userId, [lab.id], supabase);
  const progress = progressMap.get(lab.id);

  const files = canReadFiles
    ? await Promise.all(
        [...(lab.files ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(async (file) => {
            const downloadUrl = await createSignedLabFileUrl(
              supabase as ServiceSupabaseClient,
              file.file_path
            );

            return {
              id: file.id,
              fileName: file.file_name,
              filePath: file.file_path,
              fileType: file.file_type,
              sortOrder: file.sort_order,
              downloadUrl,
              isAvailable: downloadUrl !== null
            };
          })
      )
    : [];

  return {
    id: lab.id,
    title: lab.title,
    slug: lab.slug,
    summary: lab.summary,
    objectives: lab.objectives ?? "",
    instructions: lab.instructions ?? "",
    topologyNotes: lab.topology_notes ?? null,
    expectedOutcomes: lab.expected_outcomes ?? "",
    difficulty: lab.difficulty,
    estimatedMinutes: lab.estimated_minutes,
    moduleTitle: moduleRef?.title ?? "Module",
    moduleSlug: moduleRef?.slug ?? "",
    courseTitle: courseRef?.title ?? "Course",
    courseSlug: courseRef?.slug ?? "",
    lessonTitle: lessonRef?.title ?? null,
    lessonSlug: lessonRef?.slug ?? null,
    status: progress?.status ?? "not_started",
    completedAt: progress?.completedAt ?? null,
    files
  };
}

export async function upsertLabProgress(
  userId: string,
  input: {
    labId: string;
    status: LabStatus;
  }
) {
  const supabase = await getReadSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const completedAt =
    input.status === "completed" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("lab_progress")
    .upsert(
      {
        user_id: userId,
        lab_id: input.labId,
        status: input.status,
        completed_at: completedAt
      },
      {
        onConflict: "user_id,lab_id"
      }
    );

  if (error) {
    throw new Error(`Failed to update lab progress: ${error.message}`);
  }
}

export async function fetchModuleLabIndex(
  userId: string,
  moduleIds: string[]
): Promise<Record<string, RelatedLabSummary[]>> {
  const supabase = await getReadSupabaseClient();
  const canReadFiles = hasSupabaseServiceRoleEnv();

  if (!supabase || moduleIds.length === 0) {
    return {};
  }

  const { data, error } = canReadFiles
    ? await supabase
        .from("labs")
        .select("id,title,slug,difficulty,estimated_minutes,module_id,files:lab_files(id)")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("labs")
        .select("id,title,slug,difficulty,estimated_minutes,module_id")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch related labs: ${error.message}`);
  }

  const labs =
    ((data as Array<{
      id: string;
      title: string;
      slug: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      estimated_minutes: number;
      module_id: string;
      files: Array<{ id: string }> | null;
    }> | null) ?? []);
  const progressMap = await fetchLabProgressMap(
    userId,
    labs.map((lab) => lab.id),
    supabase
  );

  return labs.reduce<Record<string, RelatedLabSummary[]>>((acc, lab) => {
    const existing = acc[lab.module_id] ?? [];
    const progress = progressMap.get(lab.id);

    existing.push({
      id: lab.id,
      title: lab.title,
      slug: lab.slug,
      difficulty: lab.difficulty,
      estimatedMinutes: lab.estimated_minutes,
      status: progress?.status ?? "not_started",
      fileCount: (lab.files ?? []).length
    });
    acc[lab.module_id] = existing;

    return acc;
  }, {});
}

export async function fetchRelatedLabsForLessonContext(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<RelatedLabSummary[]> {
  const supabase = await getReadSupabaseClient();
  const canReadFiles = hasSupabaseServiceRoleEnv();

  if (!supabase) {
    return [];
  }

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError) {
    throw new Error(`Failed to resolve lesson lab course: ${courseError.message}`);
  }

  if (!courseData) {
    return [];
  }

  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseData.id as string)
    .eq("slug", moduleSlug)
    .maybeSingle();

  if (moduleError) {
    throw new Error(`Failed to resolve lesson lab module: ${moduleError.message}`);
  }

  if (!moduleData) {
    return [];
  }

  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleData.id as string)
    .eq("slug", lessonSlug)
    .maybeSingle();

  if (lessonError) {
    throw new Error(`Failed to resolve lesson lab lesson: ${lessonError.message}`);
  }

  const { data, error } = canReadFiles
    ? await supabase
        .from("labs")
        .select("id,title,slug,difficulty,estimated_minutes,lesson_id,module_id,files:lab_files(id)")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .order("created_at", { ascending: true })
    : await supabase
        .from("labs")
        .select("id,title,slug,difficulty,estimated_minutes,lesson_id,module_id")
        .eq("module_id", moduleData.id as string)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch related lesson labs: ${error.message}`);
  }

  const labs =
    ((data as Array<{
      id: string;
      title: string;
      slug: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      estimated_minutes: number;
      lesson_id: string | null;
      module_id: string;
      files: Array<{ id: string }> | null;
    }> | null) ?? []).sort((a, b) => {
      const aScore = a.lesson_id && a.lesson_id === (lessonData?.id as string | undefined) ? 0 : 1;
      const bScore = b.lesson_id && b.lesson_id === (lessonData?.id as string | undefined) ? 0 : 1;

      return aScore - bScore;
    });
  const progressMap = await fetchLabProgressMap(
    userId,
    labs.map((lab) => lab.id),
    supabase
  );

  return labs.map((lab) => {
    const progress = progressMap.get(lab.id);

    return {
      id: lab.id,
      title: lab.title,
      slug: lab.slug,
      difficulty: lab.difficulty,
      estimatedMinutes: lab.estimated_minutes,
      status: progress?.status ?? "not_started",
      fileCount: (lab.files ?? []).length
    };
  });
}

export async function fetchDashboardLabSnapshot(
  userId: string
): Promise<DashboardLabSnapshot | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("labs")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (countError) {
    throw new Error(`Failed to count labs: ${countError.message}`);
  }

  const { data, error } = await supabase
    .from("lab_progress")
    .select("lab_id,status,completed_at,updated_at,lab:labs(title,slug)")
    .eq("user_id", userId)
    .neq("status", "not_started")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch lab dashboard snapshot: ${error.message}`);
  }

  const progressRows = (data as RawLabProgressRow[] | null) ?? [];
  const started = progressRows.filter((row) => row.status === "in_progress").length;
  const completed = progressRows.filter((row) => row.status === "completed").length;
  const latest = progressRows[0];
  const latestLab = relationFirst(latest?.lab);

  return {
    totalLabsAvailable: count ?? 0,
    labsStarted: started,
    labsCompleted: completed,
    latestActivity:
      latest && latestLab
        ? {
            id: latest.lab_id,
            title: latestLab.title,
            slug: latestLab.slug,
            status: latest.status,
            updatedAt: latest.updated_at
          }
        : null
  };
}
