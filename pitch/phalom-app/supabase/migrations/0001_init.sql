-- Phalom: merchant app for small Lao vendors taking tourist QR payments.
-- Payments here are a DEMO: no money moves. Real settlement goes through
-- licensed partners (LAPNet member banks, PhaJay); Phalom never holds funds.

create extension if not exists pgcrypto;

-- Merchants (souvenir shops, street-food stalls) ---------------------------
create table if not exists public.merchants (
  id            uuid primary key default gen_random_uuid(),
  name_lo       text not null,
  names         jsonb not null default '{}'::jsonb,   -- {"zh":..,"th":..,"vi":..,"en":..}
  category      text not null default 'souvenir',     -- souvenir | food | drinks | silver
  market        text not null default 'Luang Prabang Night Market',
  phone         text,
  bank          text not null default 'BCEL',
  account_last4 text not null default '0000',
  map_x         int  not null default 180,           -- position on the schematic market map (0-360)
  map_y         int  not null default 140,           -- (0-270)
  rating        numeric(2,1),
  is_demo       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Menu / product list, written in Lao and auto-translated ------------------
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  name_lo      text not null,
  names        jsonb not null default '{}'::jsonb,
  price_kip    bigint not null check (price_kip > 0),
  color        text not null default '#1F2B6B',
  translated_by text not null default 'manual',      -- manual | workers-ai
  created_at   timestamptz not null default now()
);
create index if not exists menu_items_merchant_idx on public.menu_items(merchant_id);

-- Payment requests (one per QR shown) ----------------------------------------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  amount_kip   bigint not null check (amount_kip between 1000 and 100000000),
  status       text not null default 'pending' check (status in ('pending','paid','expired')),
  wallet       text,                                 -- alipay | wechat | promptpay | vietqr | unionpay | laoqr
  nationality  text,                                 -- cn | th | vn | kr | la | other
  from_map     boolean not null default false,
  reference    text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists payments_merchant_time_idx on public.payments(merchant_id, created_at desc);

-- Row level security: nothing is readable with the anon key. ---------------
-- The Cloudflare Worker talks to Supabase with the service role key and
-- exposes only the API it needs.
alter table public.merchants  enable row level security;
alter table public.menu_items enable row level security;
alter table public.payments   enable row level security;

-- Helpers --------------------------------------------------------------------
create or replace function public.wallet_nationality(p_wallet text)
returns text language sql immutable as $$
  select case p_wallet
    when 'alipay' then 'cn' when 'wechat' then 'cn' when 'unionpay' then 'cn'
    when 'promptpay' then 'th' when 'vietqr' then 'vn' when 'kakaopay' then 'kr'
    when 'laoqr' then 'la' else 'other' end
$$;

create or replace function public.vientiane_today()
returns timestamptz language sql stable as $$
  select (date_trunc('day', now() at time zone 'Asia/Vientiane')) at time zone 'Asia/Vientiane'
$$;

-- RPC: register a merchant ----------------------------------------------------
create or replace function public.register_merchant(
  p_name_lo text, p_category text default 'souvenir', p_market text default 'Luang Prabang Night Market',
  p_phone text default null, p_bank text default 'BCEL', p_account_last4 text default '0000',
  p_names jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m merchants;
begin
  if coalesce(trim(p_name_lo),'') = '' then raise exception 'name_required'; end if;
  insert into merchants(name_lo, names, category, market, phone, bank, account_last4, map_x, map_y)
  values (trim(p_name_lo), coalesce(p_names,'{}'::jsonb), coalesce(p_category,'souvenir'), coalesce(p_market,'Luang Prabang Night Market'),
          p_phone, coalesce(p_bank,'BCEL'), right(coalesce(p_account_last4,'0000'),4),
          40 + floor(random()*280)::int, 60 + floor(random()*170)::int)
  returning * into m;
  return to_jsonb(m);
end $$;

create or replace function public.get_merchant(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(m) from merchants m where m.id = p_id
$$;

create or replace function public.demo_merchant()
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(m) from merchants m where m.is_demo order by created_at limit 1
$$;

-- RPC: create a payment request (shown as QR) --------------------------------
create or replace function public.create_payment(p_merchant uuid, p_amount bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p payments;
begin
  if not exists (select 1 from merchants where id = p_merchant) then raise exception 'merchant_not_found'; end if;
  -- a new QR replaces any older pending one for this shop
  update payments set status = 'expired' where merchant_id = p_merchant and status = 'pending';
  insert into payments(merchant_id, amount_kip) values (p_merchant, p_amount)
  returning * into p;
  return to_jsonb(p);
end $$;

create or replace function public.get_payment(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(p) || jsonb_build_object('merchant', jsonb_build_object(
           'id', m.id, 'name_lo', m.name_lo, 'names', m.names, 'market', m.market, 'bank', m.bank, 'account_last4', m.account_last4))
  from payments p join merchants m on m.id = p.merchant_id
  where p.id = p_id
$$;

-- RPC: demo payment. In production this row is updated by the partner's
-- payment notification (bank / PhaJay webhook), never by the tourist page.
create or replace function public.simulate_pay(p_id uuid, p_wallet text, p_from_map boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p payments;
begin
  update payments
     set status = 'paid', wallet = p_wallet, nationality = wallet_nationality(p_wallet),
         from_map = coalesce(p_from_map,false), paid_at = now(),
         reference = 'LPN' || to_char(now() at time zone 'Asia/Vientiane','YYMMDD') || lpad((floor(random()*1000000))::int::text, 6, '0')
   where id = p_id and status = 'pending'
  returning * into p;
  if p.id is null then
    select * into p from payments where id = p_id;
    if p.id is null then raise exception 'payment_not_found'; end if;
  end if;
  return to_jsonb(p);
end $$;

-- RPC: today's dashboard for one shop -----------------------------------------
create or replace function public.merchant_dashboard(p_merchant uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  with t as (
    select * from payments
     where merchant_id = p_merchant and status = 'paid' and paid_at >= vientiane_today()
  )
  select jsonb_build_object(
    'total_kip',     coalesce((select sum(amount_kip) from t), 0),
    'count',         (select count(*) from t),
    'foreign_kip',   coalesce((select sum(amount_kip) from t where nationality <> 'la'), 0),
    'from_map',      (select count(*) from t where from_map),
    'by_nationality', coalesce((select jsonb_agg(jsonb_build_object('nationality', nationality, 'kip', kip, 'count', n) order by kip desc)
                                  from (select nationality, sum(amount_kip) kip, count(*) n from t group by nationality) g), '[]'::jsonb),
    'recent',        coalesce((select jsonb_agg(to_jsonb(r) order by r.paid_at desc)
                                  from (select id, amount_kip, wallet, nationality, from_map, reference, paid_at from t order by paid_at desc limit 8) r), '[]'::jsonb)
  )
$$;

-- RPC: menu -----------------------------------------------------------------------
create or replace function public.list_menu(p_merchant uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(i) order by i.created_at), '[]'::jsonb) from menu_items i where i.merchant_id = p_merchant
$$;

create or replace function public.add_menu_item(p_merchant uuid, p_name_lo text, p_price bigint, p_names jsonb, p_translated_by text default 'manual', p_color text default '#1F2B6B')
returns jsonb language plpgsql security definer set search_path = public as $$
declare i menu_items;
begin
  insert into menu_items(merchant_id, name_lo, names, price_kip, translated_by, color)
  values (p_merchant, trim(p_name_lo), coalesce(p_names,'{}'::jsonb), p_price, coalesce(p_translated_by,'manual'), coalesce(p_color,'#1F2B6B'))
  returning * into i;
  return to_jsonb(i);
end $$;

create or replace function public.delete_menu_item(p_merchant uuid, p_item uuid)
returns jsonb language sql security definer set search_path = public as $$
  with d as (delete from menu_items where id = p_item and merchant_id = p_merchant returning id)
  select jsonb_build_object('deleted', (select count(*) from d))
$$;

-- RPC: tourist-facing shop map ----------------------------------------------------
create or replace function public.list_shops()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', m.id, 'name_lo', m.name_lo, 'names', m.names, 'category', m.category, 'market', m.market,
           'x', m.map_x, 'y', m.map_y, 'rating', m.rating,
           'paid_today', (select count(*) from payments p where p.merchant_id = m.id and p.status = 'paid' and p.paid_at >= vientiane_today()))
         order by m.created_at), '[]'::jsonb)
  from merchants m
$$;

-- Only the service role (the Worker) may call the RPCs. -------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'register_merchant(text,text,text,text,text,text,jsonb)','get_merchant(uuid)','demo_merchant()',
    'create_payment(uuid,bigint)','get_payment(uuid)','simulate_pay(uuid,text,boolean)',
    'merchant_dashboard(uuid)','list_menu(uuid)','add_menu_item(uuid,text,bigint,jsonb,text,text)',
    'delete_menu_item(uuid,uuid)','list_shops()']
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
