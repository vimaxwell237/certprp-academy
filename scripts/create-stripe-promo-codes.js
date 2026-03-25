const { randomUUID } = require("node:crypto");
const Stripe = require("stripe");

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildCode(label) {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `CERTPREP-${label}-${suffix}`;
}

async function main() {
  const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  const premiumPriceId = requireEnv("STRIPE_PRICE_ID_PREMIUM_MONTH");
  const tutorPriceId = requireEnv("STRIPE_PRICE_ID_TUTOR_PLAN_MONTH");
  const [premiumPrice, tutorPrice] = await Promise.all([
    stripe.prices.retrieve(premiumPriceId),
    stripe.prices.retrieve(tutorPriceId)
  ]);

  const templates = [
    {
      label: "PREMIUM20",
      percentOff: 20,
      productIds: [String(premiumPrice.product)],
      appliesTo: "premium"
    },
    {
      label: "TUTOR30",
      percentOff: 30,
      productIds: [String(tutorPrice.product)],
      appliesTo: "tutor-plan"
    },
    {
      label: "LAUNCH75",
      percentOff: 75,
      productIds: [String(premiumPrice.product), String(tutorPrice.product)],
      appliesTo: "all-paid-plans"
    }
  ];

  const created = [];

  for (const template of templates) {
    const coupon = await stripe.coupons.create({
      percent_off: template.percentOff,
      duration: "forever",
      name: `CertPrep ${template.percentOff}% off`,
      applies_to: {
        products: template.productIds
      }
    });

    const promotionCode = await stripe.promotionCodes.create({
      promotion: {
        type: "coupon",
        coupon: coupon.id
      },
      code: buildCode(template.label),
      max_redemptions: 1,
      metadata: {
        source: "certprep_local_setup",
        percent_off: String(template.percentOff),
        applies_to: template.appliesTo
      }
    });

    created.push({
      label: template.label,
      percentOff: template.percentOff,
      appliesTo: template.appliesTo,
      couponId: coupon.id,
      promotionCodeId: promotionCode.id,
      code: promotionCode.code
    });
  }

  process.stdout.write(`${JSON.stringify(created, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
