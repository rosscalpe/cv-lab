-- Actualiza precio ARS de plantillas premium a $2000
update templates set price_ars = 2000 where is_premium = true;
