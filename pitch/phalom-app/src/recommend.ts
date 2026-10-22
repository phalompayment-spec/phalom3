/**
 * Phalom map recommendations, computed at the Cloudflare edge.
 *
 * Google Maps knows where places are. Phalom knows what tourists actually buy:
 * every payment carries the visitor's home wallet (so their country), the shop
 * and the time. The ranking mixes five signals:
 *
 *   near     walking distance from the tourist (falls off over ~1.5 km)
 *   loved    share of this shop's buyers who come from the tourist's country
 *   open     the shop is open now (Vientiane time)
 *   rated    shop rating
 *   gem      small shops with few sales get a boost, so new money is spread
 *            to vendors Google Maps and big tour groups never send people to
 */

export interface MapShop {
  id: string; name_lo: string; names: Record<string, string>; category: string; market: string;
  rating: number | null; lat: number; lng: number; open_from: number; open_to: number;
  min_price: number | null; paid_total: number; paid_today: number; by_nat: Record<string, number>;
}

export interface Query { lat: number; lng: number; nat: string; cat?: string; minute: number; limit: number }

export const WEIGHTS = { near: 0.4, loved: 0.25, open: 0.15, rated: 0.1, gem: 0.1 };

export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad, dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isOpen(s: Pick<MapShop, "open_from" | "open_to">, minute: number): boolean {
  return s.open_from <= s.open_to ? minute >= s.open_from && minute < s.open_to : minute >= s.open_from || minute < s.open_to;
}

/** Minutes after midnight in Vientiane (UTC+7, no daylight saving). */
export const vientianeMinute = (d = new Date()) => (d.getUTCHours() * 60 + d.getUTCMinutes() + 7 * 60) % 1440;

export function recommend(shops: MapShop[], q: Query) {
  const scored = shops
    .filter((s) => !q.cat || s.category === q.cat)
    .map((s) => {
      const dist = distanceM(q.lat, q.lng, s.lat, s.lng);
      const total = Number(s.paid_total) || 0;
      const fromNat = Number(s.by_nat?.[q.nat]) || 0;
      const natShare = total ? fromNat / total : 0;
      const open = isOpen(s, q.minute);
      const parts = {
        near: Math.exp(-dist / 1500),
        loved: natShare * Math.min(1, total / 15),
        open: open ? 1 : 0,
        rated: s.rating ? Math.max(0, Math.min(1, (Number(s.rating) - 4) / 1)) : 0.3,
        gem: total < 15 ? 1 : total < 30 ? 0.4 : 0,
      };
      const score = Object.entries(WEIGHTS).reduce((a, [k, w]) => a + w * parts[k as keyof typeof parts], 0);
      const reasons: string[] = [];
      if (natShare >= 0.3 && fromNat >= 3) reasons.push("loved");
      if (open) reasons.push("open"); else reasons.push("closed");
      if (dist < 700) reasons.push("near");
      if (s.rating && Number(s.rating) >= 4.7) reasons.push("top");
      if (total < 15) reasons.push("gem");
      if (s.paid_today >= 5) reasons.push("busy");
      return {
        id: s.id, name_lo: s.name_lo, names: s.names, category: s.category, market: s.market, rating: s.rating,
        lat: s.lat, lng: s.lng, open_from: s.open_from, open_to: s.open_to, min_price: s.min_price,
        paid_today: s.paid_today, distance_m: Math.round(dist), open, nat_share: Math.round(natShare * 100),
        score: Math.round(score * 1000) / 1000, parts, reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, q.limit);
}

/** Where a shop stands for visitors from each country, among shops within 2 km. */
export function shopStanding(shops: MapShop[], shopId: string, minute: number) {
  const me = shops.find((s) => s.id === shopId);
  if (!me) return null;
  const near = shops.filter((s) => distanceM(me.lat, me.lng, s.lat, s.lng) <= 2000);
  const nats = ["cn", "th", "vn", "kr", "other"];
  return {
    nearby: near.length,
    by_nat: nats.map((nat) => {
      const list = recommend(near, { lat: me.lat, lng: me.lng, nat, minute, limit: 99 });
      return { nat, rank: list.findIndex((x) => x.id === shopId) + 1 };
    }),
  };
}
