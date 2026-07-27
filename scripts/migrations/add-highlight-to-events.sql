-- Add highlight column to events table
alter table events add column if not exists highlight boolean not null default false;

-- Ensure only one event can be highlighted at a time
create unique index if not exists idx_events_single_highlight on events(highlight) where highlight = true;
