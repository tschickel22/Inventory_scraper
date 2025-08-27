-- Scrape job queue (RLS off for dev; add policies later)
create table if not exists mh_scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                    -- e.g. 'cavco'
  "limit" int default 800,
  concurrency int default 4,
  delay int default 400,
  status text not null default 'queued',   -- queued|running|success|error
  log text,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz
);

alter table mh_scrape_jobs disable row level security;

create index if not exists idx_mh_scrape_jobs_status_created on mh_scrape_jobs (status, created_at desc);
