import type { BillingCheckoutProvider } from "@/features/billing/lib/provider";
import { buildAppUrl } from "@/lib/app-url";
import { createStripeClient, getStripePriceIdForPlan } from "@/lib/stripe/config";

export const stripeCheckoutProvider: BillingCheckoutProvider = {
  name: "stripe",
  async createCheckoutSession(input) {
    const stripe = createStripeClient();
    const successUrl = `${buildAppUrl(input.successUrlBase)}?provider=stripe&plan=${encodeURIComponent(input.plan.slug)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${buildAppUrl(input.cancelUrlBase)}?provider=stripe&plan=${encodeURIComponent(input.plan.slug)}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: getStripePriceIdForPlan(input.plan.slug, input.plan.billingInterval),
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: input.userId,
      customer_email: input.userEmail ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        planSlug: input.plan.slug,
        userId: input.userId
      },
      subscription_data: {
        metadata: {
          planSlug: input.plan.slug,
          userId: input.userId
        }
      }
    });

    if (!session.url) {
      throw new Error("Stripe Checkout session did not return a redirect URL.");
    }

    return {
      provider: "stripe",
      sessionToken: session.id,
      checkoutUrl: session.url
    };
  }
};
