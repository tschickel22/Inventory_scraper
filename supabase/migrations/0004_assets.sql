create table if not exists mh_assets (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references mh_models(id) on delete cascade,
  type text not null check (type in ('photo','floorplan','brochure')),
  url text not null,
  width int,
  height int,
  alt text,
  is_primary boolean default false,
  sort int default 0,
  created_at timestamptz default now(),
  unique (model_id, url)
);
create index if not exists idx_mh_assets_model_type on mh_assets(model_id, type, sort);

-- Helpful unique to dedupe models by page
do $$ begin
  if not exists (select 1 from pg_indexes where indexname='uniq_mh_models_source') then
    create unique index uniq_mh_models_source on mh_models((lower(source_url)));
  end if;
end $$;
