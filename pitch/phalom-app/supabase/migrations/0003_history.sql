-- Sales history for the merchant app (last N days, Vientiane time) and a week
-- of example sales for the demo shop so its chart is never empty.

create or replace function public.merchant_history(p_merchant uuid, p_days int default 7)
returns jsonb language sql stable security definer set search_path = public as $$
  with d as (
    select generate_series(0, greatest(1, least(p_days, 31)) - 1) as back
  ), days as (
    select (vientiane_today() - make_interval(days => back)) as start, back from d
  ), t as (
    select * from payments
     where merchant_id = p_merchant and status = 'paid'
       and paid_at >= vientiane_today() - make_interval(days => greatest(1, least(p_days, 31)) - 1)
  )
  select jsonb_build_object(
    'days', (select jsonb_agg(jsonb_build_object(
                'day', to_char(days.start at time zone 'Asia/Vientiane', 'YYYY-MM-DD'),
                'kip', coalesce((select sum(amount_kip) from t where t.paid_at >= days.start and t.paid_at < days.start + interval '1 day'), 0),
                'count', (select count(*) from t where t.paid_at >= days.start and t.paid_at < days.start + interval '1 day'))
              order by days.start) from days),
    'total_kip', coalesce((select sum(amount_kip) from t), 0),
    'count', (select count(*) from t),
    'by_wallet', coalesce((select jsonb_agg(jsonb_build_object('wallet', wallet, 'kip', kip, 'count', n) order by kip desc)
                             from (select wallet, sum(amount_kip) kip, count(*) n from t group by wallet) g), '[]'::jsonb),
    'items', coalesce((select jsonb_agg(to_jsonb(r) order by r.paid_at desc)
                         from (select id, amount_kip, wallet, nationality, from_map, reference, paid_at from t order by paid_at desc limit 80) r), '[]'::jsonb)
  )
$$;

create or replace function public.ensure_demo_week()
returns void language plpgsql security definer set search_path = public as $$
declare
  demo uuid := '00000000-0000-4000-8000-000000000001';
  b int; r record; day0 timestamptz;
  wallets text[] := array['alipay','promptpay','wechat','vietqr','laoqr','unionpay','alipay','promptpay','kakaopay','vietqr'];
begin
  for b in 1..6 loop
    day0 := vientiane_today() - make_interval(days => b);
    if exists (select 1 from payments where merchant_id = demo and status = 'paid'
                and paid_at >= day0 and paid_at < day0 + interval '1 day') then continue; end if;
    for r in select g as i from generate_series(1, 6 + ((b * 7) % 9)) g loop
      insert into payments(merchant_id, amount_kip, status, wallet, nationality, from_map, reference, created_at, paid_at)
      values (demo, (array[25000,30000,40000,45000,55000,60000,70000,85000,95000,120000,150000])[1 + ((r.i * 5 + b * 3) % 11)],
              'paid', wallets[1 + ((r.i + b) % 10)], wallet_nationality(wallets[1 + ((r.i + b) % 10)]), (r.i % 4 = 0),
              'DEMO-' || b || '-' || lpad(r.i::text, 2, '0'),
              day0 + interval '16 hours' + make_interval(mins => r.i * 23), day0 + interval '16 hours' + make_interval(mins => r.i * 23));
    end loop;
  end loop;
end $$;

do $$
declare f text;
begin
  foreach f in array array['merchant_history(uuid,integer)', 'ensure_demo_week()'] loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function public.%s from anon, authenticated', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function public.%s to service_role', f);
    end if;
  end loop;
end $$;
