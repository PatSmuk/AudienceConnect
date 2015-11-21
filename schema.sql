--
-- Create the tables.
--

CREATE TABLE chat_rooms (
    id integer NOT NULL,
    room_name text NOT NULL,
    start_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    end_timestamp timestamp with time zone,
    invitation_list integer NOT NULL
);


CREATE SEQUENCE chat_rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE chat_rooms_id_seq OWNED BY chat_rooms.id;
ALTER TABLE chat_rooms ALTER id SET DEFAULT NEXTVAL('chat_rooms_id_seq');


CREATE TABLE invitation_list_members (
    invitation_list integer NOT NULL,
    audience_member integer NOT NULL
);


CREATE TABLE invitation_lists (
    id integer NOT NULL,
    presenter integer NOT NULL,
    subject text NOT NULL
);


CREATE SEQUENCE invitation_lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE invitation_lists_id_seq OWNED BY invitation_lists.id;
ALTER TABLE invitation_lists ALTER id SET DEFAULT NEXTVAL('invitation_lists_id_seq');


CREATE TABLE messages (
    id integer NOT NULL,
    sender integer NOT NULL,
    message_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    room integer NOT NULL,
    message_text text NOT NULL,
    censored boolean NOT NULL DEFAULT false
);


CREATE SEQUENCE messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE messages_id_seq OWNED BY messages.id;
ALTER TABLE messages ALTER id SET DEFAULT NEXTVAL('messages_id_seq');


CREATE TABLE poll_answers (
    id integer NOT NULL,
    poll integer NOT NULL,
    answer text NOT NULL
);


CREATE SEQUENCE poll_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE poll_answers_id_seq OWNED BY poll_answers.id;
ALTER TABLE poll_answers ALTER id SET DEFAULT NEXTVAL('poll_answers_id_seq');


CREATE TABLE poll_votes (
    poll integer NOT NULL,
    user_id integer NOT NULL,
    answer integer NOT NULL
);


CREATE TABLE polls (
    id integer NOT NULL,
    start_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    end_timestamp timestamp with time zone,
    room integer NOT NULL,
    question text NOT NULL
);


CREATE SEQUENCE polls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE polls_id_seq OWNED BY polls.id;
ALTER TABLE polls ALTER id SET DEFAULT NEXTVAL('polls_id_seq');


CREATE TABLE users (
    id integer NOT NULL,
    avatar text,
    verified boolean DEFAULT false NOT NULL,
    presenter boolean DEFAULT false NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    student_id char(9),
    full_name text
);


CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Connect the serial ID columns with their sequence tables.
--

ALTER TABLE ONLY invitation_lists ALTER COLUMN id SET DEFAULT nextval('invitation_lists_id_seq'::regclass);
ALTER TABLE ONLY messages ALTER COLUMN id SET DEFAULT nextval('messages_id_seq'::regclass);
ALTER TABLE ONLY poll_answers ALTER COLUMN id SET DEFAULT nextval('poll_answers_id_seq'::regclass);
ALTER TABLE ONLY polls ALTER COLUMN id SET DEFAULT nextval('polls_id_seq'::regclass);
ALTER TABLE ONLY users ALTER id SET DEFAULT NEXTVAL('users_id_seq'::regclass);


--
-- Add primary keys and unique keys.
--

ALTER TABLE ONLY chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);

ALTER TABLE ONLY invitation_list_members
    ADD CONSTRAINT invitation_list_members_pkey PRIMARY KEY (invitation_list, audience_member);

ALTER TABLE ONLY invitation_lists
    ADD CONSTRAINT invitation_lists_pkey PRIMARY KEY (id);

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY poll_answers
    ADD CONSTRAINT poll_answers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (poll, user_id);

ALTER TABLE ONLY polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_student_id_key UNIQUE (student_id);


--
-- Add foreign keys (this is done last so everything is ready to be connected).
--

ALTER TABLE ONLY chat_rooms
    ADD CONSTRAINT chat_rooms_invitation_list_fkey FOREIGN KEY (invitation_list) REFERENCES invitation_lists(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY invitation_list_members
    ADD CONSTRAINT invitation_list_members_audience_member_fkey FOREIGN KEY (audience_member) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY invitation_list_members
    ADD CONSTRAINT invitation_list_members_invitation_list_fkey FOREIGN KEY (invitation_list) REFERENCES invitation_lists(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY invitation_lists
    ADD CONSTRAINT invitation_lists_presenter_fkey FOREIGN KEY (presenter) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_room_fkey FOREIGN KEY (room) REFERENCES chat_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_sender_fkey FOREIGN KEY (sender) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY poll_answers
    ADD CONSTRAINT poll_answers_poll_fkey FOREIGN KEY (poll) REFERENCES polls(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY poll_votes
    ADD CONSTRAINT poll_votes_answer_fkey FOREIGN KEY (answer) REFERENCES poll_answers(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY poll_votes
    ADD CONSTRAINT poll_votes_poll_fkey FOREIGN KEY (poll) REFERENCES polls(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY poll_votes
    ADD CONSTRAINT poll_votes_user_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY polls
    ADD CONSTRAINT polls_room_fkey FOREIGN KEY (room) REFERENCES chat_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
