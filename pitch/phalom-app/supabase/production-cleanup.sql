-- Optional production cutover script (NOT run automatically by scripts/db-push.mjs).
-- Run this manually in the Supabase SQL Editor ONLY when switching a database
-- from APP_MODE="demo" to APP_MODE="production" and removing all seeded example data.
--
-- Before running:
--   1. Confirm APP_MODE = "production" is deployed on the Cloudflare Worker.
--   2. Take a Supabase database backup.
--   3. Verify no real shop has is_demo = true.

begin;

-- Remove demo payments (including any DEMO-% records).
delete from public.payments
 where reference like 'DEMO-%'
    or merchant_id in (select id from public.merchants where is_demo = true);

-- Remove demo sessions and demo shops (cascades to menu_items, merchant_auth, merchant_sessions).
delete from public.merchants
 where is_demo = true;

-- Remove pitch-era demo data generators so they cannot be called in production.
drop function if exists public.ensure_demo_sales();
drop function if exists public.ensure_demo_week();
drop function if exists public.simulate_pay(uuid, text, boolean);
drop function if exists public.demo_merchant();

commit;
