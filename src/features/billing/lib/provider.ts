import type { BillingCheckoutSession, BillingProvider, BillingPlan } from "@/types/billing";

export interface BillingCheckoutProvider {
  name: BillingProvider;
  createCheckoutSession(input: {
    plan: BillingPlan;
    userId: string;
    userEmail?: string | null;
    successUrlBase: string;
    cancelUrlBase: string;
  }): Promise<BillingCheckoutSession>;
}
