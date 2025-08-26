insert into mh_manufacturers (name, website)
values ('DevManufacturer', 'https://example.com')
on conflict (name) do nothing;

with m as (
  select id from mh_manufacturers where name='DevManufacturer'
)
insert into mh_models (manufacturer_id, model_name, build_type, beds, baths, sqft, source_url, description)
select m.id, 'Dev Home 123', 'manufactured', 3, 2, 1200, 'https://example.com/dev-home-123', 'Seeded dev model'
from m
on conflict (source_url) do nothing;

insert into mh_media (model_id, kind, url, title)
select id, 'image', 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200', 'Hero'
from mh_models where source_url='https://example.com/dev-home-123'
on conflict do nothing;