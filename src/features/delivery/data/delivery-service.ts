import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { buildNotificationEmailTemplate } from "@/features/delivery/lib/email-templates";
import { getEmailProvider } from "@/features/delivery/lib/provider";
import { buildNextRetryAt, canRetry } from "@/features/delivery/lib/retry";
import type {
  DashboardDeliverySnapshot,
  NotificationDeliverySummary,
  NotificationTemplateKey,
  SessionReminderState
} from "@/types/delivery";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type AdminSupabaseClient = ReturnType<typeof createServiceRoleSupabaseClient>;

type DeliveryClient = ServerSupabaseClient | AdminSupabaseClient;

type ScheduledJobRow = {
  id: string;
  user_id: string;
  job_type: string;
  related_entity_type: string;
  related_entity_id: string;
  scheduled_for: string;
  status: string;
  payload: { reminder_kind?: string } | null;
  dedupe_key: string | null;
  retry_count: number;
  max_retries: number;
  last_attempted_at: string | null;
};

type NotificationDeliveryClaimRow = {
  id: string;
  notification_id: string | null;
  user_id: string;
  channel: "email";
  template_key: NotificationTemplateKey;
  status: "pending" | "sent" | "failed";
  external_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  retry_count: number;
  max_retries: number;
  last_attempted_at: string | null;
  next_attempt_at: string;
};

type NotificationDeliveryRow = NotificationDeliveryClaimRow & {
  notification: Array<{
    id: string;
    type: NotificationTemplateKey;
    title: string;
    message: string;
    link_url: string | null;
    related_entity_type: string | null;
    related_entity_id: string | null;
  }> | null;
};

type SessionContextRow = {
  id: string;
  learner_user_id: string;
  subject: string;
  category: string;
  meeting_link: string | null;
  scheduled_starts_at: string;
  scheduled_ends_at: string;
  status: string;
  tutor: Array<{
    display_name: string;
    user_id: string;
  }> | null;
};

type ProcessSummary = {
  claimed: number;
  processed: number;
  retried: number;
  failed: number;
  canceled: number;
};

function emptyProcessSummary(): ProcessSummary {
  return {
    claimed: 0,
    processed: 0,
    retried: 0,
    failed: 0,
    canceled: 0
  };
}

function mapDelivery(row: NotificationDeliveryRow): NotificationDeliverySummary {
  return {
    id: row.id,
    channel: row.channel,
    templateKey: row.template_key,
    status: row.status,
    sentAt: row.sent_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    retryCount: row.retry_count,
    maxRetries: row.max_retries,
    lastAttemptedAt: row.last_attempted_at
  };
}

function getLinkedNotification(row: NotificationDeliveryRow) {
  return row.notification?.[0] ?? null;
}

async function getSupabaseClient(): Promise<ServerSupabaseClient> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

async function fetchCurrentUserEmail(
  supabase: ServerSupabaseClient,
  userId: string
) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed to resolve the signed-in user email: ${error.message}`);
  }

  if (!user || user.id !== userId || !user.email) {
    return null;
  }

  return user.email;
}

async function fetchUserEmailForAutomation(
  supabase: AdminSupabaseClient,
  userId: string
) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(`Failed to resolve the delivery target email: ${error.message}`);
  }

  return data.user.email ?? null;
}

async function fetchSessionContext(
  supabase: DeliveryClient,
  sessionId: string
) {
  const { data, error } = await supabase
    .from("tutor_sessions")
    .select(
      "id,learner_user_id,subject,category,meeting_link,scheduled_starts_at,scheduled_ends_at,status,tutor:tutor_profiles(display_name,user_id)"
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load tutor session delivery context: ${error.message}`);
  }

  return (data as SessionContextRow | null) ?? null;
}

function buildReminderNotification(job: ScheduledJobRow, session: SessionContextRow, userId: string) {
  const isLearner = session.learner_user_id === userId;
  const reminderKind = job.job_type === "session_reminder_24h" ? "within 24 hours" : "soon";

  return {
    user_id: userId,
    type: "session_reminder" as const,
    title: isLearner ? "Upcoming tutor session" : "Upcoming tutor commitment",
    message: isLearner
      ? `Your confirmed session "${session.subject}" starts ${reminderKind}.`
      : `Your confirmed tutor session "${session.subject}" starts ${reminderKind}.`,
    link_url: isLearner ? APP_ROUTES.sessions : APP_ROUTES.tutorSessions,
    dedupe_key: job.dedupe_key,
    related_entity_type: "tutor_session",
    related_entity_id: session.id,
    is_read: false
  };
}

async function completeScheduledJob(supabase: DeliveryClient, jobId: string) {
  const { error } = await supabase
    .from("scheduled_jobs")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
      error_message: null,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Failed to finalize the scheduled job: ${error.message}`);
  }
}

async function cancelScheduledJob(
  supabase: DeliveryClient,
  jobId: string,
  reason: string
) {
  const { error } = await supabase
    .from("scheduled_jobs")
    .update({
      status: "canceled",
      processed_at: new Date().toISOString(),
      error_message: reason,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(`Failed to cancel the scheduled job: ${error.message}`);
  }
}

async function retryOrFailScheduledJob(
  supabase: DeliveryClient,
  job: ScheduledJobRow,
  reason: string
) {
  if (canRetry(job.retry_count, job.max_retries)) {
    const nextRetryCount = job.retry_count + 1;
    const { error } = await supabase
      .from("scheduled_jobs")
      .update({
        status: "pending",
        retry_count: nextRetryCount,
        scheduled_for: buildNextRetryAt(nextRetryCount),
        error_message: reason,
        processing_started_at: null,
        processing_token: null
      })
      .eq("id", job.id);

    if (error) {
      throw new Error(`Failed to reschedule the scheduled job retry: ${error.message}`);
    }

    return "retried" as const;
  }

  const { error } = await supabase
    .from("scheduled_jobs")
    .update({
      status: "failed",
      processed_at: new Date().toISOString(),
      error_message: reason,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(`Failed to mark the scheduled job as permanently failed: ${error.message}`);
  }

  return "failed" as const;
}

async function completeDelivery(
  supabase: DeliveryClient,
  deliveryId: string,
  externalMessageId: string | null
) {
  const { error } = await supabase
    .from("notification_deliveries")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      external_message_id: externalMessageId,
      error_message: null,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", deliveryId);

  if (error) {
    throw new Error(`Failed to mark the notification delivery as sent: ${error.message}`);
  }
}

async function retryOrFailDelivery(
  supabase: DeliveryClient,
  delivery: NotificationDeliveryClaimRow,
  reason: string,
  retryable: boolean
) {
  if (retryable && canRetry(delivery.retry_count, delivery.max_retries)) {
    const nextRetryCount = delivery.retry_count + 1;
    const { error } = await supabase
      .from("notification_deliveries")
      .update({
        status: "pending",
        retry_count: nextRetryCount,
        next_attempt_at: buildNextRetryAt(nextRetryCount),
        error_message: reason,
        processing_started_at: null,
        processing_token: null
      })
      .eq("id", delivery.id);

    if (error) {
      throw new Error(`Failed to reschedule the notification delivery retry: ${error.message}`);
    }

    return "retried" as const;
  }

  const { error } = await supabase
    .from("notification_deliveries")
    .update({
      status: "failed",
      error_message: reason,
      processing_started_at: null,
      processing_token: null
    })
    .eq("id", delivery.id);

  if (error) {
    throw new Error(`Failed to mark the notification delivery as permanently failed: ${error.message}`);
  }

  return "failed" as const;
}

async function fetchClaimedScheduledJobs(
  supabase: DeliveryClient,
  userId: string | null,
  limit: number
) {
  const { data, error } = await supabase.rpc("claim_due_scheduled_jobs", {
    target_user_id: userId,
    target_limit: limit,
    stale_after_minutes: 10
  });

  if (error) {
    throw new Error(`Failed to claim scheduled jobs: ${error.message}`);
  }

  return (data as ScheduledJobRow[] | null) ?? [];
}

async function fetchClaimedNotificationDeliveries(
  supabase: DeliveryClient,
  userId: string | null,
  limit: number
) {
  const { data, error } = await supabase.rpc("claim_due_notification_deliveries", {
    target_user_id: userId,
    target_limit: limit,
    stale_after_minutes: 10
  });

  if (error) {
    throw new Error(`Failed to claim pending notification deliveries: ${error.message}`);
  }

  return (data as NotificationDeliveryClaimRow[] | null) ?? [];
}

async function fetchDeliveryRowsById(
  supabase: DeliveryClient,
  deliveryIds: string[]
) {
  if (deliveryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("notification_deliveries")
    .select(
      "id,notification_id,user_id,channel,template_key,status,external_message_id,error_message,sent_at,created_at,retry_count,max_retries,last_attempted_at,next_attempt_at,notification:notifications(id,type,title,message,link_url,related_entity_type,related_entity_id)"
    )
    .in("id", deliveryIds);

  if (error) {
    throw new Error(`Failed to load claimed notification delivery rows: ${error.message}`);
  }

  return (data as NotificationDeliveryRow[] | null) ?? [];
}

async function processScheduledJobsWithClient(
  supabase: DeliveryClient,
  input: {
    userId: string | null;
    limit: number;
  }
) {
  const summary = emptyProcessSummary();
  const claimedJobs = await fetchClaimedScheduledJobs(
    supabase,
    input.userId,
    input.limit
  );

  summary.claimed = claimedJobs.length;

  for (const job of claimedJobs) {
    try {
      if (job.related_entity_type !== "tutor_session") {
        const outcome = await retryOrFailScheduledJob(
          supabase,
          job,
          "Unsupported reminder target."
        );
        summary[outcome] += 1;
        continue;
      }

      const session = await fetchSessionContext(supabase, job.related_entity_id);

      if (!session || session.status !== "confirmed") {
        await cancelScheduledJob(supabase, job.id, "Session is no longer confirmed.");
        summary.canceled += 1;
        continue;
      }

      if (new Date(session.scheduled_ends_at).getTime() <= Date.now()) {
        await cancelScheduledJob(supabase, job.id, "Session has already ended.");
        summary.canceled += 1;
        continue;
      }

      const reminder = buildReminderNotification(job, session, job.user_id);
      const { error: insertError } = await supabase.from("notifications").upsert(reminder, {
        onConflict: "dedupe_key",
        ignoreDuplicates: true
      });

      if (insertError) {
        const outcome = await retryOrFailScheduledJob(supabase, job, insertError.message);
        summary[outcome] += 1;
        continue;
      }

      await completeScheduledJob(supabase, job.id);
      summary.processed += 1;
    } catch (jobError) {
      const outcome = await retryOrFailScheduledJob(
        supabase,
        job,
        jobError instanceof Error ? jobError.message : "Unknown reminder processing error."
      );
      summary[outcome] += 1;
    }
  }

  return summary;
}

async function processNotificationDeliveriesWithClient(
  supabase: DeliveryClient,
  input: {
    userId: string | null;
    limit: number;
    resolveEmail: (userId: string) => Promise<string | null>;
  }
) {
  const summary = emptyProcessSummary();
  const claimedDeliveries = await fetchClaimedNotificationDeliveries(
    supabase,
    input.userId,
    input.limit
  );

  summary.claimed = claimedDeliveries.length;

  if (claimedDeliveries.length === 0) {
    return summary;
  }

  const deliveryRows = await fetchDeliveryRowsById(
    supabase,
    claimedDeliveries.map((delivery) => delivery.id)
  );
  const deliveryMap = new Map(deliveryRows.map((delivery) => [delivery.id, delivery]));
  const provider = getEmailProvider();

  for (const claimedDelivery of claimedDeliveries) {
    try {
      const delivery = deliveryMap.get(claimedDelivery.id);

      if (!delivery) {
        const outcome = await retryOrFailDelivery(
          supabase,
          claimedDelivery,
          "Notification delivery record could not be reloaded.",
          false
        );
        summary[outcome] += 1;
        continue;
      }

      const linkedNotification = getLinkedNotification(delivery);

      if (!linkedNotification) {
        const outcome = await retryOrFailDelivery(
          supabase,
          claimedDelivery,
          "Linked notification could not be loaded.",
          false
        );
        summary[outcome] += 1;
        continue;
      }

      const { data: preferenceData, error: preferenceError } = await supabase
        .from("notification_preferences")
        .select("is_enabled")
        .eq("user_id", delivery.user_id)
        .eq("channel", "email")
        .eq("notification_type", delivery.template_key)
        .maybeSingle();

      if (preferenceError) {
        const outcome = await retryOrFailDelivery(
          supabase,
          claimedDelivery,
          preferenceError.message,
          true
        );
        summary[outcome] += 1;
        continue;
      }

      if (preferenceData && !preferenceData.is_enabled) {
        const outcome = await retryOrFailDelivery(
          supabase,
          claimedDelivery,
          "Email notifications are disabled for this event type.",
          false
        );
        summary[outcome] += 1;
        continue;
      }

      const emailAddress = await input.resolveEmail(delivery.user_id);

      if (!emailAddress) {
        const outcome = await retryOrFailDelivery(
          supabase,
          claimedDelivery,
          "No email address is available for this user.",
          false
        );
        summary[outcome] += 1;
        continue;
      }

      const session =
        linkedNotification.related_entity_type === "tutor_session" &&
        linkedNotification.related_entity_id
          ? await fetchSessionContext(supabase, linkedNotification.related_entity_id)
          : null;
      const template = buildNotificationEmailTemplate({
        to: emailAddress,
        templateKey: delivery.template_key,
        notificationTitle: linkedNotification.title,
        notificationMessage: linkedNotification.message,
        linkUrl: linkedNotification.link_url ?? APP_ROUTES.notifications,
        session: session
          ? {
              subject: session.subject,
              category: session.category,
              scheduledStartsAt: session.scheduled_starts_at,
              scheduledEndsAt: session.scheduled_ends_at,
              tutorDisplayName: session.tutor?.[0]?.display_name ?? null,
              meetingLink: session.meeting_link
            }
          : null
      });
      const result = await provider.send(template);

      if (result.status === "sent") {
        await completeDelivery(
          supabase,
          claimedDelivery.id,
          result.externalMessageId ?? null
        );
        summary.processed += 1;
        continue;
      }

      const outcome = await retryOrFailDelivery(
        supabase,
        claimedDelivery,
        result.errorMessage ?? "Unknown email delivery error.",
        result.retryable ?? true
      );
      summary[outcome] += 1;
    } catch (deliveryError) {
      const outcome = await retryOrFailDelivery(
        supabase,
        claimedDelivery,
        deliveryError instanceof Error
          ? deliveryError.message
          : "Unknown delivery processing error.",
        true
      );
      summary[outcome] += 1;
    }
  }

  return summary;
}

export async function processNotificationDeliveryPipeline(userId: string) {
  if (!hasSupabaseServiceRoleEnv()) {
    return {
      jobs: emptyProcessSummary(),
      deliveries: emptyProcessSummary()
    };
  }

  const supabase = createServiceRoleSupabaseClient();
  const jobSummary = await processScheduledJobsWithClient(supabase, {
    userId,
    limit: 10
  });
  const deliverySummary = await processNotificationDeliveriesWithClient(supabase, {
    userId,
    limit: 10,
    resolveEmail: (targetUserId) => fetchUserEmailForAutomation(supabase, targetUserId)
  });

  return {
    jobs: jobSummary,
    deliveries: deliverySummary
  };
}

export async function processScheduledJobsAutomation(limit = 25) {
  const supabase = createServiceRoleSupabaseClient();

  return processScheduledJobsWithClient(supabase, {
    userId: null,
    limit
  });
}

export async function processNotificationDeliveriesAutomation(limit = 25) {
  const supabase = createServiceRoleSupabaseClient();

  return processNotificationDeliveriesWithClient(supabase, {
    userId: null,
    limit,
    resolveEmail: (targetUserId) => fetchUserEmailForAutomation(supabase, targetUserId)
  });
}

export async function fetchSessionReminderStateMap(
  userId: string,
  sessionIds: string[]
): Promise<Map<string, SessionReminderState>> {
  if (sessionIds.length === 0) {
    return new Map<string, SessionReminderState>();
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("scheduled_jobs")
    .select("related_entity_id,scheduled_for,retry_count")
    .eq("user_id", userId)
    .eq("status", "pending")
    .eq("related_entity_type", "tutor_session")
    .in("related_entity_id", sessionIds)
    .like("job_type", "session_reminder_%")
    .order("scheduled_for", { ascending: true });

  if (error) {
    throw new Error(`Failed to load reminder state: ${error.message}`);
  }

  const reminderStateMap = new Map<string, SessionReminderState>();

  for (const row of ((data as Array<{
    related_entity_id: string;
    scheduled_for: string;
    retry_count: number;
  }> | null) ?? [])) {
    const currentState = reminderStateMap.get(row.related_entity_id) ?? {
      pendingCount: 0,
      nextScheduledFor: null,
      retryCount: 0
    };

    reminderStateMap.set(row.related_entity_id, {
      pendingCount: currentState.pendingCount + 1,
      nextScheduledFor: currentState.nextScheduledFor ?? row.scheduled_for,
      retryCount: Math.max(currentState.retryCount, row.retry_count)
    });
  }

  return reminderStateMap;
}

export async function fetchDashboardDeliverySnapshot(
  userId: string
): Promise<DashboardDeliverySnapshot> {
  const supabase = await getSupabaseClient();
  const [reminderCountData, pendingDeliveryData, failedDeliveryData, latestDeliveryData] =
    await Promise.all([
      supabase
        .from("scheduled_jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "pending")
        .like("job_type", "session_reminder_%"),
      supabase
        .from("notification_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "pending"),
      supabase
        .from("notification_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "failed"),
      supabase
        .from("notification_deliveries")
        .select(
          "id,notification_id,user_id,channel,template_key,status,external_message_id,error_message,sent_at,created_at,retry_count,max_retries,last_attempted_at,next_attempt_at,notification:notifications(id,type,title,message,link_url,related_entity_type,related_entity_id)"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  if (reminderCountData.error) {
    throw new Error(`Failed to count reminder jobs: ${reminderCountData.error.message}`);
  }

  if (pendingDeliveryData.error) {
    throw new Error(`Failed to count pending deliveries: ${pendingDeliveryData.error.message}`);
  }

  if (failedDeliveryData.error) {
    throw new Error(`Failed to count failed deliveries: ${failedDeliveryData.error.message}`);
  }

  if (latestDeliveryData.error) {
    throw new Error(`Failed to load latest delivery state: ${latestDeliveryData.error.message}`);
  }

  return {
    pendingReminderCount: reminderCountData.count ?? 0,
    pendingDeliveryCount: pendingDeliveryData.count ?? 0,
    failedDeliveryCount: failedDeliveryData.count ?? 0,
    latestDelivery: latestDeliveryData.data
      ? mapDelivery(latestDeliveryData.data as NotificationDeliveryRow)
      : null
  };
}
