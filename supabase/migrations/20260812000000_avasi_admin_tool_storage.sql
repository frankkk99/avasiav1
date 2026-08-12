create table if not exists public.avasi_tool_runs (
  id uuid primary key default gen_random_uuid(),
  tool text not null,
  mode text,
  source_url text,
  final_url text,
  status text not null default 'started',
  item_count integer not null default 0,
  result jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avasi_tool_runs_created_at_idx
  on public.avasi_tool_runs (created_at desc);

create index if not exists avasi_tool_runs_tool_idx
  on public.avasi_tool_runs (tool, created_at desc);

create table if not exists public.avasi_catalog_items (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  run_id uuid references public.avasi_tool_runs(id) on delete set null,
  source_url text,
  api_url text not null,
  api_status integer,
  api_elapsed_ms integer,
  external_id text,
  movie_code text,
  name text not null default '',
  slug text,
  type_name text,
  year text,
  quality text,
  duration text,
  poster_url text,
  thumb_url text,
  player_url text,
  raw_data jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avasi_catalog_items_updated_at_idx
  on public.avasi_catalog_items (updated_at desc);

create index if not exists avasi_catalog_items_type_year_idx
  on public.avasi_catalog_items (type_name, year);

alter table public.avasi_tool_runs enable row level security;
alter table public.avasi_catalog_items enable row level security;

revoke all on table public.avasi_tool_runs from anon, authenticated;
revoke all on table public.avasi_catalog_items from anon, authenticated;

grant select, insert, update, delete on table public.avasi_tool_runs to service_role;
grant select, insert, update, delete on table public.avasi_catalog_items to service_role;
