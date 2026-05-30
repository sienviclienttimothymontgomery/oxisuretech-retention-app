/**
 * Shared Shopify integration utilities.
 *
 * Builds pre-loaded cart permalink URLs with discount codes and
 * UTM attribution parameters for the OxiSure retention app.
 *
 * Shopify cart permalink format:
 *   https://{store}/cart/{variantId}:{qty}?discount={code}&ref=...
 */

// ── Shopify store configuration ──────────────────────────────────────────────

export const SHOPIFY_CONFIG = {
  /** Shopify store domain (no trailing slash) */
  storeDomain: 'https://oxisuretechsolutions.com',

  /** Primary product — Oxygen Tubing 50 ft */
  product: {
    id: 8045620559961,
    variantId: 42726807863385,
    handle: 'oxygen-tubing-50-ft-non-kinking-high-flow-hose',
    title: 'OxiSure Tech Oxygen Tubing (1 Pack)',
    sku: '6H-NCN9-95CJ',
    price: 45.99,
    compareAtPrice: 55.99,
  },
} as const;

// ── Discount tier system ─────────────────────────────────────────────────────

export type DiscountTier = {
  code: string;
  percent: number;
  label: string;
  message: string;
};

/**
 * Determine which discount tier the user qualifies for based on how many
 * days of supply remain before they run out.
 */
export function getDiscountTier(reorderDaysLeft: number): DiscountTier {
  if (reorderDaysLeft <= 0) {
    return {
      code: 'COMEBACK20',
      percent: 20,
      label: 'Recovery',
      message: "It's been a while — save 20% to get back on track.",
    };
  }
  if (reorderDaysLeft <= 7) {
    return {
      code: 'RUSH15',
      percent: 15,
      label: 'Urgent',
      message: 'Only a week left! Save 15% when you reorder now.',
    };
  }
  if (reorderDaysLeft <= 30) {
    return {
      code: 'DUESOON12',
      percent: 12,
      label: 'Due Soon',
      message: 'Your supply is running low — save 12% today.',
    };
  }
  return {
    code: 'REORDER10',
    percent: 10,
    label: 'Early Reorder',
    message: 'Order ahead and save 10%. Smart timing!',
  };
}

// ── URL builders ─────────────────────────────────────────────────────────────

export type ReorderSource = 'web' | 'mobile' | 'email' | 'push';

/**
 * Build a Shopify **cart permalink** that pre-loads the product into the
 * customer's cart and auto-applies the appropriate discount code.
 *
 * @param quantity  Number of tubes to add (from user profile)
 * @param reorderDaysLeft  Days of supply remaining (drives discount tier)
 * @param source  Attribution source for UTM tracking
 * @returns Fully-qualified Shopify cart URL string
 */
export function buildCartUrl(
  quantity: number = 1,
  reorderDaysLeft: number = 90,
  source: ReorderSource = 'web',
): string {
  const { storeDomain, product } = SHOPIFY_CONFIG;
  const tier = getDiscountTier(reorderDaysLeft);
  const qty = Math.max(1, quantity);

  const base = `${storeDomain}/cart/${product.variantId}:${qty}`;

  const params = new URLSearchParams({
    discount: tier.code,
    ref: `oxisure-${source}`,
    utm_source: 'oxisure',
    utm_medium: source,
    utm_campaign: 'reorder',
    utm_content: tier.code.toLowerCase(),
  });

  return `${base}?${params.toString()}`;
}

/**
 * Plain product page URL (fallback when we don't want to force a cart add).
 */
export function buildProductUrl(): string {
  return `${SHOPIFY_CONFIG.storeDomain}/products/${SHOPIFY_CONFIG.product.handle}`;
}
