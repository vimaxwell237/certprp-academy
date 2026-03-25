import { fetchSessionReminderStateMap } from "@/features/delivery/data/delivery-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupportCategory, TutorProfileSummary } from "@/types/support";
import type {
  BookingSupportContext,
  DashboardSchedulingSnapshot,
  LearnerSessionsOverview,
  TutorAvailabilitySlotItem,
  TutorBookingFormData,
  TutorScheduleOverview,
  TutorSessionFollowup,
  TutorSessionListItem,
  TutorSessionStatus,
  TutorSessionsOverview
} from "@/types/scheduling";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type TutorProfileRow = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  expertise: string[] | null;
  is_active: boolean;
};

type SlotRow = {
  id: string;
  tutor_profile_id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  tutor: Array<{
    id: string;
    display_name: string;
    expertise: string[] | null;
  }> | null;
};

type SessionRow = {
  id: string;
  tutor_profile_id: string;
  learner_user_id: string;
  availability_slot_id: string | null;
  support_request_id: string | null;
  subject: string;
  category: SupportCategory;
  status: TutorSessionStatus;
  meeting_link: string | null;
  notes: string | null;
  scheduled_starts_at: string;
  scheduled_ends_at: string;
  created_at: string;
  updated_at: string;
  tutor: Array<{
    id: string;
    display_name: string;
  }> | null;
  followup: Array<{
    id: string;
    tutor_session_id: string;
    tutor_profile_id: string;
    learner_user_id: string;
    summary: string;
    recommendations: string | null;
    homework: string | null;
    next_steps: string | null;
    created_at: string;
    updated_at: string;
  }> | null;
};

type FollowupRow = {
  id: string;
  tutor_session_id: string;
  tutor_profile_id: string;
  learner_user_id: string;
  summary: string;
  recommendations: string | null;
  homework: string | null;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
};

function coerceSearchParam(
  value: string | string[] | undefined
): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeCategory(value: string): SupportCategory {
  const categories: SupportCategory[] = [
    "general",
    "lesson_clarification",
    "quiz_help",
    "exam_help",
    "lab_help",
    "cli_help"
  ];

  return categories.includes(value as SupportCategory)
    ? (value as SupportCategory)
    : "general";
}

function mapTutorProfile(row: TutorProfileRow): TutorProfileSummary {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio,
    expertise: row.expertise ?? [],
    isActive: row.is_active
  };
}

function mapSlot(
  row: SlotRow,
  bookedSession: { id: string; status: TutorSessionStatus } | undefined
): TutorAvailabilitySlotItem {
  const tutor = row.tutor?.[0] ?? null;

  return {
    id: row.id,
    tutorProfileId: row.tutor_profile_id,
    tutorDisplayName: tutor?.display_name ?? "Tutor",
    tutorExpertise: tutor?.expertise ?? [],
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: row.is_active,
    isBooked: Boolean(bookedSession),
    bookedSessionId: bookedSession?.id ?? null,
    bookedSessionStatus: bookedSession?.status ?? null
  };
}

function mapFollowup(row: FollowupRow): TutorSessionFollowup {
  return {
    id: row.id,
    tutorSessionId: row.tutor_session_id,
    tutorProfileId: row.tutor_profile_id,
    learnerUserId: row.learner_user_id,
    summary: row.summary,
    recommendations: row.recommendations,
    homework: row.homework,
    nextSteps: row.next_steps,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSession(row: SessionRow): TutorSessionListItem {
  const tutor = row.tutor?.[0] ?? null;
  const followup = row.followup?.[0] ?? null;

  return {
    id: row.id,
    tutorProfileId: row.tutor_profile_id,
    tutorDisplayName: tutor?.display_name ?? "Tutor",
    learnerUserId: row.learner_user_id,
    availabilitySlotId: row.availability_slot_id,
    supportRequestId: row.support_request_id,
    subject: row.subject,
    category: row.category,
    status: row.status,
    meetingLink: row.meeting_link,
    notes: row.notes,
    scheduledStartsAt: row.scheduled_starts_at,
    scheduledEndsAt: row.scheduled_ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    followup: followup ? mapFollowup(followup) : null,
    reminderState: null
  };
}

async function getSupabaseClient(): Promise<ServerSupabaseClient> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return supabase;
}

async function fetchActiveTutorProfile(
  userId: string,
  client?: ServerSupabaseClient
): Promise<TutorProfileSummary | null> {
  const supabase = client ?? (await getSupabaseClient());
  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch the active tutor profile: ${error.message}`);
  }

  return data ? mapTutorProfile(data as TutorProfileRow) : null;
}

async function requireTutorProfile(
  userId: string,
  client?: ServerSupabaseClient
): Promise<TutorProfileSummary> {
  const tutorProfile = await fetchActiveTutorProfile(userId, client);

  if (!tutorProfile) {
    throw new Error("An active tutor profile is required to manage scheduling.");
  }

  return tutorProfile;
}

async function fetchActiveTutors(
  client?: ServerSupabaseClient
): Promise<TutorProfileSummary[]> {
  const supabase = client ?? (await getSupabaseClient());
  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("id,user_id,display_name,bio,expertise,is_active")
    .eq("is_active", true)
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tutor profiles: ${error.message}`);
  }

  return ((data as TutorProfileRow[] | null) ?? []).map(mapTutorProfile);
}

async function fetchBookedSlotMap(
  supabase: ServerSupabaseClient,
  slotIds: string[]
) {
  if (slotIds.length === 0) {
    return new Map<string, { id: string; status: TutorSessionStatus }>();
  }

  const { data, error } = await supabase
    .from("tutor_sessions")
    .select("id,availability_slot_id,status")
    .in("availability_slot_id", slotIds)
    .in("status", ["requested", "confirmed", "completed"]);

  if (error) {
    throw new Error(`Failed to fetch booked slot state: ${error.message}`);
  }

  const bookedSlotMap = new Map<string, { id: string; status: TutorSessionStatus }>();

  for (const item of (data ??
    []) as Array<{ id: string; availability_slot_id: string | null; status: TutorSessionStatus }>) {
    if (item.availability_slot_id && !bookedSlotMap.has(item.availability_slot_id)) {
      bookedSlotMap.set(item.availability_slot_id, {
        id: item.id,
        status: item.status
      });
    }
  }

  return bookedSlotMap;
}

async function fetchBookingSupportContext(
  supabase: ServerSupabaseClient,
  userId: string,
  supportRequestId: string
): Promise<BookingSupportContext | null> {
  if (!supportRequestId) {
    return null;
  }

  const { data, error } = await supabase
    .from("support_requests")
    .select("id,subject,category,tutor_profile_id")
    .eq("id", supportRequestId)
    .eq("learner_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch support context for booking: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    requestId: data.id as string,
    subject: data.subject as string,
    category: data.category as SupportCategory,
    tutorProfileId: (data.tutor_profile_id as string | null) ?? null
  };
}

export async function fetchTutorBookingFormData(
  userId: string,
  searchParams: Record<string, string | string[] | undefined>
): Promise<TutorBookingFormData> {
  const supabase = await getSupabaseClient();
  const nowIso = new Date().toISOString();
  const [tutors, supportContext] = await Promise.all([
    fetchActiveTutors(supabase),
    fetchBookingSupportContext(
      supabase,
      userId,
      coerceSearchParam(searchParams.supportRequestId)
    )
  ]);

  const requestedTutorProfileId = coerceSearchParam(searchParams.tutorProfileId);
  const selectedTutorProfileId =
    requestedTutorProfileId ||
    supportContext?.tutorProfileId ||
    "";

  const { data, error } = await supabase
    .from("tutor_availability_slots")
    .select(
      "id,tutor_profile_id,starts_at,ends_at,is_active,tutor:tutor_profiles(id,display_name,expertise)"
    )
    .eq("is_active", true)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch available tutor slots: ${error.message}`);
  }

  const slotRows = ((data as SlotRow[] | null) ?? []).filter(
    (slot) => !selectedTutorProfileId || slot.tutor_profile_id === selectedTutorProfileId
  );
  const bookedSlotMap = await fetchBookedSlotMap(
    supabase,
    slotRows.map((slot) => slot.id)
  );

  const availableSlots = slotRows
    .filter((slot) => !bookedSlotMap.has(slot.id))
    .map((slot) => mapSlot(slot, undefined));

  return {
    tutors,
    selectedTutorProfileId,
    availableSlots,
    supportContext,
    initialValues: {
      subject:
        coerceSearchParam(searchParams.subject) ||
        supportContext?.subject ||
        "",
      category: normalizeCategory(
        coerceSearchParam(searchParams.category) || supportContext?.category || "general"
      ),
      notes: coerceSearchParam(searchParams.notes),
      availabilitySlotId: coerceSearchParam(searchParams.availabilitySlotId),
      supportRequestId: supportContext?.requestId ?? ""
    }
  };
}

export async function createTutorAvailabilitySlot(
  userId: string,
  input: {
    startsAt: string;
    endsAt: string;
  }
) {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const { data, error } = await supabase
    .from("tutor_availability_slots")
    .insert({
      tutor_profile_id: tutorProfile.id,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      is_active: true
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23P01") {
      throw new Error("Availability slots cannot overlap existing active slots.");
    }

    throw new Error(`Failed to create tutor availability slot: ${error.message}`);
  }

  return { slotId: data.id as string };
}

export async function deactivateTutorAvailabilitySlot(userId: string, slotId: string) {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const { data, error } = await supabase
    .from("tutor_availability_slots")
    .update({ is_active: false })
    .eq("id", slotId)
    .eq("tutor_profile_id", tutorProfile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to deactivate tutor availability slot: ${error.message}`);
  }

  if (!data) {
    throw new Error("Availability slot not found or not accessible.");
  }
}

export async function fetchTutorScheduleOverview(
  userId: string
): Promise<TutorScheduleOverview> {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const nowIso = new Date().toISOString();

  const [{ data: slotData, error: slotError }, { count: upcomingBookedCount, error: countError }] =
    await Promise.all([
      supabase
        .from("tutor_availability_slots")
        .select(
          "id,tutor_profile_id,starts_at,ends_at,is_active,tutor:tutor_profiles(id,display_name,expertise)"
        )
        .eq("tutor_profile_id", tutorProfile.id)
        .gte("ends_at", nowIso)
        .order("starts_at", { ascending: true }),
      supabase
        .from("tutor_sessions")
        .select("id", { count: "exact", head: true })
        .eq("tutor_profile_id", tutorProfile.id)
        .in("status", ["requested", "confirmed"])
        .gte("scheduled_ends_at", nowIso)
    ]);

  if (slotError) {
    throw new Error(`Failed to fetch tutor availability slots: ${slotError.message}`);
  }

  if (countError) {
    throw new Error(`Failed to count upcoming tutor bookings: ${countError.message}`);
  }

  const slotRows = (slotData as SlotRow[] | null) ?? [];
  const bookedSlotMap = await fetchBookedSlotMap(
    supabase,
    slotRows.map((slot) => slot.id)
  );

  return {
    tutorProfile,
    slots: slotRows.map((slot) => mapSlot(slot, bookedSlotMap.get(slot.id))),
    upcomingBookedCount: upcomingBookedCount ?? 0
  };
}

export async function bookTutorSession(
  userId: string,
  input: {
    availabilitySlotId: string;
    subject: string;
    category: SupportCategory;
    notes: string | null;
    supportRequestId: string | null;
  }
) {
  const supabase = await getSupabaseClient();
  const { data: slotData, error: slotError } = await supabase
    .from("tutor_availability_slots")
    .select(
      "id,tutor_profile_id,starts_at,ends_at,is_active,tutor:tutor_profiles(id,display_name,expertise)"
    )
    .eq("id", input.availabilitySlotId)
    .maybeSingle();

  if (slotError) {
    throw new Error(`Failed to load the selected availability slot: ${slotError.message}`);
  }

  const slot = slotData as SlotRow | null;

  if (!slot || !slot.is_active) {
    throw new Error("That availability slot is no longer available.");
  }

  if (new Date(slot.starts_at).getTime() <= Date.now()) {
    throw new Error("Only future availability slots can be booked.");
  }

  const { data, error } = await supabase
    .from("tutor_sessions")
    .insert({
      tutor_profile_id: slot.tutor_profile_id,
      learner_user_id: userId,
      availability_slot_id: slot.id,
      support_request_id: input.supportRequestId,
      subject: input.subject,
      category: input.category,
      status: "requested",
      meeting_link: null,
      notes: input.notes,
      scheduled_starts_at: slot.starts_at,
      scheduled_ends_at: slot.ends_at
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("That availability slot was booked a moment ago. Choose another slot.");
    }

    throw new Error(`Failed to book the tutor session: ${error.message}`);
  }

  return { sessionId: data.id as string };
}

async function fetchSessionRowsForLearner(
  supabase: ServerSupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("tutor_sessions")
    .select(
      "id,tutor_profile_id,learner_user_id,availability_slot_id,support_request_id,subject,category,status,meeting_link,notes,scheduled_starts_at,scheduled_ends_at,created_at,updated_at,tutor:tutor_profiles(id,display_name),followup:tutor_session_followups(id,tutor_session_id,tutor_profile_id,learner_user_id,summary,recommendations,homework,next_steps,created_at,updated_at)"
    )
    .eq("learner_user_id", userId)
    .order("scheduled_starts_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch learner tutor sessions: ${error.message}`);
  }

  return ((data as SessionRow[] | null) ?? []).map(mapSession);
}

export async function fetchLearnerSessionsOverview(
  userId: string
): Promise<LearnerSessionsOverview> {
  const supabase = await getSupabaseClient();
  const sessions = await fetchSessionRowsForLearner(supabase, userId);
  const reminderStateMap = await fetchSessionReminderStateMap(
    userId,
    sessions.map((session) => session.id)
  );
  const now = Date.now();
  const sessionsWithReminderState = sessions.map((session) => ({
    ...session,
    reminderState: reminderStateMap.get(session.id) ?? null
  }));

  return {
    upcomingSessions: sessionsWithReminderState.filter(
      (session) => new Date(session.scheduledEndsAt).getTime() >= now
    ),
    pastSessions: sessionsWithReminderState.filter(
      (session) => new Date(session.scheduledEndsAt).getTime() < now
    )
  };
}

export async function fetchTutorSessionsOverview(
  userId: string
): Promise<TutorSessionsOverview> {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const { data, error } = await supabase
    .from("tutor_sessions")
    .select(
      "id,tutor_profile_id,learner_user_id,availability_slot_id,support_request_id,subject,category,status,meeting_link,notes,scheduled_starts_at,scheduled_ends_at,created_at,updated_at,tutor:tutor_profiles(id,display_name),followup:tutor_session_followups(id,tutor_session_id,tutor_profile_id,learner_user_id,summary,recommendations,homework,next_steps,created_at,updated_at)"
    )
    .eq("tutor_profile_id", tutorProfile.id)
    .order("scheduled_starts_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tutor sessions: ${error.message}`);
  }

  const sessions = ((data as SessionRow[] | null) ?? []).map(mapSession);
  const reminderStateMap = await fetchSessionReminderStateMap(
    userId,
    sessions.map((session) => session.id)
  );
  const sessionsWithReminderState = sessions.map((session) => ({
    ...session,
    reminderState: reminderStateMap.get(session.id) ?? null
  }));
  const now = Date.now();

  return {
    pendingSessions: sessionsWithReminderState.filter(
      (session) =>
        session.status === "requested" &&
        new Date(session.scheduledEndsAt).getTime() >= now
    ),
    upcomingSessions: sessionsWithReminderState.filter(
      (session) =>
        session.status === "confirmed" &&
        new Date(session.scheduledEndsAt).getTime() >= now
    ),
    completedSessions: sessionsWithReminderState.filter(
      (session) => session.status === "completed"
    ),
    canceledSessions: sessionsWithReminderState.filter(
      (session) => session.status === "canceled"
    )
  };
}

export async function updateTutorSession(
  userId: string,
  input: {
    sessionId: string;
    status: TutorSessionStatus;
    meetingLink: string | null;
    notes: string | null;
  }
) {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const { data, error } = await supabase
    .from("tutor_sessions")
    .update({
      status: input.status,
      meeting_link: input.meetingLink,
      notes: input.notes
    })
    .eq("id", input.sessionId)
    .eq("tutor_profile_id", tutorProfile.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update tutor session: ${error.message}`);
  }

  if (!data) {
    throw new Error("Tutor session not found or not accessible.");
  }
}

export async function upsertTutorSessionFollowup(
  userId: string,
  input: {
    sessionId: string;
    summary: string;
    recommendations: string | null;
    homework: string | null;
    nextSteps: string | null;
  }
) {
  const supabase = await getSupabaseClient();
  const tutorProfile = await requireTutorProfile(userId, supabase);
  const { data: sessionData, error: sessionError } = await supabase
    .from("tutor_sessions")
    .select("id,learner_user_id,status")
    .eq("id", input.sessionId)
    .eq("tutor_profile_id", tutorProfile.id)
    .maybeSingle();

  if (sessionError) {
    throw new Error(`Failed to validate the tutor session follow-up target: ${sessionError.message}`);
  }

  if (!sessionData) {
    throw new Error("Tutor session not found or not accessible.");
  }

  if ((sessionData.status as TutorSessionStatus) !== "completed") {
    throw new Error("Follow-ups can only be saved after a session is completed.");
  }

  const { data, error } = await supabase
    .from("tutor_session_followups")
    .upsert(
      {
        tutor_session_id: input.sessionId,
        tutor_profile_id: tutorProfile.id,
        learner_user_id: sessionData.learner_user_id as string,
        summary: input.summary,
        recommendations: input.recommendations,
        homework: input.homework,
        next_steps: input.nextSteps
      },
      {
        onConflict: "tutor_session_id"
      }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save the tutor follow-up: ${error.message}`);
  }

  return {
    followupId: data.id as string
  };
}

export async function cancelLearnerTutorSession(userId: string, sessionId: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("tutor_sessions")
    .update({ status: "canceled" })
    .eq("id", sessionId)
    .eq("learner_user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to cancel the tutor session: ${error.message}`);
  }

  if (!data) {
    throw new Error("Tutor session not found or not accessible.");
  }
}

export async function fetchDashboardSchedulingSnapshot(
  userId: string
): Promise<DashboardSchedulingSnapshot | null> {
  const supabase = await getSupabaseClient();
  const [learnerSessions, tutorProfile] = await Promise.all([
    fetchSessionRowsForLearner(supabase, userId),
    fetchActiveTutorProfile(userId, supabase)
  ]);
  const now = Date.now();

  const nextLearnerSession =
    learnerSessions.find(
      (session) =>
        ["requested", "confirmed"].includes(session.status) &&
        new Date(session.scheduledEndsAt).getTime() >= now
    ) ?? null;
  const latestFollowupSession =
    learnerSessions
      .filter((session) => session.followup)
      .sort((left, right) => {
        const leftCreatedAt = left.followup ? new Date(left.followup.createdAt).getTime() : 0;
        const rightCreatedAt = right.followup ? new Date(right.followup.createdAt).getTime() : 0;

        return rightCreatedAt - leftCreatedAt;
      })[0] ?? null;

  let tutorMetrics: DashboardSchedulingSnapshot["tutorMetrics"] = null;

  if (tutorProfile) {
    const { data, error } = await supabase
      .from("tutor_sessions")
      .select(
        "status,scheduled_starts_at,scheduled_ends_at,created_at,followup:tutor_session_followups(id)"
      )
      .eq("tutor_profile_id", tutorProfile.id);

    if (error) {
      throw new Error(`Failed to fetch tutor scheduling metrics: ${error.message}`);
    }

    const tutorSessions =
      ((data as Array<{
        status: TutorSessionStatus;
        scheduled_starts_at: string;
        scheduled_ends_at: string;
        created_at: string;
        followup: Array<{ id: string }> | null;
      }> | null) ?? []);
    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);

    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    tutorMetrics = {
      upcomingBookedSessions: tutorSessions.filter(
        (session) =>
          session.status === "confirmed" &&
          new Date(session.scheduled_ends_at).getTime() >= now
      ).length,
      pendingRequests: tutorSessions.filter(
        (session) =>
          session.status === "requested" &&
          new Date(session.scheduled_ends_at).getTime() >= now
      ).length,
      completedSessions: tutorSessions.filter((session) => session.status === "completed")
        .length,
      todaySessions: tutorSessions.filter((session) => {
        const startTime = new Date(session.scheduled_starts_at).getTime();

        return (
          startTime >= startOfToday.getTime() &&
          startTime < startOfTomorrow.getTime() &&
          ["confirmed", "completed"].includes(session.status)
        );
      }).length,
      sessionsNeedingFollowup: tutorSessions.filter(
        (session) => session.status === "completed" && (session.followup?.length ?? 0) === 0
      ).length,
      overdueFollowups: tutorSessions.filter(
        (session) =>
          session.status === "completed" &&
          (session.followup?.length ?? 0) === 0 &&
          new Date(session.scheduled_ends_at).getTime() < now - 24 * 60 * 60 * 1000
      ).length,
      recentBookingActivity: tutorSessions.filter(
        (session) =>
          new Date(session.created_at).getTime() >= now - 7 * 24 * 60 * 60 * 1000
      ).length
    };
  }

  return {
    upcomingSessions: learnerSessions.filter(
      (session) =>
        ["requested", "confirmed"].includes(session.status) &&
        new Date(session.scheduledEndsAt).getTime() >= now
    ).length,
    pastSessions: learnerSessions.filter(
      (session) => new Date(session.scheduledEndsAt).getTime() < now
    ).length,
    nextSession: nextLearnerSession
      ? {
          id: nextLearnerSession.id,
          subject: nextLearnerSession.subject,
          status: nextLearnerSession.status,
          scheduledStartsAt: nextLearnerSession.scheduledStartsAt,
          tutorDisplayName: nextLearnerSession.tutorDisplayName,
          meetingLink: nextLearnerSession.meetingLink
        }
      : null,
    latestFollowup: latestFollowupSession?.followup
      ? {
          sessionId: latestFollowupSession.id,
          subject: latestFollowupSession.subject,
          summary: latestFollowupSession.followup.summary,
          createdAt: latestFollowupSession.followup.createdAt
        }
      : null,
    tutorMetrics
  };
}
