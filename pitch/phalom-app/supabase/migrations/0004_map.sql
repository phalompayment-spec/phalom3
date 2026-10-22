-- Phalom map: real shop locations (shown on Google Maps) and the data the
-- recommendation engine needs. The ranking itself runs in the Cloudflare
-- Worker (src/recommend.ts); Postgres only hands over the facts per shop.

alter table public.merchants add column if not exists lat double precision;
alter table public.merchants add column if not exists lng double precision;
alter table public.merchants add column if not exists open_from smallint not null default 1020; -- minutes after midnight, Vientiane time (17:00)
alter table public.merchants add column if not exists open_to   smallint not null default 1380; -- 23:00

-- The five night-market shops from 0002, placed along Sisavangvong Road, Luang Prabang.
update public.merchants set lat = 19.88870, lng = 102.13530 where id = '00000000-0000-4000-8000-000000000001' and lat is null;
update public.merchants set lat = 19.88822, lng = 102.13468, open_from = 420, open_to = 1350 where id = '00000000-0000-4000-8000-000000000002' and lat is null;
update public.merchants set lat = 19.88915, lng = 102.13596, open_from = 600 where id = '00000000-0000-4000-8000-000000000003' and lat is null;
update public.merchants set lat = 19.88796, lng = 102.13418 where id = '00000000-0000-4000-8000-000000000004' and lat is null;
update public.merchants set lat = 19.88752, lng = 102.13372, open_from = 960 where id = '00000000-0000-4000-8000-000000000005' and lat is null;

-- More example shops so the map has something to recommend. All names are examples.
insert into public.merchants (id, name_lo, names, category, market, bank, account_last4, rating, lat, lng, open_from, open_to) values
 ('00000000-0000-4000-8000-000000000006', 'ກາເຟ ຣິມຂອງ', '{"zh":"湄公河畔老挝咖啡","th":"กาแฟริมโขง","vi":"Cà phê bên sông Mê Kông","en":"Mekong Riverside Lao Coffee"}', 'coffee', 'ຫຼວງພະບາງ ຣິມຂອງ', 'BCEL', '6610', 4.8, 19.89205, 102.13742, 390, 1080),
 ('00000000-0000-4000-8000-000000000007', 'ເຂົ້າຊອຍ ແມ່ອ່ອນ', '{"zh":"翁妈妈老挝米粉","th":"ข้าวซอย แม่อ่อน","vi":"Khao soi Mae On","en":"Mae On Khao Soi Noodles"}', 'food', 'ຕະຫຼາດເຊົ້າ ຫຼວງພະບາງ', 'LDB', '2207', 4.7, 19.88985, 102.13310, 360, 840),
 ('00000000-0000-4000-8000-000000000008', 'ຜ້າໄໝ ບ້ານຜານົມ', '{"zh":"帕侬村手织丝绸","th":"ผ้าไหม บ้านผานม","vi":"Lụa làng Ban Phanom","en":"Ban Phanom Village Silk"}', 'souvenir', 'ບ້ານຜານົມ', 'APB', '8812', 4.9, 19.90455, 102.16588, 480, 1020),
 ('00000000-0000-4000-8000-000000000009', 'ນ້ຳອ້ອຍ ຕາດກວາງຊີ', '{"zh":"光西瀑布甘蔗汁","th":"น้ำอ้อย ตาดกวางสี","vi":"Nước mía thác Kuang Si","en":"Kuang Si Sugarcane Juice"}', 'drinks', 'ຕາດກວາງຊີ', 'BCEL', '0931', 4.5, 19.74935, 101.99158, 480, 1050),
 ('00000000-0000-4000-8000-000000000010', 'ໝາກພ້າວ ຕີນພູສີ', '{"zh":"普西山脚椰子水","th":"มะพร้าว ตีนภูสี","vi":"Dừa tươi chân núi Phousi","en":"Phousi Hill Coconuts"}', 'drinks', 'ຫຼວງພະບາງ ພູສີ', 'JDB', '4410', 4.6, 19.88940, 102.13420, 540, 1140),
 ('00000000-0000-4000-8000-000000000011', 'ໂຣຕີ ແມ່ສີ ວັງວຽງ', '{"zh":"万荣西妈妈煎饼","th":"โรตี แม่ศรี วังเวียง","vi":"Bánh roti Mae Si Vang Vieng","en":"Mae Si Roti, Vang Vieng"}', 'food', 'ວັງວຽງ', 'LVB', '7120', 4.6, 18.92290, 102.44628, 600, 1410),
 ('00000000-0000-4000-8000-000000000012', 'ເສື້ອລາຍລາວ ແມ່ນາງ', '{"zh":"娘妈妈老挝花纹衣","th":"เสื้อลายลาว แม่นาง","vi":"Áo hoa văn Lào Mae Nang","en":"Mae Nang Lao Pattern Shirts"}', 'souvenir', 'ຕະຫຼາດກາງຄືນ ນະຄອນຫຼວງວຽງຈັນ', 'BCEL', '5521', 4.4, 17.96225, 102.60585, 1020, 1350),
 ('00000000-0000-4000-8000-000000000013', 'ເງິນ ຊ່າງ ບ້ານຈັນ', '{"zh":"班占村银匠","th":"เครื่องเงิน บ้านจัน","vi":"Bạc thợ làng Ban Chan","en":"Ban Chan Silversmith"}', 'silver', 'ຫຼວງພະບາງ ບ້ານຈັນ', 'BCEL', '3390', 4.8, 19.88705, 102.14220, 480, 1080)
on conflict (id) do nothing;

insert into public.menu_items (merchant_id, name_lo, names, price_kip, color)
select v.m::uuid, v.n, v.j::jsonb, v.p, v.c from (values
 ('00000000-0000-4000-8000-000000000006','ກາເຟລາວ ໃສ່ນົມ','{"zh":"老挝炼乳咖啡","th":"กาแฟลาวใส่นม","vi":"Cà phê Lào sữa đặc","en":"Lao coffee with condensed milk"}',25000,'#6B4226'),
 ('00000000-0000-4000-8000-000000000006','ກາເຟດຳ ພູພຽງບໍລະເວນ','{"zh":"波罗芬黑咖啡","th":"กาแฟดำ โบลาเวน","vi":"Cà phê đen Bolaven","en":"Bolaven black coffee"}',20000,'#3B2416'),
 ('00000000-0000-4000-8000-000000000007','ເຂົ້າຊອຍ ຫຼວງພະບາງ','{"zh":"琅勃拉邦米粉","th":"ข้าวซอยหลวงพระบาง","vi":"Khao soi Luang Prabang","en":"Luang Prabang khao soi"}',30000,'#B5531B'),
 ('00000000-0000-4000-8000-000000000007','ເຝີ ຊີ້ນງົວ','{"zh":"牛肉粉","th":"เฝอเนื้อ","vi":"Phở bò","en":"Beef noodle soup"}',35000,'#8A3A12'),
 ('00000000-0000-4000-8000-000000000008','ຜ້າພັນຄໍໄໝ ທໍມື','{"zh":"手织丝巾","th":"ผ้าพันคอไหมทอมือ","vi":"Khăn lụa dệt tay","en":"Hand-woven silk scarf"}',180000,'#7A2E3B'),
 ('00000000-0000-4000-8000-000000000008','ຜ້າສິ້ນ ລາຍນາກ','{"zh":"那伽纹筒裙","th":"ผ้าซิ่นลายนาค","vi":"Váy sinh họa tiết Naga","en":"Naga-pattern sinh skirt"}',520000,'#1F2B6B'),
 ('00000000-0000-4000-8000-000000000009','ນ້ຳອ້ອຍ ໝາກນາວ','{"zh":"青柠甘蔗汁","th":"น้ำอ้อยมะนาว","vi":"Nước mía chanh","en":"Sugarcane juice with lime"}',15000,'#1E7A5A'),
 ('00000000-0000-4000-8000-000000000010','ໝາກພ້າວອ່ອນ','{"zh":"新鲜椰子","th":"มะพร้าวอ่อน","vi":"Dừa tươi","en":"Fresh young coconut"}',20000,'#1E7A5A'),
 ('00000000-0000-4000-8000-000000000011','ໂຣຕີ ກ້ວຍ ນົມ','{"zh":"香蕉炼乳煎饼","th":"โรตีกล้วยนม","vi":"Roti chuối sữa","en":"Banana roti with condensed milk"}',20000,'#B5372F'),
 ('00000000-0000-4000-8000-000000000012','ເສື້ອ ລາຍຊ້າງ','{"zh":"大象图案衬衫","th":"เสื้อลายช้าง","vi":"Áo họa tiết voi","en":"Elephant-pattern shirt"}',90000,'#2E4DB8'),
 ('00000000-0000-4000-8000-000000000013','ສາຍແຂນເງິນ','{"zh":"手工银手镯","th":"กำไลเงิน","vi":"Vòng tay bạc","en":"Silver bracelet"}',250000,'#8A90A8'),
 ('00000000-0000-4000-8000-000000000013','ຕຸ້ມຫູ ດອກຈຳປາ','{"zh":"占巴花银耳环","th":"ต่างหูดอกจำปา","vi":"Bông tai hoa Champa","en":"Champa flower earrings"}',90000,'#5B6386')
) v(m, n, j, p, c)
where not exists (select 1 from public.menu_items i where i.merchant_id = v.m::uuid and i.name_lo = v.n);

-- Past sales for the example shops, so "loved by visitors from ..." has
-- something to learn from. Each shop has its own mix of wallets (= where the
-- visitors come from). Reference DEMO-M….
do $$
declare
  r record; i int; w text;
begin
  for r in select * from (values
      ('00000000-0000-4000-8000-000000000002', 28, array['promptpay','promptpay','vietqr','vietqr','alipay']),
      ('00000000-0000-4000-8000-000000000003', 22, array['kakaopay','kakaopay','unionpay','promptpay']),
      ('00000000-0000-4000-8000-000000000004', 18, array['alipay','wechat','alipay','unionpay']),
      ('00000000-0000-4000-8000-000000000005', 30, array['promptpay','promptpay','promptpay','vietqr']),
      ('00000000-0000-4000-8000-000000000006', 34, array['kakaopay','kakaopay','unionpay','alipay','promptpay']),
      ('00000000-0000-4000-8000-000000000007', 40, array['vietqr','vietqr','promptpay','vietqr','alipay']),
      ('00000000-0000-4000-8000-000000000008',  6, array['unionpay','kakaopay']),
      ('00000000-0000-4000-8000-000000000009', 36, array['alipay','wechat','alipay','alipay','promptpay']),
      ('00000000-0000-4000-8000-000000000010', 20, array['promptpay','promptpay','kakaopay']),
      ('00000000-0000-4000-8000-000000000011', 26, array['kakaopay','kakaopay','kakaopay','promptpay']),
      ('00000000-0000-4000-8000-000000000012', 24, array['promptpay','vietqr','promptpay','vietqr','wechat']),
      ('00000000-0000-4000-8000-000000000013', 10, array['alipay','wechat','unionpay'])
    ) v(mid, n, wallets)
  loop
    if exists (select 1 from payments where merchant_id = r.mid::uuid and reference like 'DEMO-M%') then continue; end if;
    for i in 1..r.n loop
      w := r.wallets[1 + (i % array_length(r.wallets, 1))];
      insert into payments(merchant_id, amount_kip, status, wallet, nationality, from_map, reference, created_at, paid_at)
      values (r.mid::uuid, (15 + (i * 7) % 60) * 1000, 'paid', w, wallet_nationality(w), i % 3 = 0,
              'DEMO-M' || lpad(i::text, 3, '0'),
              now() - make_interval(days => 1 + (i * 3) % 27, mins => (i * 37) % 600),
              now() - make_interval(days => 1 + (i * 3) % 27, mins => (i * 37) % 600));
    end loop;
  end loop;
end $$;

-- Facts per shop for the map and the recommender (no bank or phone details).
create or replace function public.map_shops()
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
$$;

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

do $$
declare f text;
begin
  foreach f in array array['map_shops()', 'set_merchant_location(uuid,double precision,double precision,int,int)'] loop
    execute format('revoke all on function public.%s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function public.%s from anon, authenticated', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function public.%s to service_role', f);
    end if;
  end loop;
end $$;
