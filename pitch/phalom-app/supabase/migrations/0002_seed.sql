-- Demo data for the pitch: one demo shop (Mae Kham Textiles) and four
-- neighbours on the Luang Prabang night-market map. All names are examples.

insert into public.merchants (id, name_lo, names, category, market, bank, account_last4, map_x, map_y, rating, is_demo) values
 ('00000000-0000-4000-8000-000000000001', 'ຮ້ານຜ້າທໍແມ່ຄຳ',
  '{"zh":"坎妈妈织布店","th":"ร้านผ้าทอแม่คำ","vi":"Tiệm vải dệt Mae Kham","en":"Mae Kham Textiles"}', 'souvenir', 'Luang Prabang Night Market', 'BCEL', '4821', 132, 118, 4.8, true),
 ('00000000-0000-4000-8000-000000000002', 'ເຂົ້າຈີ່ປາເຕ ແມ່ນ້ອຍ',
  '{"zh":"老挝法棍三明治","th":"ข้าวจี่ปาเต้ แม่น้อย","vi":"Bánh mì Lào Mae Noy","en":"Mae Noy Baguettes"}', 'food', 'Luang Prabang Night Market', 'JDB', '1190', 205, 132, 4.6, false),
 ('00000000-0000-4000-8000-000000000003', 'ນ້ຳໝາກໄມ້ ພອນ',
  '{"zh":"阿蓬鲜果汁","th":"น้ำผลไม้ พร","vi":"Nước ép trái cây Phone","en":"Phone Fruit Shakes"}', 'drinks', 'Luang Prabang Night Market', 'LDB', '7731', 262, 98, 4.5, false),
 ('00000000-0000-4000-8000-000000000004', 'ເງິນຊ່າງບ້ານ',
  '{"zh":"手工银饰店","th":"เครื่องเงินช่างบ้าน","vi":"Bạc thủ công làng nghề","en":"Village Silver"}', 'silver', 'Luang Prabang Night Market', 'BCEL', '3304', 88, 172, 4.7, false),
 ('00000000-0000-4000-8000-000000000005', 'ປີ້ງໄກ່ ແມ່ຈັນ',
  '{"zh":"占妈妈烤鸡","th":"ไก่ปิ้ง แม่จันทร์","vi":"Gà nướng Mae Chan","en":"Mae Chan Grilled Chicken"}', 'food', 'Luang Prabang Night Market', 'APB', '5512', 300, 178, 4.4, false)
on conflict (id) do nothing;

insert into public.menu_items (merchant_id, name_lo, names, price_kip, color) values
 ('00000000-0000-4000-8000-000000000001','ຜ້າພັນຄໍໄໝ ລາຍນາກ','{"zh":"手工丝绸围巾 · 那伽纹","th":"ผ้าพันคอไหม ลายพญานาค","vi":"Khăn lụa dệt tay họa tiết Naga","en":"Hand-woven silk scarf, Naga pattern"}',150000,'#7A2E3B'),
 ('00000000-0000-4000-8000-000000000001','ຜ້າສິ້ນໄໝ ຫຼວງພະບາງ','{"zh":"琅勃拉邦丝绸筒裙","th":"ผ้าซิ่นไหม หลวงพระบาง","vi":"Váy sinh lụa Luang Prabang","en":"Luang Prabang silk sinh skirt"}',450000,'#1F2B6B'),
 ('00000000-0000-4000-8000-000000000001','ກະເປົາຜ້າຝ້າຍ ຍ້ອມຄາມ','{"zh":"蓝靛染棉布包","th":"กระเป๋าผ้าฝ้ายย้อมคราม","vi":"Túi vải bông nhuộm chàm","en":"Indigo-dyed cotton bag"}',85000,'#2E4DB8'),
 ('00000000-0000-4000-8000-000000000001','ຕຸ້ມຫູເງິນ ຊ່າງບ້ານ','{"zh":"手工银耳环","th":"ต่างหูเงินช่างพื้นบ้าน","vi":"Bông tai bạc thủ công","en":"Village silversmith earrings"}',60000,'#8A90A8'),
 ('00000000-0000-4000-8000-000000000001','ກາເຟລາວ ພູພຽງບໍລະເວນ 250g','{"zh":"老挝波罗芬高原咖啡 250克","th":"กาแฟลาว ที่ราบสูงโบลาเวน 250 ก.","vi":"Cà phê Lào cao nguyên Bolaven 250g","en":"Bolaven Plateau Lao coffee, 250 g"}',70000,'#6B4226')
on conflict do nothing;

-- Keeps the demo shop's dashboard realistic on any day: if the demo shop has
-- no sales yet today, add an evening's worth of example sales (reference DEMO-…).
create or replace function public.ensure_demo_sales()
returns void language plpgsql security definer set search_path = public as $$
declare
  demo uuid := '00000000-0000-4000-8000-000000000001';
  base timestamptz := greatest(vientiane_today(), least(vientiane_today() + interval '17 hours 30 minutes', now() - interval '155 minutes'));
  r record;
begin
  if exists (select 1 from payments where merchant_id = demo and status = 'paid' and paid_at >= vientiane_today()) then return; end if;
  for r in select * from (values
      (30000,'alipay',false,0),(55000,'promptpay',false,18),(70000,'unionpay',true,35),(40000,'laoqr',false,42),
      (95000,'alipay',false,60),(25000,'vietqr',false,74),(60000,'promptpay',false,87),(150000,'wechat',true,100),
      (35000,'laoqr',false,112),(80000,'vietqr',false,130),(45000,'promptpay',false,141),(120000,'alipay',true,152)
    ) v(amt, wallet, from_map, mins)
  loop
    insert into payments(merchant_id, amount_kip, status, wallet, nationality, from_map, reference, created_at, paid_at)
    values (demo, r.amt, 'paid', r.wallet, wallet_nationality(r.wallet), r.from_map, 'DEMO-' || lpad(r.mins::text,3,'0'),
            least(base + make_interval(mins => r.mins), now()), least(base + make_interval(mins => r.mins), now()));
  end loop;
end $$;

do $$ begin
  revoke all on function public.ensure_demo_sales() from public;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function public.ensure_demo_sales() from anon, authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.ensure_demo_sales() to service_role;
  end if;
end $$;
