-- Module 6: limits on uploads, and today's AI spend added up by the database.

-- Images only, 2 MB. Stops mistakes and honest uploads. It can't stop a liar:
-- the type is whatever the uploader claims, so app/u/[...path]/route.ts decides
-- what actually gets served.
update storage.buckets
  set file_size_limit = 2097152,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
  where id = 'avatars';

-- Your uploads go in your own folder, and nobody else's.
drop policy "Logged in users can upload avatars" on storage.objects;
drop policy "Logged in users can update avatars" on storage.objects;

create policy "Users can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users can replace their own uploads"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- Add it up here, not in the app: a select only returns the first 1,000 rows,
-- so a sum in the app stops growing right when it matters.
create function public.ai_spend_today()
  returns numeric
  language sql
  stable
  set search_path = ''
as $$
  select coalesce(sum(cost_cents), 0)
  from public.ai_usage
  where created_at >= date_trunc('day', now());
$$;

revoke execute on function public.ai_spend_today() from public, anon, authenticated;
