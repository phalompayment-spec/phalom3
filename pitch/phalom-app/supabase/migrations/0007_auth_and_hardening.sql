-- Phalom production hardening:
--   1. Shop authentication (phone + hashed 6-digit PIN, brute-force lockout, revocable sessions)
--   2. Terms acceptance tracking on merchants
--   3. Consistent demo-shop tagging (all seeded example shops 0001..0013 marked is_demo = true)
--   4. Demo-filtered public shop/map RPCs and sanitized public payment details (no bank_last4 leak)
--   5. Dedicated partner webhook confirmation RPC (separate from demo simulate_pay)

-- 1. Mark all seeded example shops from 0002_seed.sql and 0004_map.sql as demo shops.
update public.merchants
   set is_demo = true
 where id in (
   '00000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-000000000003',
   '00000000-0000-4000-8000-000000000004',
   '00000000-0000-4000-8000-000000000005',
   '00000000-0000-4000-8000-000000000006',
   '00000000-0000-4000-8000-000000000007',
   '00000000-0000-4000-8000-000000000008',
   '00000000-0000-4000-8000-000000000009',
   '00000000-0000-4000-8000-000000000010',
   '00000000-0000-4000-8000-000000000011',
   '00000000-0000-4000-8000-000000000012',
   '00000000-0000-4000-8000-000000000013'
 );

-- 2. Merchant login phone & terms acceptance columns.
alter table public.merchants add column if not exists phone_normalized text;
alter table public.merchants add column if not exists terms_accepted_at timestamptz;
alter table public.merchants add column if not exists terms_version text;

create unique index if not exists merchants_phone_normalized_uidx
  on public.merchants(phone_normalized)
  where phone_normalized is not null;

-- 3. Auth credentials table (kept separate from merchants so hashes never leak in merchant rows).
create table if not exists public.merchant_auth (
  merchant_id     uuid primary key references public.merchants(id) on delete cascade,
  pin_hash        text not null,
  pin_salt        text not null,
  failed_attempts int not null default 0,
  locked_until    timestamptz,
  updated_at      timestamptz not null default now()
);
alter table public.merchant_auth enable row level security;

-- 4. Server-side revocable sessions (stores SHA-256 hash of session token only).
create table if not exists public.merchant_sessions (
  id              uuid primary key default gen_random_uuid(),
  merchant_id     uuid not null references public.merchants(id) on delete cascade,
  token_hash      text not null unique,
  is_demo_session boolean not null default false,
  expires_at      timestamptz not null,
  revoked_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists merchant_sessions_merchant_idx
  on public.merchant_sessions(merchant_id, revoked_at, expires_at);
alter table public.merchant_sessions enable row level security;

-- 5. RPC: atomic merchant registration with auth credentials & terms timestamp.
create or replace function public.register_merchant_with_auth(
  p_name_lo          text,
  p_category         text default 'souvenir',
  p_market           text default 'ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ',
  p_phone            text default null,
  p_phone_normalized text default null,
  p_bank             text default 'BCEL',
  p_account_last4    text default '0000',
  p_names            jsonb default '{}'::jsonb,
  p_pin_hash         text default null,
  p_pin_salt         text default null,
  p_terms_version    text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m merchants;
begin
  if coalesce(trim(p_name_lo), '') = '' then raise exception 'name_required'; end if;
  if coalesce(trim(p_phone_normalized), '') = '' then raise exception 'phone_required'; end if;
  if coalesce(trim(p_pin_hash), '') = '' or coalesce(trim(p_pin_salt), '') = '' then raise exception 'pin_required'; end if;
  if exists (select 1 from merchants where phone_normalized = p_phone_normalized) then
    raise exception 'phone_already_registered';
  end if;

  insert into merchants(
    name_lo, names, category, market, phone, phone_normalized, bank, account_last4,
    map_x, map_y, terms_accepted_at, terms_version
  )
  values (
    trim(p_name_lo), coalesce(p_names, '{}'::jsonb), coalesce(p_category, 'souvenir'),
    coalesce(p_market, 'ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ'), p_phone, p_phone_normalized,
    coalesce(p_bank, 'BCEL'), right(coalesce(p_account_last4, '0000'), 4),
    40 + floor(random() * 280)::int, 60 + floor(random() * 170)::int,
    case when p_terms_version is not null then now() else null end,
    p_terms_version
  )
  returning * into m;

  insert into merchant_auth(merchant_id, pin_hash, pin_salt)
  values (m.id, p_pin_hash, p_pin_salt);

  return to_jsonb(m);
end $$;

-- 6. RPCs: credential lookup, lockout tracking, and PIN rotation.
create or replace function public.get_merchant_auth_by_phone(p_phone_normalized text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'merchant_id', m.id,
    'is_demo', m.is_demo,
    'pin_hash', a.pin_hash,
    'pin_salt', a.pin_salt,
    'failed_attempts', a.failed_attempts,
    'locked_until', a.locked_until
  )
  from merchants m
  join merchant_auth a on a.merchant_id = m.id
  where m.phone_normalized = p_phone_normalized
  limit 1
$$;

create or replace function public.get_merchant_auth_by_id(p_merchant uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'merchant_id', m.id,
    'is_demo', m.is_demo,
    'pin_hash', a.pin_hash,
    'pin_salt', a.pin_salt,
    'failed_attempts', a.failed_attempts,
    'locked_until', a.locked_until
  )
  from merchants m
  join merchant_auth a on a.merchant_id = m.id
  where m.id = p_merchant
  limit 1
$$;

create or replace function public.record_login_failure(
  p_merchant uuid,
  p_max_attempts int default 5,
  p_lock_minutes int default 15
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  attempts int;
  lock_ts timestamptz;
begin
  update merchant_auth
     set failed_attempts = case
           when locked_until is not null and locked_until <= now() then 1
           else failed_attempts + 1
         end,
         locked_until = case
           when (case when locked_until is not null and locked_until <= now() then 1 else failed_attempts + 1 end) >= p_max_attempts
             then now() + make_interval(mins => p_lock_minutes)
           else null
         end,
         updated_at = now()
   where merchant_id = p_merchant
  returning failed_attempts, locked_until into attempts, lock_ts;

  return jsonb_build_object('failed_attempts', coalesce(attempts, 0), 'locked_until', lock_ts);
end $$;

create or replace function public.reset_login_failures(p_merchant uuid)
returns void language sql security definer set search_path = public as $$
  update merchant_auth
     set failed_attempts = 0, locked_until = null, updated_at = now()
   where merchant_id = p_merchant
$$;

create or replace function public.update_merchant_pin(
  p_merchant uuid,
  p_pin_hash text,
  p_pin_salt text,
  p_keep_token_hash text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  update merchant_auth
     set pin_hash = p_pin_hash, pin_salt = p_pin_salt,
         failed_attempts = 0, locked_until = null, updated_at = now()
   where merchant_id = p_merchant;
  if not found then raise exception 'merchant_not_found'; end if;

  update merchant_sessions
     set revoked_at = now()
   where merchant_id = p_merchant
     and revoked_at is null
     and (p_keep_token_hash is null or token_hash <> p_keep_token_hash);

  return jsonb_build_object('ok', true);
end $$;

-- 7. RPCs: revocable sessions.
create or replace function public.create_merchant_session(
  p_merchant uuid,
  p_token_hash text,
  p_ttl_seconds int default 2592000,
  p_is_demo boolean default false
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s merchant_sessions;
begin
  if not exists (select 1 from merchants where id = p_merchant) then
    raise exception 'merchant_not_found';
  end if;
  -- Opportunistic cleanup of expired sessions for this merchant.
  delete from merchant_sessions
   where merchant_id = p_merchant and (expires_at < now() or revoked_at < now() - interval '7 days');

  insert into merchant_sessions(merchant_id, token_hash, is_demo_session, expires_at)
  values (p_merchant, p_token_hash, coalesce(p_is_demo, false), now() + make_interval(secs => greatest(60, least(p_ttl_seconds, 7776000))))
  returning * into s;

  return jsonb_build_object(
    'session_id', s.id,
    'merchant_id', s.merchant_id,
    'is_demo_session', s.is_demo_session,
    'expires_at', s.expires_at
  );
end $$;

create or replace function public.get_merchant_session(p_token_hash text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'session_id', s.id,
    'merchant_id', s.merchant_id,
    'is_demo_session', s.is_demo_session,
    'merchant_is_demo', m.is_demo,
    'expires_at', s.expires_at
  )
  from merchant_sessions s
  join merchants m on m.id = s.merchant_id
  where s.token_hash = p_token_hash
    and s.revoked_at is null
    and s.expires_at > now()
  limit 1
$$;

create or replace function public.revoke_merchant_session(p_token_hash text)
returns jsonb language sql security definer set search_path = public as $$
  with r as (
    update merchant_sessions
       set revoked_at = now()
     where token_hash = p_token_hash and revoked_at is null
    returning id
  )
  select jsonb_build_object('revoked', (select count(*) from r))
$$;

-- 8. Demo-filtered public shop & map RPCs.
drop function if exists public.list_shops();
create or replace function public.list_shops(p_include_demo boolean default false)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', m.id, 'name_lo', m.name_lo, 'names', m.names, 'category', m.category, 'market', m.market,
           'x', m.map_x, 'y', m.map_y, 'rating', m.rating,
           'paid_today', (select count(*) from payments p where p.merchant_id = m.id and p.status = 'paid' and p.paid_at >= vientiane_today()))
         order by m.created_at), '[]'::jsonb)
  from merchants m
  where (coalesce(p_include_demo, false) or not m.is_demo)
$$;

drop function if exists public.map_shops();
create or replace function public.map_shops(p_include_demo boolean default false)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', m.id, 'name_lo', m.name_lo, 'names', m.names, 'category', m.category, 'market', m.market,
           'rating', m.rating, 'lat', m.lat, 'lng', m.lng, 'open_from', m.open_from, 'open_to', m.open_to,
           'min_price', (select min(price_kip) from menu_items i where i.merchant_id = m.id),
           'paid_total', coalesce(s.total, 0), 'paid_today', coalesce(s.today, 0),
           'by_nat', coalesce(s.by_nat, '{}'::jsonb))
         order by m.created_at), '[]'::jsonb)
  from merchants m
  left join lateral (
    select count(*) as total,
           count(*) filter (where p.paid_at >= vientiane_today()) as today,
           (select jsonb_object_agg(nat, c) from (
              select coalesce(p2.nationality, 'other') as nat, count(*) as c
              from payments p2 where p2.merchant_id = m.id and p2.status = 'paid'
              group by 1) x) as by_nat
    from payments p where p.merchant_id = m.id and p.status = 'paid'
  ) s on true
  where m.lat is not null and m.lng is not null
    and (coalesce(p_include_demo, false) or not m.is_demo)
$$;

-- 9. Sanitized public payment view: strip bank & account_last4; include category & is_demo.
create or replace function public.get_payment(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(p) || jsonb_build_object('merchant', jsonb_build_object(
           'id', m.id, 'name_lo', m.name_lo, 'names', m.names, 'category', m.category,
           'market', m.market, 'is_demo', m.is_demo))
  from payments p join merchants m on m.id = p.merchant_id
  where p.id = p_id
$$;

-- 10. Production partner payment confirmation RPC (separate from demo simulate_pay).
create or replace function public.confirm_partner_payment(
  p_id uuid,
  p_wallet text,
  p_reference text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p payments;
begin
  update payments
     set status = 'paid',
         wallet = p_wallet,
         nationality = wallet_nationality(p_wallet),
         paid_at = now(),
         reference = coalesce(nullif(trim(p_reference), ''), 'PHL' || to_char(now() at time zone 'Asia/Vientiane', 'YYMMDD') || lpad((floor(random() * 1000000))::int::text, 6, '0'))
   where id = p_id and status = 'pending'
  returning * into p;

  if p.id is null then
    select * into p from payments where id = p_id;
    if p.id is null then raise exception 'payment_not_found'; end if;
  end if;
  return to_jsonb(p);
end $$;

-- 11. Lock down execution of all new/updated RPCs to service_role only.
do $$
declare f text;
begin
  foreach f in array array[
    'register_merchant_with_auth(text,text,text,text,text,text,text,jsonb,text,text,text)',
    'get_merchant_auth_by_phone(text)',
    'get_merchant_auth_by_id(uuid)',
    'record_login_failure(uuid,integer,integer)',
    'reset_login_failures(uuid)',
    'update_merchant_pin(uuid,text,text,text)',
    'create_merchant_session(uuid,text,integer,boolean)',
    'get_merchant_session(text)',
    'revoke_merchant_session(text)',
    'list_shops(boolean)',
    'map_shops(boolean)',
    'get_payment(uuid)',
    'confirm_partner_payment(uuid,text,text)'
  ]
  loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function public.%s from anon, authenticated', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function public.%s to service_role', f);
    end if;
  end loop;
end $$;
