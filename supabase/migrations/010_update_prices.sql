-- Actualiza precios: plantillas premium a $5000, packs de traducción a $3000
UPDATE templates SET price_ars = 5000 WHERE is_premium = true AND category != 'addon';
UPDATE templates SET price_ars = 3000 WHERE category = 'addon';
