import Stripe from "stripe";

let stripeInstance: Stripe | null | undefined;

export function getStripe(): Stripe {
  if (stripeInstance !== undefined) {
    if (!stripeInstance) {
      throw new Error("STRIPE_SECRET_KEY is missing from the environment variables.");
    }

    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    stripeInstance = null;
    throw new Error("STRIPE_SECRET_KEY is missing from the environment variables.");
  }

  stripeInstance = new Stripe(stripeSecretKey);
  return stripeInstance;
}

export default getStripe;
