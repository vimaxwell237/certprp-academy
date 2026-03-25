import { NextRequest, NextResponse } from "next/server";

import { handleStripeWebhookEvent } from "@/features/billing/data/billing-service";
import {
  createStripeClient,
  getStripeWebhookSecret,
  hasStripeBillingEnv,
  hasStripeWebhookSecret
} from "@/lib/stripe/config";

const WEBHOOK_RESPONSE_HEADERS = {
  "Cache-Control": "no-store"
} as const;

export async function POST(request: NextRequest) {
  if (!hasStripeBillingEnv()) {
    return NextResponse.json(
      { error: "Stripe billing is not configured. Set STRIPE_SECRET_KEY first." },
      { headers: WEBHOOK_RESPONSE_HEADERS, status: 503 }
    );
  }

  if (!hasStripeWebhookSecret()) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET." },
      { headers: WEBHOOK_RESPONSE_HEADERS, status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature header." },
      { headers: WEBHOOK_RESPONSE_HEADERS, status: 400 }
    );
  }

  const stripe = createStripeClient();
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret()
    );

    await handleStripeWebhookEvent(event);

    return NextResponse.json({ received: true }, { headers: WEBHOOK_RESPONSE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Stripe webhook verification failed."
            : error instanceof Error
              ? error.message
              : "Stripe webhook verification failed."
      },
      { headers: WEBHOOK_RESPONSE_HEADERS, status: 400 }
    );
  }
}
