import type { BillingCheckoutProvider } from "@/features/billing/lib/provider";

export const devCheckoutProvider: BillingCheckoutProvider = {
  name: "dev_checkout",
  async createCheckoutSession(input) {
    const sessionToken = crypto.randomUUID();
    const successUrl = new URL(input.successUrlBase, "http://localhost:3000");

    successUrl.searchParams.set("provider", "dev_checkout");
    successUrl.searchParams.set("sessionToken", sessionToken);
    successUrl.searchParams.set("plan", input.plan.slug);

    return {
      provider: "dev_checkout",
      sessionToken,
      checkoutUrl: `${successUrl.pathname}${successUrl.search}`
    };
  }
};
