-- Run this in the Classic Words Supabase project's SQL Editor.
create table if not exists public.shared_words (
  word text primary key check (word ~ '^[A-Z]{2,15}$'),
  added_at timestamptz not null default now(),
  added_by uuid not null references auth.users(id) on delete cascade
);

alter table public.shared_words enable row level security;
grant select on public.shared_words to anon, authenticated;
grant insert, delete on public.shared_words to authenticated;

drop policy if exists "Anyone can read shared words" on public.shared_words;
create policy "Anyone can read shared words"
  on public.shared_words for select to anon, authenticated using (true);

drop policy if exists "Users add words as themselves" on public.shared_words;
create policy "Users add words as themselves"
  on public.shared_words for insert to authenticated
  with check (added_by = (select auth.uid()));

drop policy if exists "Users remove their own words" on public.shared_words;
create policy "Users remove their own words"
  on public.shared_words for delete to authenticated
  using (added_by = (select auth.uid()));
