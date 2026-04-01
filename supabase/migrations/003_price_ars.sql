-- Agrega precio en ARS para MercadoPago (LATAM)
alter table templates add column if not exists price_ars numeric(7, 2) not null default 0;

-- Actualizar plantillas premium con precio de prueba
update templates set price_ars = 300 where is_premium = true;
