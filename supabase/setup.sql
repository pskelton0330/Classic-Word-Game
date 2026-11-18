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

-- Shared pass-and-play results. Each completed game contributes one row per player.
create table if not exists public.game_results (
  game_id text not null,
  player_index smallint not null check (player_index between 0 and 3),
  player_name text not null check (char_length(player_name) between 1 and 40),
  final_score integer not null,
  moves_count integer not null default 0,
  words_played integer not null default 0,
  highest_turn_score integer not null default 0,
  highest_turn_words text[] not null default '{}',
  is_winner boolean not null default false,
  completed_at timestamptz not null,
  added_by uuid not null references auth.users(id) on delete cascade,
  primary key (game_id, player_index)
);

create index if not exists game_results_high_score_idx
  on public.game_results (final_score desc, completed_at asc);
create index if not exists game_results_best_turn_idx
  on public.game_results (highest_turn_score desc, completed_at asc)
  where highest_turn_score > 0;

alter table public.game_results enable row level security;
grant select on public.game_results to anon, authenticated;
grant insert on public.game_results to authenticated;

drop policy if exists "Anyone can read game results" on public.game_results;
create policy "Anyone can read game results"
  on public.game_results for select to anon, authenticated using (true);

drop policy if exists "Users add game results as themselves" on public.game_results;
create policy "Users add game results as themselves"
  on public.game_results for insert to authenticated
  with check (added_by = (select auth.uid()));
