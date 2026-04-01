-- ─────────────────────────────────────────────────────────────────────────────
-- ResumeFlow — Storage: avatars bucket + RLS policies
-- Ejecutar en Supabase SQL Editor o via `supabase db push`
-- Seguro re-ejecutar (DROP IF EXISTS antes de cada CREATE)
-- ─────────────────────────────────────────────────────────────────────────────

-- Crear bucket avatars (público: las photo_url son accesibles sin auth)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Limpiar políticas anteriores para poder re-crear sin conflictos
drop policy if exists "Avatar images are publicly readable"   on storage.objects;
drop policy if exists "Users can upload their own avatar"      on storage.objects;
drop policy if exists "Users can update their own avatar"      on storage.objects;
drop policy if exists "Users can delete their own avatar"      on storage.objects;

-- SELECT: acceso público (el bucket es público, los thumbnails deben ser visibles)
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- INSERT: el primer segmento del path debe ser el UUID del usuario autenticado
-- Estructura de path: {user_id}/avatar.{ext}
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: solo puede modificar sus propios archivos
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: solo puede borrar sus propios archivos
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
