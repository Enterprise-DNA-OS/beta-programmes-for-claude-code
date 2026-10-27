insert into programmes(id,code,name,owner,objective,ends_on,agreement_version) values
 ('10000000-0000-0000-0000-000000000001','BETA-1','Harbour inventory beta','Mara','Validate stock counts across three device groups',current_date+7,'v2'),
 ('10000000-0000-0000-0000-000000000002','BETA-2','Harbour dispatch beta','Ari','Check dispatch confirmation before general release',current_date+21,'v1') on conflict do nothing;
insert into participants(id,code,name,segment,platform,notice_ref,retain_until) values
 ('20000000-0000-0000-0000-000000000001','P-01','Tester North','Warehouse','Android','internal://notice/v1',current_date+90),
 ('20000000-0000-0000-0000-000000000002','P-02','Tester South','Warehouse','iOS','',current_date-3),
 ('20000000-0000-0000-0000-000000000003','P-03','Tester West','Office','Web','internal://notice/v1',current_date+90) on conflict do nothing;
insert into enrolments(id,programme_id,participant_id,agreement_version,evidence_ref,accepted_on,last_active_on) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','v2','internal://acceptance/1',current_date-21,current_date-2),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','v1','internal://acceptance/2',current_date-30,current_date-20),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','v1','internal://acceptance/3',current_date-7,current_date-1) on conflict do nothing;
insert into activities(id,code,programme_id,name,instructions,due_on) values
 ('40000000-0000-0000-0000-000000000001','ACT-1','10000000-0000-0000-0000-000000000001','Count a mixed pallet','Count the sample pallet and compare the saved total',current_date-2),
 ('40000000-0000-0000-0000-000000000002','ACT-2','10000000-0000-0000-0000-000000000002','Confirm dispatch','Confirm a demo consignment and verify the reference',current_date+4) on conflict do nothing;
insert into assignments(id,activity_id,enrolment_id,outcome,note,completed_on) values
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','completed','Count matched',current_date-3),
 ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','blocked','Older device could not save',null),
 ('50000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','pending','',null) on conflict do nothing;
insert into feedback(id,code,programme_id,enrolment_id,title,description,kind,severity,status,owner,submitted_on,fix_version) values
 ('60000000-0000-0000-0000-000000000001','FB-01','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','Count resets after reconnect','Saved count returns to zero on older phone','issue','high','triaged','Ari',current_date-6,''),
 ('60000000-0000-0000-0000-000000000002','FB-02','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Count label cut off','Label wraps on narrow view','issue','medium','fixed','Mara',current_date-4,'0.9.2'),
 ('60000000-0000-0000-0000-000000000003','FB-03','10000000-0000-0000-0000-000000000002',null,'Dispatch filter by carrier','Add a carrier selector','idea','low','new','',current_date-1,''),
 ('60000000-0000-0000-0000-000000000004','FB-04','10000000-0000-0000-0000-000000000002',null,'Dispatch summary is clear','Reference easy to find','praise','low','new','',current_date,'') on conflict do nothing;
insert into retests(id,feedback_id,tester,build,due_on) values
 ('70000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Tester North','0.9.2',current_date-1) on conflict do nothing;
