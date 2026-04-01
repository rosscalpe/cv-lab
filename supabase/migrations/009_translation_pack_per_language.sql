-- Reemplaza el Translation Pack único por dos packs separados por idioma

-- Ampliar el check constraint de category para incluir 'addon'
alter table templates drop constraint if exists templates_category_check;
alter table templates add constraint templates_category_check
  check (category in ('modern', 'classic', 'creative', 'minimalist', 'addon'));

-- Insertar Translation Pack EN
insert into templates (name, category, is_premium, price_usd, price_ars)
select 'Translation Pack EN', 'addon', true, 1, 1000
where not exists (select 1 from templates where name = 'Translation Pack EN');

-- Insertar Translation Pack PT
insert into templates (name, category, is_premium, price_usd, price_ars)
select 'Translation Pack PT', 'addon', true, 1, 1000
where not exists (select 1 from templates where name = 'Translation Pack PT');

-- Migrar accesos del pack viejo a los dos nuevos
insert into user_template_access (user_id, template_id)
select uta.user_id, t_en.id
from user_template_access uta
join templates t_old on t_old.id = uta.template_id and t_old.name = 'Translation Pack'
join templates t_en on t_en.name = 'Translation Pack EN'
on conflict do nothing;

insert into user_template_access (user_id, template_id)
select uta.user_id, t_pt.id
from user_template_access uta
join templates t_old on t_old.id = uta.template_id and t_old.name = 'Translation Pack'
join templates t_pt on t_pt.name = 'Translation Pack PT'
on conflict do nothing;

-- Eliminar el pack viejo y sus accesos
delete from user_template_access
where template_id = (select id from templates where name = 'Translation Pack');

delete from templates where name = 'Translation Pack';
