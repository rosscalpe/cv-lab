-- Amplía el límite del resumen profesional de 400 a 800 caracteres
alter table profiles
  drop constraint if exists profiles_summary_check;

alter table profiles
  add constraint profiles_summary_check check (char_length(summary) <= 800);
