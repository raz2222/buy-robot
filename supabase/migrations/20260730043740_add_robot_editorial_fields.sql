-- Adds the editorial fields the product-page summary box needs (section 6
-- of the portal brief): a one-line verdict, who it's for / not for,
-- maintenance cost, warranty, and the tag arrays for future comparison and
-- calculator use. All nullable and additive — no existing row, query, or
-- component breaks if a value isn't filled in yet.
alter table public.robots
  add column if not exists verdict text,
  add column if not exists best_for text[] not null default '{}',
  add column if not exists not_for text[] not null default '{}',
  add column if not exists maintenance_cost text,
  add column if not exists warranty text,
  add column if not exists spare_parts_availability text,
  add column if not exists comparison_tags text[] not null default '{}',
  add column if not exists calculator_tags text[] not null default '{}';
