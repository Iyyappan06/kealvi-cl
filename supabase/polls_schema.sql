-- supabase/polls_schema.sql

create table polls (
    id bigint generated always as identity primary key,
    question text not null,
    active boolean default true,
    created_at timestamptz default now()
);

create table poll_options (
    id bigint generated always as identity primary key,
    poll_id bigint references polls(id) on delete cascade,
    option_text text not null
);

create table poll_votes (
    id bigint generated always as identity primary key,
    poll_id bigint references polls(id) on delete cascade,
    option_id bigint references poll_options(id) on delete cascade,
    voter_id text not null,
    created_at timestamptz default now(),

    unique(poll_id, voter_id)
);

create view poll_results as
select
  p.id as poll_id,
  po.id as option_id,
  po.option_text,
  count(v.id) as votes
from poll_options po
left join poll_votes v
on po.id = v.option_id
join polls p
on po.poll_id = p.id
group by
  p.id,
  po.id,
  po.option_text;