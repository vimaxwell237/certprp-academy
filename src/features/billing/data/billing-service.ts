import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { devCheckoutProvider } from "@/features/billing/lib/dev-provider";
import type { BillingCheckoutProvider } from "@/features/billing/lib/provider";
import { stripeCheckoutProvider } from "@/features/billing/lib/stripe-provider";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import {
  createStripeClient,
  getStripePriceIdForPlan,
  hasStripeBillingEnv
} from "@/lib/stripe/config";
import type {
  BillingAccessState,
  BillingCheckoutSession,
  BillingFeatureKey,
  BillingPlan,
  BillingProvider,
  DashboardBillingSnapshot,
  PricingPlanCardData,
  SubscriptionStatus,
  UserSubscription
} from "@/types/billing";
import { getLockedFeatureList } from "@/features/billing/lib/access-control";
import {
  canAccessCliModule,
  canAccessLabModule,
  canAccessQuizModule,
  hasBillingFeature
} from "@/features/billing/lib/access-control";

type BillingSupabaseClient = SupabaseClient<any, "public", any>;

type RawPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_amount: number;
  price_currency: string;
  billing_interval: "none" | "month" | "year";
  is_active: boolean;
  features_json: Record<string, boolean> | null;
};

type RawSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  provider: BillingProvider;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  plan: RawPlan[] | RawPlan | null;
};

const BILLING_PROVIDER_REGISTRY = {
  dev_checkout: devCheckoutProvider,
  stripe: stripeCheckoutProvider
} satisfies Record<BillingProvider, BillingCheckoutProvider>;

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due"];
const BILLING_WRITE_ENV_ERROR =
  "Secure billing sync is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY so subscriptions can be finalized safely.";

function hasBillingWriteAccess() {
  return hasSupabaseServiceRoleEnv();
}

function getBillingWriteClient() {
  if (!hasBillingWriteAccess()) {
    throw new Error(BILLING_WRITE_ENV_ERROR);
  }

  return createServiceRoleSupabaseClient();
}

function getActiveCheckoutProvider() {
  const configuredProvider = process.env.BILLING_PROVIDER?.trim().toLowerCase();

  if (configuredProvider === "dev_checkout") {
    return BILLING_PROVIDER_REGISTRY.dev_checkout;
  }

  if (hasStripeBillingEnv()) {
    return BILLING_PROVIDER_REGISTRY.stripe;
  }

  throw new Error(
    "Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY and your Stripe price IDs to .env.local, or explicitly set BILLING_PROVIDER=dev_checkout if you want the fake local checkout."
  );
}

function relationFirst<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapPlan(plan: RawPlan): BillingPlan {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    priceAmount: plan.price_amount,
    priceCurrency: plan.price_currency,
    billingInterval: plan.billing_interval,
    isActive: plan.is_active,
    features: plan.features_json ?? {}
  };
}

function mapSubscription(subscription: RawSubscription): UserSubscription {
  return {
    id: subscription.id,
    userId: subscription.user_id,
    planId: subscription.plan_id,
    status: subscription.status,
    provider: subscription.provider,
    providerCustomerId: subscription.provider_customer_id,
    providerSubscriptionId: subscription.provider_subscription_id,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    createdAt: subscription.created_at,
    updatedAt: subscription.updated_at
  };
}

function compareIsoDatesDescending(left: string | null, right: string | null) {
  const leftTime = left ? Date.parse(left) : Number.NEGATIVE_INFINITY;
  const rightTime = right ? Date.parse(right) : Number.NEGATIVE_INFINITY;

  return rightTime - leftTime;
}

export function selectCurrentSubscriptionRecord(
  subscriptions: RawSubscription[]
): RawSubscription | null {
  if (subscriptions.length === 0) {
    return null;
  }

  return [...subscriptions].sort((left, right) => {
    const leftUsable = ACTIVE_SUBSCRIPTION_STATUSES.includes(left.status) ? 1 : 0;
    const rightUsable = ACTIVE_SUBSCRIPTION_STATUSES.includes(right.status) ? 1 : 0;

    if (leftUsable !== rightUsable) {
      return rightUsable - leftUsable;
    }

    const updatedAtComparison = compareIsoDatesDescending(left.updated_at, right.updated_at);

    if (updatedAtComparison !== 0) {
      return updatedAtComparison;
    }

    return compareIsoDatesDescending(left.created_at, right.created_at);
  })[0] ?? null;
}

async function getSupabaseClient() {
  return createServerSupabaseClient();
}

async function recordPaymentEventForCurrentUser(
  userId: string,
  provider: BillingProvider,
  eventType: string,
  eventPayload: Record<string, unknown>
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { error } = await supabase.rpc("record_billing_payment_event", {
    p_target_user_id: userId,
    p_event_provider: provider,
    p_event_type: eventType,
    p_event_payload: eventPayload
  });

  if (error) {
    throw new Error(`Failed to record payment event: ${error.message}`);
  }
}

async function finalizeCheckoutSubscriptionForCurrentUser(input: {
  userId: string;
  planSlug: string;
  provider: BillingProvider;
  providerCustomerId: string | null;
  providerSubscriptionId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  eventType: string;
  eventPayload: Record<string, unknown>;
}) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const { error } = await supabase.rpc("finalize_billing_checkout", {
    p_target_user_id: input.userId,
    p_plan_slug: input.planSlug,
    p_provider: input.provider,
    p_provider_customer_id: input.providerCustomerId,
    p_provider_subscription_id: input.providerSubscriptionId,
    p_current_period_start: input.currentPeriodStart,
    p_current_period_end: input.currentPeriodEnd,
    p_payment_event_type: input.eventType,
    p_payment_event_payload: input.eventPayload
  });

  if (error) {
    throw new Error(`Failed to finalize billing checkout: ${error.message}`);
  }
}

async function hasActiveTutorProfile(
  client: BillingSupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from("tutor_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify tutor profile access: ${error.message}`);
  }

  return Boolean(data);
}

function isSubscriptionUsable(subscription: UserSubscription | null) {
  if (!subscription) {
    return false;
  }

  if (!["active", "trialing"].includes(subscription.status)) {
    return false;
  }

  if (!subscription.currentPeriodEnd) {
    return true;
  }

  return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
}

function unixSecondsToIso(value: number | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "canceled":
      return "canceled";
    case "incomplete_expired":
      return "expired";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "paused":
      return "expired";
    default:
      return "expired";
  }
}

function getStripeCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getStripeSubscriptionPeriod(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0];

  return {
    currentPeriodStart: unixSecondsToIso(firstItem?.current_period_start ?? subscription.start_date),
    currentPeriodEnd: unixSecondsToIso(firstItem?.current_period_end ?? subscription.ended_at)
  };
}

async function recordPaymentEventWithClient(
  client: BillingSupabaseClient,
  userId: string | null,
  provider: BillingProvider,
  eventType: string,
  eventPayload: Record<string, unknown>
) {
  const { error } = await client.from("payment_events").insert({
    user_id: userId,
    provider,
    event_type: eventType,
    event_payload: eventPayload
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw new Error(`Failed to record payment event: ${error.message}`);
  }
}

async function expirePriorSubscriptions(
  client: BillingSupabaseClient,
  userId: string,
  providerSubscriptionId?: string | null
) {
  let query = client
    .from("user_subscriptions")
    .update({
      status: "expired"
    })
    .eq("user_id", userId)
    .in("status", ACTIVE_SUBSCRIPTION_STATUSES);

  if (providerSubscriptionId) {
    query = query.neq("provider_subscription_id", providerSubscriptionId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to expire prior subscriptions: ${error.message}`);
  }
}

async function upsertSubscriptionRecord(
  client: BillingSupabaseClient,
  input: {
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    provider: BillingProvider;
    providerCustomerId: string | null;
    providerSubscriptionId: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
  }
) {
  const { data: existingSubscription, error: existingError } = await client
    .from("user_subscriptions")
    .select("id")
    .eq("provider_subscription_id", input.providerSubscriptionId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to verify existing subscription: ${existingError.message}`);
  }

  const payload = {
    user_id: input.userId,
    plan_id: input.planId,
    status: input.status,
    provider: input.provider,
    provider_customer_id: input.providerCustomerId,
    provider_subscription_id: input.providerSubscriptionId,
    current_period_start: input.currentPeriodStart,
    current_period_end: input.currentPeriodEnd
  };

  if (existingSubscription) {
    const { error: updateError } = await client
      .from("user_subscriptions")
      .update(payload)
      .eq("id", existingSubscription.id);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    return existingSubscription.id;
  }

  const { data: inserted, error: insertError } = await client
    .from("user_subscriptions")
    .insert(payload)
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Failed to persist subscription: ${insertError.message}`);
  }

  return inserted.id;
}

async function syncStripeSubscriptionRecord(
  input: {
    userId: string;
    planSlug: string;
    subscription: Stripe.Subscription;
    eventType: string;
    eventPayload: Record<string, unknown>;
  }
) {
  const syncClient = getBillingWriteClient();

  const plan = await fetchPlanBySlug(syncClient, input.planSlug);

  if (!plan || plan.slug === "free") {
    throw new Error(`Stripe checkout referenced an unknown paid plan: ${input.planSlug}.`);
  }

  const subscriptionPeriod = getStripeSubscriptionPeriod(input.subscription);

  await expirePriorSubscriptions(syncClient, input.userId, input.subscription.id);
  await upsertSubscriptionRecord(syncClient, {
    userId: input.userId,
    planId: plan.id,
    status: mapStripeSubscriptionStatus(input.subscription.status),
    provider: "stripe",
    providerCustomerId: getStripeCustomerId(input.subscription.customer),
    providerSubscriptionId: input.subscription.id,
    currentPeriodStart: subscriptionPeriod.currentPeriodStart,
    currentPeriodEnd: subscriptionPeriod.currentPeriodEnd
  });

  await recordPaymentEventWithClient(
    syncClient,
    input.userId,
    "stripe",
    input.eventType,
    input.eventPayload
  );

  return {
    planSlug: plan.slug,
    userId: input.userId
  };
}

export async function fetchActivePlans(): Promise<BillingPlan[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id,name,slug,description,price_amount,price_currency,billing_interval,is_active,features_json")
    .eq("is_active", true)
    .order("price_amount", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return (((data as RawPlan[] | null) ?? []).map(mapPlan));
}

async function fetchPlanBySlug(
  client: BillingSupabaseClient,
  slug: string
): Promise<BillingPlan | null> {
  const { data, error } = await client
    .from("plans")
    .select("id,name,slug,description,price_amount,price_currency,billing_interval,is_active,features_json")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return data ? mapPlan(data as RawPlan) : null;
}

async function fetchLatestSubscription(
  client: BillingSupabaseClient,
  userId: string
): Promise<{ plan: BillingPlan; subscription: UserSubscription | null } | null> {
  const { data, error } = await client
    .from("user_subscriptions")
    .select(
      "id,user_id,plan_id,status,provider,provider_customer_id,provider_subscription_id,current_period_start,current_period_end,created_at,updated_at,plan:plans(id,name,slug,description,price_amount,price_currency,billing_interval,is_active,features_json)"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch current subscription: ${error.message}`);
  }

  const subscriptions = (data as RawSubscription[] | null) ?? [];
  const selectedSubscription = selectCurrentSubscriptionRecord(subscriptions);

  if (!selectedSubscription) {
    return null;
  }

  const plan = relationFirst(selectedSubscription.plan);

  if (!plan) {
    return null;
  }

  return {
    plan: mapPlan(plan),
    subscription: mapSubscription(selectedSubscription)
  };
}

export async function fetchBillingAccessState(userId: string): Promise<BillingAccessState> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return {
      plan: {
        id: "free-fallback",
        name: "Free",
        slug: "free",
        description: "Core lesson access with limited preview content.",
        priceAmount: 0,
        priceCurrency: "USD",
        billingInterval: "none",
        isActive: true,
        features: {}
      },
      subscription: null,
      status: "free",
      isPaid: false,
      isActive: true,
      hasTutorPlan: false,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      features: {}
    };
  }

  const [freePlan, currentSubscription] = await Promise.all([
    fetchPlanBySlug(supabase, "free"),
    fetchLatestSubscription(supabase, userId)
  ]);

  const effectiveSubscription =
    currentSubscription && isSubscriptionUsable(currentSubscription.subscription)
      ? currentSubscription
      : null;
  const effectivePlan = effectiveSubscription?.plan ?? freePlan;

  if (!effectivePlan) {
    throw new Error("The seeded billing plans are missing. Run the Phase 8 plan seed SQL.");
  }

  return {
    plan: effectivePlan,
    subscription: effectiveSubscription?.subscription ?? null,
    status: effectiveSubscription?.subscription?.status ?? "free",
    isPaid: effectivePlan.slug !== "free",
    isActive: effectivePlan.slug === "free" ? true : Boolean(effectiveSubscription),
    hasTutorPlan: Boolean(
      effectivePlan.features.tutor_support_access && effectivePlan.slug === "tutor-plan"
    ),
    currentPeriodStart: effectiveSubscription?.subscription?.currentPeriodStart ?? null,
    currentPeriodEnd: effectiveSubscription?.subscription?.currentPeriodEnd ?? null,
    features: effectivePlan.features
  };
}

export async function fetchPricingPlansForUser(
  userId: string | null
): Promise<{
  plans: PricingPlanCardData[];
  accessState: BillingAccessState | null;
}> {
  const plans = await fetchActivePlans();
  const accessState = userId ? await fetchBillingAccessState(userId) : null;

  return {
    plans: plans.map((plan) => ({
      ...plan,
      isCurrentPlan: accessState ? accessState.plan.slug === plan.slug : false,
      currentStatus: accessState && accessState.plan.slug === plan.slug ? accessState.status : null,
      callToAction: accessState && accessState.plan.slug === plan.slug ? "current" : "upgrade"
    })),
    accessState
  };
}

export function getBillingCheckoutAvailability(plans: BillingPlan[]) {
  const configuredProvider = process.env.BILLING_PROVIDER?.trim().toLowerCase();
  const paidPlans = plans.filter((plan) => plan.slug !== "free");
  const planMessages: Record<string, string | null> = {};

  if (configuredProvider === "dev_checkout") {
    for (const plan of paidPlans) {
      planMessages[plan.slug] =
        "Development checkout is enabled right now, so this plan will not open the real Stripe card form.";
    }

    return {
      activeProvider: "dev_checkout" as const,
      isReady: true,
      globalMessage:
        "Development checkout is enabled. Switch BILLING_PROVIDER to stripe and add your Stripe sandbox keys when you want real card entry.",
      planMessages
    };
  }

  if (!hasStripeBillingEnv()) {
    for (const plan of paidPlans) {
      planMessages[plan.slug] =
        "Stripe sandbox is not configured yet. Add STRIPE_SECRET_KEY and the Stripe price ID for this plan in .env.local.";
    }

    return {
      activeProvider: null,
      isReady: false,
      globalMessage:
        "Stripe sandbox is not configured yet. Add STRIPE_SECRET_KEY and your Stripe plan price IDs in .env.local to enable real checkout.",
      planMessages
    };
  }

  let isReady = true;

  for (const plan of paidPlans) {
    try {
      getStripePriceIdForPlan(plan.slug, plan.billingInterval);
      planMessages[plan.slug] = null;
    } catch (error) {
      isReady = false;
      planMessages[plan.slug] =
        error instanceof Error ? error.message : "Missing Stripe price configuration.";
    }
  }

  return {
    activeProvider: "stripe" as const,
    isReady,
    globalMessage: isReady
      ? null
      : "Stripe is connected, but one or more paid plans are missing Stripe price IDs in .env.local.",
    planMessages
  };
}

export async function fetchDashboardBillingSnapshot(
  userId: string
): Promise<DashboardBillingSnapshot> {
  const [accessState, tutorProfileActive] = await Promise.all([
    fetchBillingAccessState(userId),
    (async () => {
      const supabase = await getSupabaseClient();

      if (!supabase) {
        return false;
      }

      return hasActiveTutorProfile(supabase, userId);
    })()
  ]);

  return {
    currentPlanName: accessState.plan.name,
    currentPlanSlug: accessState.plan.slug,
    subscriptionStatus: accessState.status,
    currentPeriodEnd: accessState.currentPeriodEnd,
    isPaid: accessState.isPaid,
    lockedFeatures: getLockedFeatureList(accessState).filter((feature) =>
      tutorProfileActive ? feature.feature !== "tutor_support_access" : true
    )
  };
}

export async function recordPaymentEvent(
  userId: string | null,
  provider: BillingProvider,
  eventType: string,
  eventPayload: Record<string, unknown>
) {
  if (!userId) {
    throw new Error("A billing event cannot be recorded without an authenticated user.");
  }

  await recordPaymentEventForCurrentUser(userId, provider, eventType, eventPayload);
}

export async function createCheckoutSession(
  userId: string,
  planSlug: string,
  userEmail?: string | null
): Promise<BillingCheckoutSession> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const plan = await fetchPlanBySlug(supabase, planSlug);

  if (!plan) {
    throw new Error("Selected billing plan is not available.");
  }

  if (plan.slug === "free") {
    throw new Error("The free plan does not require checkout.");
  }

  const provider = getActiveCheckoutProvider();
  const session = await provider.createCheckoutSession({
    plan,
    userId,
    userEmail,
    successUrlBase: APP_ROUTES.checkoutSuccess,
    cancelUrlBase: APP_ROUTES.checkoutCancel
  });

  await recordPaymentEvent(userId, session.provider, "checkout.session.created", {
    sessionToken: session.sessionToken,
    planSlug: plan.slug
  });

  return session;
}

export async function syncStripeCheckoutSession(
  sessionId: string,
  expectedUserId?: string
) {
  if (!hasStripeBillingEnv()) {
    throw new Error("Stripe billing is not configured yet.");
  }

  const stripe = createStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });
  const sessionUserId = session.metadata?.userId ?? session.client_reference_id ?? expectedUserId;

  if (!sessionUserId) {
    throw new Error("Stripe checkout session is missing the CertPrep user reference.");
  }

  if (expectedUserId && sessionUserId !== expectedUserId) {
    throw new Error("This Stripe checkout session does not belong to the current user.");
  }

  const planSlug = session.metadata?.planSlug;

  if (!planSlug) {
    throw new Error("Stripe checkout session is missing the selected plan reference.");
  }

  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

  if (!subscription) {
    throw new Error("Stripe checkout session does not include a subscription.");
  }

  const subscriptionPeriod = getStripeSubscriptionPeriod(subscription);

  if (expectedUserId) {
    await finalizeCheckoutSubscriptionForCurrentUser({
      userId: sessionUserId,
      planSlug,
      provider: "stripe",
      providerCustomerId: getStripeCustomerId(subscription.customer),
      providerSubscriptionId: subscription.id,
      currentPeriodStart: subscriptionPeriod.currentPeriodStart,
      currentPeriodEnd: subscriptionPeriod.currentPeriodEnd,
      eventType: "checkout.session.completed.sync",
      eventPayload: {
        checkoutSessionId: session.id,
        customerId: getStripeCustomerId(subscription.customer),
        planSlug,
        stripeSubscriptionId: subscription.id
      }
    });

    return {
      planSlug,
      userId: sessionUserId
    };
  }

  return syncStripeSubscriptionRecord({
    userId: sessionUserId,
    planSlug,
    subscription,
    eventType: "checkout.session.completed.sync",
    eventPayload: {
      checkoutSessionId: session.id,
      customerId: getStripeCustomerId(subscription.customer),
      planSlug,
      stripeSubscriptionId: subscription.id
    }
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  if (!hasStripeBillingEnv()) {
    throw new Error("Stripe billing is not configured yet.");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      if (!sessionId) {
        return;
      }

      await syncStripeCheckoutSession(sessionId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const planSlug = subscription.metadata?.planSlug;

      if (!userId || !planSlug) {
        const serviceSupabase = createServiceRoleSupabaseClient();

        await recordPaymentEventWithClient(serviceSupabase, null, "stripe", event.type, {
          eventId: event.id,
          note: "Ignored Stripe subscription event because userId or planSlug metadata was missing.",
          stripeSubscriptionId: subscription.id
        });
        return;
      }

      await syncStripeSubscriptionRecord({
        userId,
        planSlug,
        subscription,
        eventType: event.type,
        eventPayload: {
          eventId: event.id,
          planSlug,
          status: subscription.status,
          stripeSubscriptionId: subscription.id
        }
      });
      return;
    }
    default: {
      const serviceSupabase = createServiceRoleSupabaseClient();

      await recordPaymentEventWithClient(serviceSupabase, null, "stripe", event.type, {
        eventId: event.id,
        note: "Stripe event received without a dedicated subscription state handler."
      });
    }
  }
}

export async function completeDevCheckoutSession(
  userId: string,
  input: {
    sessionToken: string;
    planSlug: string;
  }
) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const plan = await fetchPlanBySlug(supabase, input.planSlug);

  if (!plan || plan.slug === "free") {
    throw new Error("Selected billing plan is invalid for checkout success.");
  }

  const providerSubscriptionId = `dev_sub_${input.sessionToken}`;
  const providerCustomerId = `dev_customer_${userId}`;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await finalizeCheckoutSubscriptionForCurrentUser({
    userId,
    planSlug: plan.slug,
    provider: "dev_checkout",
    providerCustomerId,
    providerSubscriptionId,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    eventType: "checkout.session.completed",
    eventPayload: {
      sessionToken: input.sessionToken,
      planSlug: input.planSlug,
      providerSubscriptionId
    }
  });
}

export function getBillingProviderLabel(provider: BillingProvider) {
  if (provider === "dev_checkout") {
    return "Development Checkout";
  }

  if (provider === "stripe") {
    return "Stripe";
  }

  return provider;
}

export function buildLockedFeatureModel(feature: BillingFeatureKey) {
  switch (feature) {
    case "full_quiz_access":
      return {
        title: "Premium Quiz Access",
        description: "Upgrade to unlock the full quiz library beyond the free preview module."
      };
    case "exam_simulator_access":
      return {
        title: "Exam Simulator Locked",
        description: "Upgrade to Premium to access timed exam modes and full mock exams."
      };
    case "lab_access":
      return {
        title: "Premium Lab Access",
        description: "Upgrade to unlock the full Packet Tracer lab catalog beyond the free preview."
      };
    case "cli_access":
      return {
        title: "Premium CLI Practice",
        description: "Upgrade to unlock guided CLI practice beyond the free preview module."
      };
    case "tutor_support_access":
      return {
        title: "Tutor Support Requires Tutor Plan",
        description: "Upgrade to Tutor Plan to create support threads and access the tutor directory."
      };
  }
}

export async function canAccessQuizSlug(userId: string, quizSlug: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const [accessState, quizData] = await Promise.all([
    fetchBillingAccessState(userId),
    supabase
      .from("quizzes")
      .select("module:modules(slug),lesson:lessons(module:modules(slug))")
      .eq("slug", quizSlug)
      .maybeSingle()
  ]);

  if (quizData.error) {
    throw new Error(`Failed to resolve quiz access: ${quizData.error.message}`);
  }

  if (!quizData.data) {
    return false;
  }

  const moduleSlug =
    relationFirst((quizData.data as { module: Array<{ slug: string }> | null }).module)?.slug ??
    relationFirst(
      relationFirst(
        (quizData.data as {
          lesson: Array<{ module: Array<{ slug: string }> | null }> | null;
        }).lesson
      )?.module
    )?.slug ??
    null;

  return canAccessQuizModule(accessState, moduleSlug);
}

export async function canAccessExamSimulator(userId: string) {
  const accessState = await fetchBillingAccessState(userId);

  return hasBillingFeature(accessState, "exam_simulator_access");
}

export async function canAccessLabBySlug(userId: string, labSlug: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const [accessState, labData] = await Promise.all([
    fetchBillingAccessState(userId),
    supabase
      .from("labs")
      .select("module:modules(slug)")
      .eq("slug", labSlug)
      .maybeSingle()
  ]);

  if (labData.error) {
    throw new Error(`Failed to resolve lab access: ${labData.error.message}`);
  }

  const moduleSlug = relationFirst(
    (labData.data as { module: Array<{ slug: string }> | null } | null)?.module
  )?.slug;

  return moduleSlug ? canAccessLabModule(accessState, moduleSlug) : false;
}

export async function canAccessLabById(userId: string, labId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const [accessState, labData] = await Promise.all([
    fetchBillingAccessState(userId),
    supabase
      .from("labs")
      .select("module:modules(slug)")
      .eq("id", labId)
      .maybeSingle()
  ]);

  if (labData.error) {
    throw new Error(`Failed to resolve lab access: ${labData.error.message}`);
  }

  const moduleSlug = relationFirst(
    (labData.data as { module: Array<{ slug: string }> | null } | null)?.module
  )?.slug;

  return moduleSlug ? canAccessLabModule(accessState, moduleSlug) : false;
}

export async function canAccessCliChallenge(userId: string, challengeSlug: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const [accessState, challengeData] = await Promise.all([
    fetchBillingAccessState(userId),
    supabase
      .from("cli_challenges")
      .select("module:modules(slug)")
      .eq("slug", challengeSlug)
      .maybeSingle()
  ]);

  if (challengeData.error) {
    throw new Error(`Failed to resolve CLI access: ${challengeData.error.message}`);
  }

  const moduleSlug = relationFirst(
    (challengeData.data as { module: Array<{ slug: string }> | null } | null)?.module
  )?.slug;

  return moduleSlug ? canAccessCliModule(accessState, moduleSlug) : false;
}

export async function canAccessTutorSupport(userId: string) {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const [accessState, tutorProfileActive] = await Promise.all([
    fetchBillingAccessState(userId),
    hasActiveTutorProfile(supabase, userId)
  ]);

  return tutorProfileActive || hasBillingFeature(accessState, "tutor_support_access");
}
