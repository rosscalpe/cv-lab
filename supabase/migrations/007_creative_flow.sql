-- Agrega la plantilla premium Creative Flow
insert into templates (name, category, is_premium, price_usd, price_ars)
select 'Creative Flow', 'creative', true, 3, 2000
where not exists (select 1 from templates where name = 'Creative Flow');
