/**
 * Centralized Lao-kip-only fee calculation for Phalom.
 *
 * Business policy:
 *   - All amounts are Lao kip (LAK) only.
 *   - The shop always receives 100% of the item price (merchant_net_kip === price_kip).
 *   - The transaction fee is added to the tourist's total and must stay below
 *     LOCA Pay's public benchmark (3% + 5,000 kip, estimate per BUSINESS.md).
 */

export type PricingProfileName = "demo" | "v4_proposed" | "v4_card_fallback";

export interface PricingProfile {
  profile: PricingProfileName;
  pctBps: number; // basis points: 150 = 1.50%, 290 = 2.90%, 300 = 3.00%
  fixedKip: number;
  labelLo: string;
  labelEn: string;
}

export const PRICING_PROFILES: Record<PricingProfileName, PricingProfile> = {
  demo: {
    profile: "demo",
    pctBps: 150,
    fixedKip: 0,
    labelLo: "ຄ່າທຳນຽມລະບົບ 1.5% (ສາທິດ)",
    labelEn: "Service fee 1.5% (demo)",
  },
  v4_proposed: {
    profile: "v4_proposed",
    pctBps: 290,
    fixedKip: 1000,
    labelLo: "ຄ່າທຳນຽມຊຳລະ 2.9% + 1,000 ກີບ",
    labelEn: "Payment fee 2.9% + 1,000 kip",
  },
  v4_card_fallback: {
    profile: "v4_card_fallback",
    pctBps: 300,
    fixedKip: 1000,
    labelLo: "ຄ່າທຳນຽມຊຳລະ 3% + 1,000 ກີບ",
    labelEn: "Payment fee 3% + 1,000 kip",
  },
};

export function resolvePricingProfile(raw?: string, isDemo = false): PricingProfile {
  if (raw && raw in PRICING_PROFILES) {
    return PRICING_PROFILES[raw as PricingProfileName];
  }
  return isDemo ? PRICING_PROFILES.demo : PRICING_PROFILES.v4_proposed;
}

export interface FeeBreakdown {
  price_kip: number;
  fee_kip: number;
  tourist_total_kip: number;
  merchant_net_kip: number;
  loca_benchmark_kip: number;
  savings_vs_loca_kip: number;
  profile: PricingProfileName;
}

export function calculateFee(priceKip: number, profile: PricingProfile): FeeBreakdown {
  const price = Math.round(Number(priceKip));
  const pctFee = Math.round((price * profile.pctBps) / 10_000);
  const fee = pctFee + profile.fixedKip;
  const touristTotal = price + fee;
  // LOCA Pay benchmark from BUSINESS.md: 3% + 5,000 kip (estimate)
  const locaFee = Math.round(price * 0.03) + 5000;
  const locaTotal = price + locaFee;
  return {
    price_kip: price,
    fee_kip: fee,
    tourist_total_kip: touristTotal,
    merchant_net_kip: price,
    loca_benchmark_kip: locaTotal,
    savings_vs_loca_kip: locaTotal - touristTotal,
    profile: profile.profile,
  };
}
