create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=clock_timestamp(); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'History is append-only'; end $$;
create table programmes (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, owner text not null,
 objective text not null, ends_on date not null, agreement_version text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table participants (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, segment text not null,
 platform text not null, notice_ref text not null default '', retain_until date not null,
 withdrawn_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table enrolments (
 id uuid primary key default gen_random_uuid(), programme_id uuid not null references programmes,
 participant_id uuid not null references participants, agreement_version text not null default '',
 evidence_ref text not null default '', accepted_on date, last_active_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(programme_id,participant_id)
);
create table activities (
 id uuid primary key default gen_random_uuid(), code text not null unique, programme_id uuid not null references programmes,
 name text not null, instructions text not null, due_on date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table assignments (
 id uuid primary key default gen_random_uuid(), activity_id uuid not null references activities,
 enrolment_id uuid not null references enrolments, outcome text not null default 'pending' check(outcome in ('pending','completed','blocked')),
 note text not null default '', completed_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),unique(activity_id,enrolment_id)
);
create table feedback (
 id uuid primary key default gen_random_uuid(), code text not null unique, programme_id uuid not null references programmes,
 enrolment_id uuid references enrolments, title text not null, description text not null default '',
 kind text not null check(kind in ('issue','idea','praise')),
 severity text not null default 'medium' check(severity in ('critical','high','medium','low')),
 status text not null default 'new' check(status in ('new','triaged','fixed','closed','duplicate')),
 owner text not null default '', submitted_on date not null default current_date,
 fix_version text not null default '', duplicate_of uuid references feedback,
 source_namespace text, source_id text, source_record jsonb, source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(programme_id,source_namespace,source_id), check(duplicate_of is null or duplicate_of<>id),
 check((status='duplicate')=(duplicate_of is not null))
);
create table retests (
 id uuid primary key default gen_random_uuid(), feedback_id uuid not null references feedback,
 tester text not null, build text not null, due_on date not null,
 outcome text not null default 'pending' check(outcome in ('pending','passed','failed')),
 evidence_ref text not null default '', tested_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table decisions (
 id uuid primary key default gen_random_uuid(), programme_id uuid not null references programmes,
 decision text not null check(decision in ('hold','go')), actor text not null, rationale text not null, snapshot jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table events (
 id uuid primary key default gen_random_uuid(), programme_id uuid references programmes,
 action text not null, actor text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), programme_id uuid not null references programmes,
 namespace text not null, digest text not null, added integer not null, unchanged integer not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index programmes_code_ci on programmes(lower(code));
create unique index participants_code_ci on participants(lower(code));
create unique index activities_code_ci on activities(lower(code));
create unique index feedback_code_ci on feedback(lower(code));
create index enrolments_participant on enrolments(participant_id);
create index activities_programme on activities(programme_id);
create index assignments_enrolment on assignments(enrolment_id);
create index feedback_enrolment on feedback(enrolment_id);
create index feedback_duplicate on feedback(duplicate_of);
create index retests_feedback on retests(feedback_id);
create index decisions_programme on decisions(programme_id);
create index events_programme on events(programme_id);
create index imports_programme on imports(programme_id);
create index feedback_open on feedback(programme_id,submitted_on) where status not in ('closed','duplicate');
-- Cross-programme links must be rejected even for direct database writes.
create function same_programme() returns trigger language plpgsql as $$
begin
 if tg_table_name='assignments' then
  if (select programme_id from activities where id=new.activity_id) is distinct from (select programme_id from enrolments where id=new.enrolment_id) then raise exception 'Cross-programme assignment'; end if;
 elsif tg_table_name='feedback' then
  if new.enrolment_id is not null and new.programme_id is distinct from (select programme_id from enrolments where id=new.enrolment_id) then raise exception 'Cross-programme participant'; end if;
  if new.duplicate_of is not null and new.programme_id is distinct from (select programme_id from feedback where id=new.duplicate_of) then raise exception 'Cross-programme duplicate'; end if;
 end if;
 return new;
end $$;
create trigger same_programme before insert or update on assignments for each row execute function same_programme();
create trigger same_programme before insert or update on feedback for each row execute function same_programme();
do $$ declare t text; role_name text; begin
 foreach t in array array['programmes','participants','enrolments','activities','assignments','feedback','retests','decisions','events','imports'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 foreach role_name in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=role_name) then execute format('revoke all on %I from %I',t,role_name); end if;
 end loop;
 if t in ('decisions','events','imports') then
 execute format('create trigger frozen before update or delete on %I for each row execute function immutable_record()',t);
 else execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t); end if;
 end loop;
end $$;
create view v_cohort with (security_invoker=true) as
 select e.id,e.programme_id,p.code as programme,t.code as participant,t.name,t.segment,t.platform,
 e.agreement_version,e.accepted_on,e.last_active_on,t.retain_until,t.withdrawn_on,
 (e.agreement_version=p.agreement_version and e.evidence_ref<>'' and e.accepted_on<=current_date
  and t.notice_ref<>'' and t.retain_until>=current_date and t.withdrawn_on is null) is true as eligible,
 (select count(*)::int from assignments a where a.enrolment_id=e.id and a.outcome='pending') as pending_activities
 from enrolments e join programmes p on p.id=e.programme_id join participants t on t.id=e.participant_id;
create view v_activity_chase with (security_invoker=true) as
 select a.id,p.code as programme,t.code as participant,t.name as tester,c.code as activity,c.name,c.due_on,a.outcome,a.note,
 (c.due_on<current_date and a.outcome<>'completed') as overdue
 from assignments a join activities c on c.id=a.activity_id join programmes p on p.id=c.programme_id
 join enrolments e on e.id=a.enrolment_id join participants t on t.id=e.participant_id;
create view v_feedback with (security_invoker=true) as
 select f.id,f.programme_id,p.code as programme,f.code,f.title,f.kind,f.severity,f.status,f.owner,f.submitted_on,f.fix_version,
 (select count(*)::int from retests r where r.feedback_id=f.id and r.build=f.fix_version and r.outcome='pending') as retests_pending,
 (select r.outcome from retests r where r.feedback_id=f.id and r.build=f.fix_version and r.outcome<>'pending' order by r.updated_at desc,r.id limit 1) as latest_retest
 from feedback f join programmes p on p.id=f.programme_id;
create view v_retests with (security_invoker=true) as
 select r.id,p.code as programme,f.code as feedback,f.title,r.tester,r.build,r.due_on,r.outcome,r.evidence_ref,r.tested_on,
 (r.build=f.fix_version) as current_build
 from retests r join feedback f on f.id=r.feedback_id join programmes p on p.id=f.programme_id;
create view v_exit with (security_invoker=true) as
 select p.id,p.code,p.name,p.owner,p.ends_on,
 (select count(*)::int from feedback f where f.programme_id=p.id and f.status not in ('closed','duplicate') and f.kind='issue' and f.severity in ('critical','high')) as blocking_issues,
 (select count(*)::int from assignments a join activities c on c.id=a.activity_id where c.programme_id=p.id and a.outcome<>'completed') as unfinished_activities,
 (select count(*)::int from v_cohort c where c.programme_id=p.id and not c.eligible) as ineligible_participants,
 (select count(*)::int from v_feedback f where f.programme_id=p.id and f.status='fixed') as fixes_unclosed,
 (select count(*)::int from enrolments e where e.programme_id=p.id) as participants,
 (select count(*)::int from activities c where c.programme_id=p.id) as activities,
 (select count(*)::int from activities c where c.programme_id=p.id and not exists(select 1 from assignments a where a.activity_id=c.id)) as unassigned_activities
 from programmes p;
create view v_compliance with (security_invoker=true) as
 select t.code as record,'NZ-IPP9' as rule,'Retention review date passed' as finding from participants t where retain_until<current_date
 union all select code,'NZ-IPP3','No collection notice reference recorded' from participants where notice_ref=''
 union all select participant,'LOCAL-AGREEMENT','Current agreement evidence missing or participation withdrawn' from v_cohort where not eligible;
create view v_attention with (security_invoker=true) as
 select programme,activity as record,'Activity overdue: '||participant as reason from v_activity_chase where overdue
 union all select programme,code,'High severity issue open' from v_feedback where kind='issue' and severity in ('critical','high') and status not in ('closed','duplicate')
 union all select programme,participant,'No activity in 14 days' from v_cohort where withdrawn_on is null and (last_active_on is null or last_active_on<current_date-14)
 union all select programme,feedback,'Retest overdue' from v_retests where current_build and outcome='pending' and due_on<current_date;
do $$ declare v text; role_name text; begin
 foreach v in array array['v_cohort','v_activity_chase','v_feedback','v_retests','v_exit','v_compliance','v_attention'] loop
 execute format('revoke all on %I from public',v);
 foreach role_name in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=role_name) then execute format('revoke all on %I from %I',v,role_name); end if;
 end loop; end loop;
end $$;
