INSERT INTO users (id,verified,presenter,email,password_hash,student_id,full_name)
VALUES (1,true,false,'jason@lol.com','$2a$10$sBL3CYJwA.tADgLRsm0QMesAjOB3.vnsO2Whf7qPyJcK.Wt5qkZYi',100529393,'Jason R');

INSERT INTO invitation_lists 
VALUES (1,1,'Jasons Subject');

INSERT INTO invitation_list_members
VALUES (1,1);

INSERT INTO chat_rooms
VALUES (1,'Room 1','2015-11-17T15:53:26+00:00',null,1);

INSERT INTO chat_rooms
VALUES (2,'Room 2','2015-11-17T15:53:26+00:00',null,1);

INSERT INTO users (id,verified,presenter,email,password_hash,student_id,full_name)
VALUES (2,true,false,'runzer@lol.com','$2a$10$sBL3CYJwA.tADgLRsm0QMesAjOB3.vnsO2Whf7qPyJcK.Wt5qkZYi',100533333,'J Runzer');



