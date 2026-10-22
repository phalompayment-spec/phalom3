-- Market names in Lao for the example shops (the apps are Lao-first).
update public.merchants set market = 'ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ' where market = 'Luang Prabang Night Market';
alter table public.merchants alter column market set default 'ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ';
