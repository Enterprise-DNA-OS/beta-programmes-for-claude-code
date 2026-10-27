#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { parseCsv } from './lib/csv.mjs';
import { table } from './lib/format.mjs';

export const specs={
 help:'',programmes:'',participants:'',activities:'',show:'<programme>', 'show-feedback':'<feedback>', 'show-participant':'<participant>',
 'update-participant':'<participant> --notice= --retain-until= --note= --actor=',
 'renew-agreement':'<programme> --participant= --agreement= --evidence= --accepted= --actor=',
 'beta-week':'','cohort-readiness':'','activity-chase':'','feedback-triage':'','retest-queue':'','exit-review':'',attention:'',compliance:'',
 insights:'[--since=YYYY-MM-DD --until=YYYY-MM-DD]',history:'<programme>',
 'add-programme':'--code= --name= --owner= --objective= --ends= --agreement= --actor=',
 'add-participant':'--code= --name= --segment= --platform= --notice= --retain-until= --actor=',
 enrol:'<programme> --participant= --agreement= --evidence= --accepted= --actor=',
 'add-activity':'<programme> --code= --name= --instructions= --due= --actor=',
 assign:'<activity> --participant= --actor=',
 complete:'<assignment-id> --outcome=completed|blocked --note= --actor=',
 add:'<programme> --code= --title= --description= --kind=issue|idea|praise --severity=critical|high|medium|low [--participant=] --actor=',
 triage:'<feedback> --owner= --severity= --note= --actor=',
 duplicate:'<feedback> --of= --note= --actor=',
 fix:'<feedback> --build= --note= --actor=',
 'request-retest':'<feedback> --tester= --due= --actor=',
 'record-retest':'<retest-id> --outcome=passed|failed --evidence= --date= --actor=',
 resolve:'<feedback> --note= --actor=',
 withdraw:'<participant> --note= --actor=',
 log:'<programme> --note= --actor=',
 'record-decision':'<programme> --decision=hold|go --rationale= --actor=',
 import:'centercode <csv> --programme= --source= --map= --actor= [--dry-run]',
 export:'--out=<new.json>',
 'weekly-review':'', 'draft-test-plan':'<programme>', 'draft-exit-brief':'<programme>'
};
const readSql={
 activities:'select a.code,p.code as programme,a.name,a.instructions,a.due_on from activities a join programmes p on p.id=a.programme_id order by a.code',
 programmes:'select code,name,owner,objective,ends_on,agreement_version from programmes order by code',
 participants:'select code,name,segment,platform,notice_ref,retain_until,withdrawn_on from participants order by code',
 'beta-week':'select * from v_exit order by ends_on,code',
 'cohort-readiness':'select programme,participant,name,segment,platform,eligible,pending_activities,last_active_on,retain_until from v_cohort order by programme,participant',
 'activity-chase':"select * from v_activity_chase where outcome<>'completed' order by due_on,programme,participant",
 'feedback-triage':"select programme,code,title,kind,severity,status,owner,submitted_on from v_feedback where status not in ('closed','duplicate') order by case severity when 'critical' then 0 when 'high' then 1 when 'medium' then 2 else 3 end,submitted_on,code",
 'retest-queue':"select * from v_retests where outcome<>'passed' and current_build order by due_on,id",
 'exit-review':'select * from v_exit order by code',attention:'select * from v_attention order by programme,record,reason',
 compliance:'select * from v_compliance order by rule,record'
};
const allTables=['programmes','participants','enrolments','activities','assignments','feedback','retests','decisions','events','imports'];
const readCommands=new Set([...Object.keys(readSql),'help','show','show-feedback','show-participant','history','insights','weekly-review','export','draft-test-plan','draft-exit-brief']);
const sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const nowDate=()=>new Date().toISOString().slice(0,10);
function parse(args){
 const [command='help',...rest]=args, opts={},pos=[];
 if(!(command in specs))throw Error(`Unknown command ${command}. Run help.`);
 for(const arg of rest){if(!arg.startsWith('--')){pos.push(arg);continue;}const eq=arg.indexOf('=');const k=arg.slice(2,eq<0?undefined:eq);if(k in opts)throw Error(`Repeated option --${k}`);opts[k]=eq<0?true:arg.slice(eq+1);}
 const allowed=new Set(['json',...[...specs[command].matchAll(/--([a-z-]+)/g)].map(m=>m[1])]);
 for(const k of Object.keys(opts))if(!allowed.has(k))throw Error(`Unknown option --${k}`);
 const counts=command==='import'?2:specs[command].startsWith('<')?1:0;
 if(pos.length!==counts)throw Error(`Usage: ${command} ${specs[command]}`);
 if(opts.json!==undefined&&opts.json!==true)throw Error('--json takes no value');
 if(opts['dry-run']!==undefined&&opts['dry-run']!==true)throw Error('--dry-run takes no value');
 return {command,opts,pos};
}
function required(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid calendar date: ${v}`);return v;}
function past(v){date(v);if(v>nowDate())throw Error('Recorded event date cannot be in the future');return v;}
function choice(v,choices){if(!choices.includes(v))throw Error(`Expected ${choices.join('|')}, got ${v}`);return v;}
async function match(db,table,term){
 if(!allTables.includes(table))throw Error('Invalid relation');
 const label=['programmes','participants','activities','feedback'].includes(table)?(table==='feedback'?'title':'name'):null;
 const rows=await db.query(`select * from ${table} where id::text=$1 ${label?'or lower(code)=lower($1)':''}`,[term]);
 if(rows.length===1)return rows[0];
 const candidates=await db.query(`select * from ${table} where starts_with(id::text,$1) ${label?`or position(lower($1) in lower(${label}))>0`:''} order by id`,[term]);
 if(candidates.length===1)return candidates[0];
 if(!candidates.length)throw Error(`No matching ${table}: ${term}`);
 throw Error('Ambiguous match; select one:\n'+candidates.map(r=>`${r.id} ${r.code||''} ${r[label]||''}`).join('\n'));
}
async function enrollment(db,programmeId,personTerm){const p=await match(db,'participants',personTerm);const [e]=await db.query('select * from enrolments where programme_id=$1 and participant_id=$2',[programmeId,p.id]);if(!e)throw Error('Participant is not enrolled in this programme');return e;}
async function eligible(db,e){const [c]=await db.query('select * from v_cohort where id=$1',[e.id]);if(!c.eligible)throw Error('Participant is not eligible: check notice, retention, withdrawal and current agreement evidence');}
async function event(db,programme,action,actor,detail){await db.query('insert into events(programme_id,action,actor,detail) values($1,$2,$3,$4)',[programme,action,actor,JSON.stringify(detail)]);}
async function insert(db,table,row){const keys=Object.keys(row);return (await db.query(`insert into ${table}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(row)))[0];}
function writeFile(dir,name,data){const root=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(root,{recursive:true,mode:0o700});const file=path.join(root,name);fs.writeFileSync(file,data,{flag:'wx',mode:0o600});return file;}
function ready(row){return row.participants>0&&row.activities>0&&row.unassigned_activities===0&&row.blocking_issues===0&&row.unfinished_activities===0&&row.ineligible_participants===0&&row.fixes_unclosed===0;}
export const questions=[
 'Which programmes have high severity issues reported in this date window?',
 'Which tester platforms produced those unresolved issues?',
 'Which participants have overdue activities and no recent activity?',
 'Which fixes are waiting on an overdue retest?',
 'Which current fixes failed their latest retest?',
 'Which programmes have participants whose agreement or privacy records need attention?',
 'Which unresolved issues still have no owner?',
 'Which programmes have finished activities but still have release blockers?',
 'Which programmes are ready for an exit decision under our recorded rules?',
 'Which feedback is marked as duplicate and what original does it refer to?'
];
async function insights(db,o){
 const since=date(o.since||'1900-01-01'),until=date(o.until||nowDate());if(since>until)throw Error('since must not follow until');
 const q=[
 ["select programme,severity,count(*)::int as issues from v_feedback where kind='issue' and severity in ('critical','high') and status not in ('closed','duplicate') and submitted_on between $1 and $2 group by programme,severity order by programme,severity",[since,until]],
 ["select p.code as programme,coalesce(t.platform,'Unmapped') as platform,f.severity,count(*)::int as issues from feedback f join programmes p on p.id=f.programme_id left join enrolments e on e.id=f.enrolment_id left join participants t on t.id=e.participant_id where f.kind='issue' and f.status not in ('closed','duplicate') and f.submitted_on between $1 and $2 group by p.code,t.platform,f.severity order by p.code,platform,f.severity",[since,until]],
 ["select c.programme,c.participant,c.last_active_on,count(*)::int as overdue from v_cohort c join v_activity_chase a on a.programme=c.programme and a.participant=c.participant where a.overdue and (c.last_active_on is null or c.last_active_on<current_date-14) group by c.programme,c.participant,c.last_active_on order by c.programme,c.participant"],
 ["select programme,feedback,tester,build,due_on from v_retests where current_build and outcome='pending' and due_on<current_date order by due_on,feedback"],
 ["select programme,code,title,fix_version from v_feedback where status='fixed' and latest_retest='failed' order by programme,code"],
 ['select programme,participant,agreement_version,retain_until from v_cohort where not eligible order by programme,participant'],
 ["select programme,code,title,severity from v_feedback where kind='issue' and owner='' and status not in ('closed','duplicate') order by programme,code"],
 ['select code,name,blocking_issues from v_exit where unfinished_activities=0 and activities>0 and blocking_issues>0 order by code'],
 ['select code,name,ends_on from v_exit where participants>0 and activities>0 and unassigned_activities=0 and unfinished_activities=0 and blocking_issues=0 and ineligible_participants=0 and fixes_unclosed=0 order by code'],
 ["select p.code as programme,f.code,f.title,o.code as original from feedback f join feedback o on o.id=f.duplicate_of join programmes p on p.id=f.programme_id order by p.code,f.code"]
 ];
 const out=[];for(let i=0;i<q.length;i++)out.push({question:questions[i],rows:await db.query(q[i][0],q[i][1]||[])});return out;
}
async function importFeedback(db,o,pos,actor){
 if(pos[0]!=='centercode')throw Error('Supported import: centercode');
 const programme=await match(db,'programmes',required(o,'programme')),namespace=required(o,'source');
 const mapping=JSON.parse(fs.readFileSync(required(o,'map'),'utf8'));
 const permitted=['id','title','description','kind','severity','submitted_on'];
 for(const k of Object.keys(mapping))if(!permitted.includes(k)||typeof mapping[k]!=='string'||!mapping[k])throw Error(`Invalid mapping field ${k}`);
 if(!mapping.id||!mapping.title)throw Error('Mapping requires id and title');
 const input=fs.readFileSync(pos[1],'utf8'),rows=parseCsv(input);if(!rows.length)throw Error('Empty feedback export');
 for(const header of Object.values(mapping))if(!(header in rows[0]))throw Error(`Mapped column missing: ${header}`);
 const seen=new Set();let added=0,unchanged=0;
 for(const raw of rows){
 const val=k=>mapping[k]?raw[mapping[k]].trim():'';
 const sourceId=val('id'),title=val('title');if(!sourceId||!title)throw Error('Every feedback row requires an id and title');
 if(seen.has(sourceId))throw Error(`Duplicate source id in file: ${sourceId}`);seen.add(sourceId);
 const hash=sha(Object.fromEntries(Object.entries(raw).sort(([a],[b])=>a.localeCompare(b))));
 const [existing]=await db.query('select id,source_hash from feedback where programme_id=$1 and source_namespace=$2 and source_id=$3',[programme.id,namespace,sourceId]);
 if(existing){if(existing.source_hash!==hash)throw Error(`Changed source row ${sourceId}; reconcile before reimporting`);unchanged++;continue;}
 const kind=choice((val('kind')||'issue').toLowerCase(),['issue','idea','praise']);
 const severity=choice((val('severity')||'medium').toLowerCase(),['critical','high','medium','low']);
 await insert(db,'feedback',{code:'IMP-'+sha([programme.id,namespace,sourceId]).slice(0,16),programme_id:programme.id,title,description:val('description'),kind,severity,submitted_on:val('submitted_on')?past(val('submitted_on')):nowDate(),source_namespace:namespace,source_id:sourceId,source_record:JSON.stringify(raw),source_hash:hash});added++;
 }
 await insert(db,'imports',{programme_id:programme.id,namespace,digest:sha(input),added,unchanged,actor});
 await event(db,programme.id,'import',actor,{namespace,added,unchanged});
 return [{added,unchanged,total:rows.length,dry_run:Boolean(o['dry-run']),unmapped_participants:added,source_status:'Preserved only; imported feedback starts new'}];
}
async function execute(db,{command:c,opts:o,pos}){
 if(readSql[c])return db.query(readSql[c]);
 if(c==='help')return Object.entries(specs).map(([command,usage])=>({command,usage}));
 if(c==='show'){const p=await match(db,'programmes',pos[0]);return {programme:p,cohort:await db.query('select * from v_cohort where programme_id=$1 order by participant',[p.id]),feedback:await db.query('select * from v_feedback where programme_id=$1 order by code',[p.id]),exit:(await db.query('select * from v_exit where id=$1',[p.id]))[0]};}
 if(c==='show-feedback'){const f=await match(db,'feedback',pos[0]);return {feedback:f,retests:await db.query('select * from retests where feedback_id=$1 order by created_at,id',[f.id])};}
 if(c==='show-participant'){const p=await match(db,'participants',pos[0]);return {participant:p,enrolments:await db.query('select * from enrolments where participant_id=$1 order by created_at,id',[p.id])};}
 if(c==='history'){const p=await match(db,'programmes',pos[0]);return db.query('select action,actor,detail,created_at from events where programme_id=$1 order by created_at,id',[p.id]);}
 if(c==='insights')return insights(db,o);
 if(c==='weekly-review')return {week:await db.query(readSql['beta-week']),attention:await db.query(readSql.attention),retests:await db.query(readSql['retest-queue'])};
 if(c==='export'){
 const out=path.resolve(required(o,'out'));const tables={};for(const t of allTables)tables[t]=await db.query(`select * from ${t} order by id`);
 fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify({format:'beta-programmes-v1',exported_at:new Date().toISOString(),tables},null,2)+'\n',{flag:'wx',mode:0o600});return [{file:out,relations:allTables.length}];
 }
 if(c.startsWith('draft-')){
 const p=await match(db,'programmes',pos[0]);const info=await execute(db,{command:'show',opts:{},pos:[p.code]});
 const body=`# ${c==='draft-test-plan'?'Test plan':'Exit brief'}: ${p.name}\n\nDraft for review. No release, sending or participant invitation has occurred.\n\nObjective: ${p.objective}\nOwner: ${p.owner}\nEnd date: ${p.ends_on}\n\n${JSON.stringify(info,null,2)}\n`;
 return [{file:writeFile('drafts',`${c}-${p.code.replace(/[^a-z0-9-]/gi,'-')}-${randomUUID()}.md`,body)}];
 }
 const actor=required(o,'actor');let row,programmeId=null;
 if(c==='import')return importFeedback(db,o,pos,actor);
 if(c==='add-programme'){
 row=await insert(db,'programmes',{code:required(o,'code'),name:required(o,'name'),owner:required(o,'owner'),objective:required(o,'objective'),ends_on:date(required(o,'ends')),agreement_version:required(o,'agreement')});programmeId=row.id;
 }else if(c==='add-participant'){
 row=await insert(db,'participants',{code:required(o,'code'),name:required(o,'name'),segment:required(o,'segment'),platform:required(o,'platform'),notice_ref:required(o,'notice'),retain_until:date(required(o,'retain-until'))});
  }else if(c==='update-participant'){
 const p=await match(db,'participants',pos[0]);required(o,'note');row=(await db.query('update participants set notice_ref=$2,retain_until=$3 where id=$1 returning *',[p.id,required(o,'notice'),date(required(o,'retain-until'))]))[0];
 }else if(c==='withdraw'){
 const p=await match(db,'participants',pos[0]);required(o,'note');row=(await db.query('update participants set withdrawn_on=current_date where id=$1 returning *',[p.id]))[0];
 }else if(['enrol','renew-agreement','add-activity','add','log','record-decision'].includes(c)){
 const p=await match(db,'programmes',pos[0]);programmeId=p.id;
 if(c==='renew-agreement'){
 const e=await enrollment(db,p.id,required(o,'participant'));
 row=(await db.query('update enrolments set agreement_version=$2,evidence_ref=$3,accepted_on=$4 where id=$1 returning *',[e.id,required(o,'agreement'),required(o,'evidence'),past(required(o,'accepted'))]))[0];
 }else if(c==='enrol'){
 const participant=await match(db,'participants',required(o,'participant'));
 row=await insert(db,'enrolments',{programme_id:p.id,participant_id:participant.id,agreement_version:required(o,'agreement'),evidence_ref:required(o,'evidence'),accepted_on:past(required(o,'accepted'))});
 }else if(c==='add-activity')row=await insert(db,'activities',{programme_id:p.id,code:required(o,'code'),name:required(o,'name'),instructions:required(o,'instructions'),due_on:date(required(o,'due'))});
 else if(c==='add'){
 const e=o.participant?await enrollment(db,p.id,o.participant):null;
 row=await insert(db,'feedback',{programme_id:p.id,enrolment_id:e?.id||null,code:required(o,'code'),title:required(o,'title'),description:required(o,'description'),kind:choice(required(o,'kind'),['issue','idea','praise']),severity:choice(required(o,'severity'),['critical','high','medium','low'])});
 if(e)await db.query('update enrolments set last_active_on=current_date where id=$1',[e.id]);
 }else if(c==='log'){row={programme:p.code,note:required(o,'note')};}
 else{
 const decision=choice(required(o,'decision'),['hold','go']);const [snapshot]=await db.query('select * from v_exit where id=$1',[p.id]);
 if(decision==='go'&&!ready(snapshot))throw Error('Exit decision blocked: review open issues, activities, participants and retests');
 row=await insert(db,'decisions',{programme_id:p.id,decision,actor,rationale:required(o,'rationale'),snapshot:JSON.stringify(snapshot)});
 }
 }else if(c==='assign'){
 const a=await match(db,'activities',pos[0]);programmeId=a.programme_id;const e=await enrollment(db,programmeId,required(o,'participant'));await eligible(db,e);
 row=await insert(db,'assignments',{activity_id:a.id,enrolment_id:e.id});
 }else if(c==='complete'){
 const a=await match(db,'assignments',pos[0]);const [e]=await db.query('select * from enrolments where id=$1',[a.enrolment_id]);await eligible(db,e);programmeId=e.programme_id;
 row=(await db.query('update assignments set outcome=$2,note=$3,completed_on=current_date where id=$1 returning *',[a.id,choice(required(o,'outcome'),['completed','blocked']),required(o,'note')]))[0];
 await db.query('update enrolments set last_active_on=current_date where id=$1',[e.id]);
 }else if(c==='record-retest'){
 const r=await match(db,'retests',pos[0]);const [f]=await db.query('select * from feedback where id=$1',[r.feedback_id]);programmeId=f.programme_id;
 if(past(required(o,'date'))<new Date(r.created_at).toISOString().slice(0,10))throw Error('Retest date precedes its request');
 if(r.outcome!=='pending')throw Error('Retest already recorded; request another retest');
 if(f.status!=='fixed'||r.build!==f.fix_version)throw Error('Retest is not for the current fix');
 row=(await db.query('update retests set outcome=$2,evidence_ref=$3,tested_on=$4 where id=$1 returning *',[r.id,choice(required(o,'outcome'),['passed','failed']),required(o,'evidence'),past(required(o,'date'))]))[0];
 }else{
 const f=await match(db,'feedback',pos[0]);programmeId=f.programme_id;
 if(['closed','duplicate'].includes(f.status))throw Error('Feedback is closed; create a new linked report');
 if(c==='triage')row=(await db.query("update feedback set owner=$2,severity=$3,status=case when status='new' then 'triaged' else status end where id=$1 returning *",[f.id,required(o,'owner'),choice(required(o,'severity'),['critical','high','medium','low'])]))[0];
 else if(c==='duplicate'){
 const original=await match(db,'feedback',required(o,'of'));
 if(original.id===f.id||original.programme_id!==programmeId||original.status==='duplicate')throw Error('Duplicate target must be another original in the same programme');
 if((await db.query('select id from feedback where duplicate_of=$1',[f.id])).length)throw Error('Cannot turn a canonical original into a duplicate');
 row=(await db.query("update feedback set duplicate_of=$2,status='duplicate' where id=$1 returning *",[f.id,original.id]))[0];
 }else if(c==='fix'){
 if(f.kind!=='issue'||!f.owner)throw Error('Triage an issue to an owner before recording a fix');
 const build=required(o,'build');if(build===f.fix_version)throw Error('Use a new build identifier for a revised fix');
 row=(await db.query("update feedback set fix_version=$2,status='fixed' where id=$1 returning *",[f.id,build]))[0];
 }else if(c==='request-retest'){
 if(f.status!=='fixed')throw Error('Record the fix first');
 row=await insert(db,'retests',{feedback_id:f.id,tester:required(o,'tester'),build:f.fix_version,due_on:date(required(o,'due'))});
 }else if(c==='resolve'){
 if(f.kind==='issue'){
 const [v]=await db.query('select * from v_feedback where id=$1',[f.id]);
 if(f.status!=='fixed'||v.latest_retest!=='passed'||v.retests_pending!==0)throw Error('A current fix needs a passed latest retest and no pending retests');
 }
 row=(await db.query("update feedback set status='closed' where id=$1 returning *",[f.id]))[0];
 }else throw Error(`Unhandled command ${c}`);
 if(c!=='request-retest')required(o,'note');
 }
 await event(db,programmeId,c,actor,{record_id:row.id||null,note:o.note||o.rationale||'',...(c==='log'?{note:row.note}:{})});
 return [row];
}
export async function run(db,args){
 const request=parse(args),writes=!readCommands.has(request.command);
 await db.exec(writes?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{const result=await execute(db,request);await db.exec(request.opts['dry-run']?'ROLLBACK':'COMMIT');return result;}
 catch(e){await db.exec('ROLLBACK');throw e;}
}
function human(value){
 if(value==null)return "";
 if(typeof value!=="object")return String(value);
 if(Array.isArray(value)){
 if(!value.length)return '(none)';
 if(value[0]?.question)return value.map(v=>v.question+'\n'+human(v.rows)).join('\n\n');
 const keys=Object.keys(value[0]).filter(k=>!['id','programme_id','source_record','source_hash','created_at','updated_at'].includes(k));
 const cell=v=>typeof v==='object'?JSON.stringify(v):String(v??'');
 return table(value,keys.map(key=>({key,label:key.replaceAll('_',' '),width:70,format:v=>cell(v).replace(/\n/g,' ')}))); 
 }
 return Object.entries(value).map(([k,v])=>k+'\n'+(typeof v==='object'?human(v):String(v))).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();const args=process.argv.slice(2);const result=await run(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):human(result));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
