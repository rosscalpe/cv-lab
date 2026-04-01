-- Agrega la nueva plantilla gratuita Side Column
insert into templates (name, category, is_premium, price_usd, price_ars)
select 'Side Column', 'minimalist', false, 0, 0
where not exists (select 1 from templates where name = 'Side Column');
