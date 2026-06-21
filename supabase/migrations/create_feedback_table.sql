-- Table des avis / commentaires utilisateurs
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  full_name   text not null default 'Anonyme',
  rating      integer not null check (rating between 1 and 5),
  comment     text not null,
  created_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Lecture publique (tous les avis sont visibles)
create policy "feedback_select_all" on public.feedback
  for select using (true);

-- Insertion : authentifié ou anonyme autorisé
create policy "feedback_insert" on public.feedback
  for insert with check (true);
