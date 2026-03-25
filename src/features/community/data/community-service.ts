import { createServerSupabaseClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type {
  CommunityAuthorRole,
  CommunityContextSummary,
  CommunityCreateFormData,
  CommunityOverviewData,
  CommunityPostDetail,
  CommunityPostListItem,
  CommunityTopic,
  DashboardCommunitySnapshot
} from "@/types/community";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type RelationValue<T> = T | T[] | null;

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

type RawCommunityReply = {
  id: string;
  author_user_id: string;
  author_display_name: string;
  author_role: CommunityAuthorRole;
  message_body: string;
  created_at: string;
};

type RawCommunityPost = {
  id: string;
  author_user_id: string;
  author_display_name: string;
  author_role: CommunityAuthorRole;
  subject: string;
  topic: CommunityTopic;
  message_body: string;
  lesson: RelationValue<RawLessonContext>;
  created_at: string;
  updated_at: string;
  replies: RawCommunityReply[] | null;
};

const COMMUNITY_SUBJECT_MAX_LENGTH = 160;
const COMMUNITY_MESSAGE_MAX_LENGTH = 4_000;

function relationFirst<T>(value: RelationValue<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

function clipMessagePreview(messageBody: string) {
  const normalized = messageBody.trim().replace(/\s+/g, " ");

  return normalized.length > 180
    ? `${normalized.slice(0, 177)}...`
    : normalized;
}

function buildCommunityContexts(post: {
  lesson: RelationValue<RawLessonContext>;
}): CommunityContextSummary[] {
  const contexts: CommunityContextSummary[] = [];
  const lesson = relationFirst(post.lesson);
  const lessonModule = relationFirst(lesson?.module);
  const lessonCourse = relationFirst(lessonModule?.course);

  if (lesson && lessonModule && lessonCourse) {
    contexts.push({
      type: "lesson",
      label: `Lesson: ${lesson.title}`,
      href: `${APP_ROUTES.courses}/${lessonCourse.slug}/${lessonModule.slug}/${lesson.slug}`
    });
  }

  return contexts;
}

function mapCommunityPostListItem(post: RawCommunityPost): CommunityPostListItem {
  const replies = [...(post.replies ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  return {
    id: post.id,
    subject: post.subject,
    topic: post.topic,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    authorDisplayName: post.author_display_name,
    authorRole: post.author_role,
    replyCount: replies.length,
    excerpt: clipMessagePreview(post.message_body),
    contexts: buildCommunityContexts(post)
  };
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isCommunityTopic(value: string): value is CommunityTopic {
  return [
    "general",
    "lesson_help",
    "subnetting",
    "routing",
    "switching",
    "wireless",
    "labs"
  ].includes(value);
}

async function resolveLessonContextInput(
  client: ServerSupabaseClient,
  lessonId?: string
) {
  const contextPreview: CommunityContextSummary[] = [];
  const invalidContextReasons: string[] = [];
  let resolvedLessonId = "";

  if (!lessonId) {
    return {
      contextPreview,
      invalidContextReasons,
      resolvedLessonId
    };
  }

  const { data, error } = await client
    .from("lessons")
    .select("id,title,slug,module:modules(slug,course:courses(slug))")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to validate community lesson context: ${error.message}`);
  }

  const lesson = (data as RawLessonContext | null) ?? null;
  const lessonModule = relationFirst(lesson?.module);
  const lessonCourse = relationFirst(lessonModule?.course);

  if (!lesson || !lessonModule || !lessonCourse) {
    invalidContextReasons.push("The linked lesson could not be resolved.");
  } else {
    resolvedLessonId = lesson.id;
    contextPreview.push({
      type: "lesson",
      label: `Lesson: ${lesson.title}`,
      href: `${APP_ROUTES.courses}/${lessonCourse.slug}/${lessonModule.slug}/${lesson.slug}`
    });
  }

  return {
    contextPreview,
    invalidContextReasons,
    resolvedLessonId
  };
}

async function resolveCommunityAuthorIdentity(
  client: ServerSupabaseClient,
  userId: string,
  email: string | null | undefined
) {
  const { data, error } = await client
    .from("tutor_profiles")
    .select("display_name")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve community author identity: ${error.message}`);
  }

  if (data?.display_name) {
    return {
      displayName: data.display_name as string,
      authorRole: "tutor" as const
    };
  }

  const localPart = (email ?? "")
    .split("@")[0]
    ?.trim()
    .replace(/[._-]+/g, " ")
    .trim();
  const displayName = localPart
    ? localPart
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Learner";

  return {
    displayName,
    authorRole: "learner" as const
  };
}

async function fetchVisibleCommunityPosts(client: ServerSupabaseClient) {
  const { data, error } = await client
    .from("community_posts")
    .select(
      "id,author_user_id,author_display_name,author_role,subject,topic,message_body,created_at,updated_at,lesson:lessons(id,title,slug,module:modules(slug,course:courses(slug))),replies:community_replies(id,author_user_id,author_display_name,author_role,message_body,created_at)"
    )
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch community posts: ${error.message}`);
  }

  return (data as RawCommunityPost[] | null) ?? [];
}

async function resolveCommunityPostById(
  postId: string,
  client: ServerSupabaseClient
) {
  const { data, error } = await client
    .from("community_posts")
    .select(
      "id,author_user_id,author_display_name,author_role,subject,topic,message_body,created_at,updated_at,lesson:lessons(id,title,slug,module:modules(slug,course:courses(slug))),replies:community_replies(id,author_user_id,author_display_name,author_role,message_body,created_at)"
    )
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch community post detail: ${error.message}`);
  }

  return (data as RawCommunityPost | null) ?? null;
}

export async function fetchCommunityCreateFormData(
  searchParams: Record<string, string | string[] | undefined>
): Promise<CommunityCreateFormData> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      contextPreview: [],
      invalidContextReasons: [],
      initialValues: {
        subject: "",
        topic: "general",
        lessonId: "",
        messageBody: ""
      }
    };
  }

  const initialTopic = readSearchParam(searchParams, "topic");
  const resolvedContext = await resolveLessonContextInput(
    supabase,
    readSearchParam(searchParams, "lessonId")
  );

  return {
    contextPreview: resolvedContext.contextPreview,
    invalidContextReasons: resolvedContext.invalidContextReasons,
    initialValues: {
      subject: readSearchParam(searchParams, "subject"),
      topic: isCommunityTopic(initialTopic) ? initialTopic : "general",
      lessonId: resolvedContext.resolvedLessonId,
      messageBody: readSearchParam(searchParams, "messageBody")
    }
  };
}

export async function fetchCommunityOverview(
  searchParams: Record<string, string | string[] | undefined>
): Promise<CommunityOverviewData> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      featuredPost: null,
      recentPosts: [],
      createForm: {
        contextPreview: [],
        invalidContextReasons: [],
        initialValues: {
          subject: "",
          topic: "general",
          lessonId: "",
          messageBody: ""
        }
      }
    };
  }

  const [posts, createForm] = await Promise.all([
    fetchVisibleCommunityPosts(supabase),
    fetchCommunityCreateFormData(searchParams)
  ]);

  const mappedPosts = posts.map(mapCommunityPostListItem);

  return {
    featuredPost: mappedPosts[0] ?? null,
    recentPosts: mappedPosts,
    createForm
  };
}

export async function fetchCommunityPostDetail(
  userId: string,
  postId: string
): Promise<CommunityPostDetail | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const post = await resolveCommunityPostById(postId, supabase);

  if (!post) {
    return null;
  }

  return {
    id: post.id,
    subject: post.subject,
    topic: post.topic,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    authorUserId: post.author_user_id,
    authorDisplayName: post.author_display_name,
    authorRole: post.author_role,
    messageBody: post.message_body,
    canReply: true,
    contexts: buildCommunityContexts(post),
    replies: [...(post.replies ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((reply) => ({
        id: reply.id,
        authorUserId: reply.author_user_id,
        authorDisplayName:
          reply.author_user_id === userId ? "You" : reply.author_display_name,
        authorRole: reply.author_user_id === userId ? "self" : reply.author_role,
        messageBody: reply.message_body,
        createdAt: reply.created_at
      }))
  };
}

export async function createCommunityPost(
  userId: string,
  email: string | null | undefined,
  input: {
    subject: string;
    topic: CommunityTopic;
    lessonId?: string;
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
    throw new Error("Community post subject is required.");
  }

  if (subject.length > COMMUNITY_SUBJECT_MAX_LENGTH) {
    throw new Error(
      `Community post subject must be ${COMMUNITY_SUBJECT_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!messageBody) {
    throw new Error("Community post message is required.");
  }

  if (messageBody.length > COMMUNITY_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Community post message must be ${COMMUNITY_MESSAGE_MAX_LENGTH} characters or fewer.`
    );
  }

  if (!isCommunityTopic(input.topic)) {
    throw new Error("Community post topic is invalid.");
  }

  const [authorIdentity, resolvedContext] = await Promise.all([
    resolveCommunityAuthorIdentity(supabase, userId, email),
    resolveLessonContextInput(supabase, input.lessonId)
  ]);

  if (resolvedContext.invalidContextReasons.length > 0) {
    throw new Error(resolvedContext.invalidContextReasons[0]);
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_user_id: userId,
      author_display_name: authorIdentity.displayName,
      author_role: authorIdentity.authorRole,
      subject,
      topic: input.topic,
      message_body: messageBody,
      lesson_id: resolvedContext.resolvedLessonId || null
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create community post: ${error.message}`);
  }

  return {
    postId: data.id as string
  };
}

export async function postCommunityReply(
  userId: string,
  email: string | null | undefined,
  input: {
    postId: string;
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

  if (messageBody.length > COMMUNITY_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Reply message must be ${COMMUNITY_MESSAGE_MAX_LENGTH} characters or fewer.`
    );
  }

  const [post, authorIdentity] = await Promise.all([
    resolveCommunityPostById(input.postId, supabase),
    resolveCommunityAuthorIdentity(supabase, userId, email)
  ]);

  if (!post) {
    throw new Error("Community post was not found.");
  }

  const { error } = await supabase
    .from("community_replies")
    .insert({
      community_post_id: input.postId,
      author_user_id: userId,
      author_display_name: authorIdentity.displayName,
      author_role: authorIdentity.authorRole,
      message_body: messageBody
    });

  if (error) {
    throw new Error(`Failed to post community reply: ${error.message}`);
  }
}

export async function fetchDashboardCommunitySnapshot(
  userId: string
): Promise<DashboardCommunitySnapshot | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [totalPostsResult, yourPostsResult, yourRepliesResult, latestPostResult] =
    await Promise.all([
      supabase.from("community_posts").select("id", { count: "exact", head: true }),
      supabase
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_user_id", userId),
      supabase
        .from("community_replies")
        .select("id", { count: "exact", head: true })
        .eq("author_user_id", userId),
      supabase
        .from("community_posts")
        .select("id,subject,updated_at,replies:community_replies(id)")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  if (totalPostsResult.error) {
    throw new Error(`Failed to fetch community post count: ${totalPostsResult.error.message}`);
  }

  if (yourPostsResult.error) {
    throw new Error(`Failed to fetch learner community posts: ${yourPostsResult.error.message}`);
  }

  if (yourRepliesResult.error) {
    throw new Error(
      `Failed to fetch learner community replies: ${yourRepliesResult.error.message}`
    );
  }

  if (latestPostResult.error) {
    throw new Error(`Failed to fetch latest community activity: ${latestPostResult.error.message}`);
  }

  const latestPost =
    latestPostResult.data &&
    typeof latestPostResult.data === "object" &&
    "id" in latestPostResult.data
      ? {
          id: latestPostResult.data.id as string,
          subject: latestPostResult.data.subject as string,
          updatedAt: latestPostResult.data.updated_at as string,
          replyCount: Array.isArray(latestPostResult.data.replies)
            ? latestPostResult.data.replies.length
            : 0
        }
      : null;

  return {
    totalPosts: totalPostsResult.count ?? 0,
    yourPostsCount: yourPostsResult.count ?? 0,
    yourRepliesCount: yourRepliesResult.count ?? 0,
    latestPost
  };
}
