import Stripe from 'stripe';

/**
 * Stripe Client
 *
 * Lazily-initialized so the module loads even when STRIPE_API_SECRET_KEY
 * is not set (e.g. when payments are disabled in this deployment). Code paths
 * that actually need Stripe should call `getStripeClient()` and handle the
 * `null` case.
 */
let _client: Stripe | null = null;

export const getStripeClient = (): Stripe | null => {
  if (_client) return _client;
  const key = process.env.STRIPE_API_SECRET_KEY;
  if (!key) {
    console.warn('STRIPE_API_SECRET_KEY is not set — Stripe client unavailable');
    return null;
  }
  _client = new Stripe(key);
  return _client;
};

/**
 * @deprecated Prefer `getStripeClient()` to handle the disabled case.
 * This proxy preserves the existing import shape but throws helpfully if
 * Stripe is unconfigured AND something tries to use it.
 */
export const stripeClient = new Proxy({} as Stripe, {
  get(_t, prop) {
    const client = getStripeClient();
    if (!client) {
      throw new Error(
        `Stripe is not configured. Set STRIPE_API_SECRET_KEY to use Stripe (was attempting to access "${String(prop)}").`,
      );
    }
    // @ts-expect-error proxy passthrough
    return client[prop];
  },
});
