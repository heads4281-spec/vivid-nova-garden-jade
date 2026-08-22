create table if not exists sovereign_saves (
  user_id text primary key,
  code text not null default '63821',
  runes text not null default '[]',
  skills text not null default '["ember-fortitude"]',
  skill_pts integer not null default 2,
  character_id text not null default 'warden',
  updated_at timestamptz not null default now()
);
create index if not exists sovereign_saves_user_id_idx on sovereign_saves (user_id);
