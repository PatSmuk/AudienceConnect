--
-- Create the database.
--

DROP DATABASE audience_connect;
CREATE DATABASE audience_connect;
ALTER DATABASE audience_connect OWNER TO postgres;

--
-- Create the "schema" (kind of like a sub-database in PostgreSQL).
--

CREATE SCHEMA public;
ALTER SCHEMA public OWNER TO postgres;
COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Create the tables.
--

CREATE TABLE "ChatRooms" (
    id integer NOT NULL,
    "roomName" text NOT NULL,
    "startTimestamp" timestamp with time zone DEFAULT now() NOT NULL,
    "endTimestamp" timestamp with time zone,
    "invitationList" integer NOT NULL
);
ALTER TABLE "ChatRooms" OWNER TO postgres;


CREATE SEQUENCE "ChatRooms_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE "ChatRooms_id_seq" OWNER TO postgres;
ALTER SEQUENCE "ChatRooms_id_seq" OWNED BY "ChatRooms".id;


CREATE TABLE "InvitationListMembers" (
    "invitationList" integer NOT NULL,
    "audienceMember" integer NOT NULL
);
ALTER TABLE "InvitationListMembers" OWNER TO postgres;


CREATE TABLE "InvitationLists" (
    id integer NOT NULL,
    presenter integer NOT NULL,
    subject text NOT NULL
);
ALTER TABLE "InvitationLists" OWNER TO postgres;


CREATE SEQUENCE "InvitationLists_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE "InvitationLists_id_seq" OWNER TO postgres;
ALTER SEQUENCE "InvitationLists_id_seq" OWNED BY "InvitationLists".id;


CREATE TABLE "Messages" (
    id integer NOT NULL,
    sender integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    room integer NOT NULL,
    message text NOT NULL
);
ALTER TABLE "Messages" OWNER TO postgres;


CREATE SEQUENCE "Messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE "Messages_id_seq" OWNER TO postgres;
ALTER SEQUENCE "Messages_id_seq" OWNED BY "Messages".id;


CREATE TABLE "PollAnswers" (
    id integer NOT NULL,
    poll integer NOT NULL,
    answer text NOT NULL
);
ALTER TABLE "PollAnswers" OWNER TO postgres;


CREATE SEQUENCE "PollAnswers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE "PollAnswers_id_seq" OWNER TO postgres;
ALTER SEQUENCE "PollAnswers_id_seq" OWNED BY "PollAnswers".id;


CREATE TABLE "PollVotes" (
    poll integer NOT NULL,
    "user" integer NOT NULL,
    answer integer NOT NULL
);
ALTER TABLE "PollVotes" OWNER TO postgres;


CREATE TABLE "Polls" (
    id integer NOT NULL,
    "startTimestamp" timestamp with time zone DEFAULT now() NOT NULL,
    "endTimestamp" timestamp with time zone,
    room integer NOT NULL,
    question text NOT NULL
);

ALTER TABLE "Polls" OWNER TO postgres;


CREATE SEQUENCE "Polls_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE "Polls_id_seq" OWNER TO postgres;
ALTER SEQUENCE "Polls_id_seq" OWNED BY "Polls".id;


CREATE TABLE "Users" (
    id integer NOT NULL,
    "userName" text NOT NULL,
    avatar text,
    verified boolean DEFAULT false NOT NULL,
    presenter boolean DEFAULT false NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL
);
ALTER TABLE "Users" OWNER TO postgres;


--
-- Connect the serial ID columns with their sequence tables.
--

ALTER TABLE ONLY "InvitationLists" ALTER COLUMN id SET DEFAULT nextval('"InvitationLists_id_seq"'::regclass);
ALTER TABLE ONLY "Messages" ALTER COLUMN id SET DEFAULT nextval('"Messages_id_seq"'::regclass);
ALTER TABLE ONLY "PollAnswers" ALTER COLUMN id SET DEFAULT nextval('"PollAnswers_id_seq"'::regclass);
ALTER TABLE ONLY "Polls" ALTER COLUMN id SET DEFAULT nextval('"Polls_id_seq"'::regclass);


--
-- Add primary keys and unique keys.
--

ALTER TABLE ONLY "ChatRooms"
    ADD CONSTRAINT "ChatRooms_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "InvitationListMembers"
    ADD CONSTRAINT "InvitationListMembers_pkey" PRIMARY KEY ("invitationList", "audienceMember");

ALTER TABLE ONLY "InvitationLists"
    ADD CONSTRAINT "InvitationLists_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "PollAnswers"
    ADD CONSTRAINT "PollAnswers_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "PollVotes"
    ADD CONSTRAINT "PollVotes_pkey" PRIMARY KEY (poll, "user");

ALTER TABLE ONLY "Polls"
    ADD CONSTRAINT "Polls_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);

ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Add foreign keys (this is done last so everything is ready to be connected).
--

ALTER TABLE ONLY "ChatRooms"
    ADD CONSTRAINT "ChatRooms_invitationList_fkey" FOREIGN KEY ("invitationList") REFERENCES "InvitationLists"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "InvitationListMembers"
    ADD CONSTRAINT "InvitationListMembers_audienceMember_fkey" FOREIGN KEY ("audienceMember") REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "InvitationListMembers"
    ADD CONSTRAINT "InvitationListMembers_invitationList_fkey" FOREIGN KEY ("invitationList") REFERENCES "InvitationLists"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "InvitationLists"
    ADD CONSTRAINT "InvitationLists_presenter_fkey" FOREIGN KEY (presenter) REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "Messages"
    ADD CONSTRAINT "Messages_room_fkey" FOREIGN KEY (room) REFERENCES "ChatRooms"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "Messages"
    ADD CONSTRAINT "Messages_sender_fkey" FOREIGN KEY (sender) REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "PollAnswers"
    ADD CONSTRAINT "PollAnswers_poll_fkey" FOREIGN KEY (poll) REFERENCES "Polls"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "PollVotes"
    ADD CONSTRAINT "PollVotes_answer_fkey" FOREIGN KEY (answer) REFERENCES "PollAnswers"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "PollVotes"
    ADD CONSTRAINT "PollVotes_poll_fkey" FOREIGN KEY (poll) REFERENCES "Polls"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "PollVotes"
    ADD CONSTRAINT "PollVotes_user_fkey" FOREIGN KEY ("user") REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "Polls"
    ADD CONSTRAINT "Polls_room_fkey" FOREIGN KEY (room) REFERENCES "ChatRooms"(id) ON UPDATE CASCADE ON DELETE CASCADE;
