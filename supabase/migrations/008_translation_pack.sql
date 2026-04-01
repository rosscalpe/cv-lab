-- Pack de traducción: addon para exportar en otros idiomas
insert into templates (name, category, is_premium, price_usd, price_ars)
select 'Translation Pack', 'addon', true, 1, 1000
where not exists (select 1 from templates where name = 'Translation Pack');
