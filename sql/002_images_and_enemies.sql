-- Rode no SQL Editor do Supabase (depois do supabase_setup.sql).

-- 1) coluna de imagem
alter table death_causes add column if not exists image_url text;

-- 2) bucket público para as imagens
insert into storage.buckets (id, name, public)
values ('enemies', 'enemies', true)
on conflict (id) do nothing;

-- 3) inimigos que ainda não mataram ele (lista parcial; adicione mais quando quiser)
insert into death_causes (type, detail) values
  ('Boss', 'Gaping Dragon'),
  ('Boss', 'Pinwheel'),
  ('Boss', 'Crossbreed Priscilla'),
  ('Boss', 'Centipede Demon'),
  ('Boss', 'Gravelord Nito'),
  ('Boss', 'Black Dragon Kalameet'),
  ('NPC', 'Blowdart Sniper'),
  ('NPC', 'Bounding Demon of Izalith'),
  ('NPC', 'Chaos Eater'),
  ('NPC', 'Chaos Slime'),
  ('NPC', 'Crystal Golem'),
  ('NPC', 'Gargoyle'),
  ('NPC', 'Hellkite Drake'),
  ('NPC', 'Mimic'),
  ('NPC', 'Mushroom Child'),
  ('NPC', 'Mushroom Parent'),
  ('NPC', 'Pisaca'),
  ('NPC', 'Sentinel'),
  ('NPC', 'Silver Knight'),
  ('NPC', 'Silver Knight Archer')
on conflict (type, detail) do nothing;
