-- Parcela — accounts: saved projects and the AI daily limit.
-- Run once in the Supabase SQL editor (safe to re-run).
--
-- Sign-in itself is Supabase Auth (email magic link); this only adds the
-- tables that hang off auth.users. Row Level Security keeps every row
-- private to the user who owns it — the browser's anon key can't read or
-- write anyone else's.

create table if not exists saved_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cadastral text not null,
  address text,
  municipality text,
  project_type text,
  units text,
  investment text,
  -- Snapshot of the analysis when saved (feasibility headline, finding
  -- counts, district), so the Projects list renders without re-running
  -- every lookup.
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cadastral)
);

alter table saved_projects enable row level security;

drop policy if exists "saved_projects: owner reads" on saved_projects;
create policy "saved_projects: owner reads" on saved_projects
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "saved_projects: owner inserts" on saved_projects;
create policy "saved_projects: owner inserts" on saved_projects
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "saved_projects: owner updates" on saved_projects;
create policy "saved_projects: owner updates" on saved_projects
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "saved_projects: owner deletes" on saved_projects;
create policy "saved_projects: owner deletes" on saved_projects
  for delete to authenticated using (user_id = auth.uid());

-- ---------- AI explanations: 20 per user per day ----------
-- No policies on ai_usage: nobody reads or writes it directly. The only way
-- in is claim_ai_credit(), which the /api/explain function calls with the
-- signed-in user's token before every AI request.

create table if not exists ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);

alter table ai_usage enable row level security;

create or replace function claim_ai_credit()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  daily_limit constant integer := 20;
  uid uuid := auth.uid();
  n integer;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  insert into ai_usage (user_id, day, count)
  values (uid, current_date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
  returning count into n;

  if n > daily_limit then
    update ai_usage set count = daily_limit where user_id = uid and day = current_date;
    return json_build_object('allowed', false, 'remaining', 0, 'limit', daily_limit);
  end if;

  return json_build_object('allowed', true, 'remaining', daily_limit - n, 'limit', daily_limit);
end;
$$;

revoke all on function claim_ai_credit() from public, anon;
grant execute on function claim_ai_credit() to authenticated;
