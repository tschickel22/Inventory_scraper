-- MH Catalog schema (RLS OFF during build)
create table if not exists mh_manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  website text,
  notes text
);

create table if not exists mh_series (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid references mh_manufacturers(id) on delete cascade,
  name text not null,
  description text,
  unique (manufacturer_id, name)
);

create table if not exists mh_models (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid references mh_manufacturers(id) on delete cascade,
  series_id uuid references mh_series(id),
  model_code text,
  model_name text not null,
  build_type text,
  sections int,
  beds int,
  baths numeric(3,1),
  width_ft int,
  length_ft int,
  sqft int,
  year int,
  wind_zone text,
  roof_load text,
  base_msrp numeric,
  description text,
  source_url text not null unique,
  source_brand text,
  hash text
);

create table if not exists mh_media (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references mh_models(id) on delete cascade,
  kind text not null check (kind in ('image','floorplan','brochure_pdf','line_drawing','tour_3d')),
  url text not null,
  title text,
  alt text,
  width int,
  height int,
  checksum text
);

create table if not exists mh_specs (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references mh_models(id) on delete cascade,
  key text,
  value text
);

-- Helpful indexes
create index if not exists idx_models_name on mh_models (model_name);
create index if not exists idx_models_beds on mh_models (beds);
create index if not exists idx_models_sqft on mh_models (sqft);