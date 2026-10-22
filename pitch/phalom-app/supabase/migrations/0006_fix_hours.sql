-- Fix: saving only a location must keep the opening hours (greatest() ignores NULL).
create or replace function public.set_merchant_location(p_merchant uuid, p_lat double precision, p_lng double precision, p_open_from int default null, p_open_to int default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m merchants;
begin
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'location_required';
  end if;
  update merchants set lat = p_lat, lng = p_lng,
         open_from = case when p_open_from is null then open_from else least(greatest(p_open_from, 0), 1439) end,
         open_to   = case when p_open_to   is null then open_to   else least(greatest(p_open_to, 1), 1440) end
   where id = p_merchant returning * into m;
  if m.id is null then raise exception 'merchant_not_found'; end if;
  return jsonb_build_object('id', m.id, 'lat', m.lat, 'lng', m.lng, 'open_from', m.open_from, 'open_to', m.open_to);
end $$;
update public.merchants set open_from = 1020, open_to = 1380 where id = '00000000-0000-4000-8000-000000000001';
