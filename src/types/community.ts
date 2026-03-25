export type CommunityTopic =
  | "general"
  | "lesson_help"
  | "subnetting"
  | "routing"
  | "switching"
  | "wireless"
  | "labs";

export type CommunityAuthorRole = "learner" | "tutor";

export interface CommunityContextSummary {
  type: "lesson";
  label: string;
  href: string | null;
}

export interface CommunityPostListItem {
  id: string;
  subject: string;
  topic: CommunityTopic;
  createdAt: string;
  updatedAt: string;
  authorDisplayName: string;
  authorRole: CommunityAuthorRole;
  replyCount: number;
  excerpt: string;
  contexts: CommunityContextSummary[];
}

export interface CommunityReplyItem {
  id: string;
  authorUserId: string;
  authorDisplayName: string;
  authorRole: CommunityAuthorRole | "self";
  messageBody: string;
  createdAt: string;
}

export interface CommunityPostDetail {
  id: string;
  subject: string;
  topic: CommunityTopic;
  createdAt: string;
  updatedAt: string;
  authorUserId: string;
  authorDisplayName: string;
  authorRole: CommunityAuthorRole;
  messageBody: string;
  canReply: boolean;
  contexts: CommunityContextSummary[];
  replies: CommunityReplyItem[];
}

export interface CommunityCreateFormData {
  contextPreview: CommunityContextSummary[];
  invalidContextReasons: string[];
  initialValues: {
    subject: string;
    topic: CommunityTopic;
    lessonId: string;
    messageBody: string;
  };
}

export interface CommunityOverviewData {
  featuredPost: CommunityPostListItem | null;
  recentPosts: CommunityPostListItem[];
  createForm: CommunityCreateFormData;
}

export interface DashboardCommunitySnapshot {
  totalPosts: number;
  yourPostsCount: number;
  yourRepliesCount: number;
  latestPost: {
    id: string;
    subject: string;
    updatedAt: string;
    replyCount: number;
  } | null;
}
