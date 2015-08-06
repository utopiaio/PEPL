--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.3
-- Dumped by pg_dump version 9.4.0
-- Started on 2015-02-01 10:18:27 EAT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 179 (class 3079 OID 12018)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2268 (class 0 OID 0)
-- Dependencies: 179
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_with_oids = false;

--
-- TOC entry 173 (class 1259 OID 17929)
-- Name: fixtures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE fixtures (
    fixture_id integer NOT NULL,
    fixture_team_home character varying(128) DEFAULT 'HOME TEAM'::character varying NOT NULL,
    fixture_team_away character varying(128) DEFAULT 'AWAY TEAM'::character varying NOT NULL,
    fixture_time timestamp with time zone DEFAULT now() NOT NULL,
    fixture_team_home_score integer DEFAULT (-1),
    fixture_team_away_score integer DEFAULT (-1)
);


--
-- TOC entry 172 (class 1259 OID 17927)
-- Name: fixtures_fixture_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE fixtures_fixture_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2269 (class 0 OID 0)
-- Dependencies: 172
-- Name: fixtures_fixture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE fixtures_fixture_id_seq OWNED BY fixtures.fixture_id;


--
-- TOC entry 171 (class 1259 OID 17912)
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE players (
    player_id integer NOT NULL,
    player_username character varying(128) NOT NULL,
    player_password character varying(128) NOT NULL,
    player_suspended boolean DEFAULT false NOT NULL,
    player_email character varying(1024),
    player_type character varying(32) DEFAULT 'NORMAL'::character varying NOT NULL
);


--
-- TOC entry 170 (class 1259 OID 17910)
-- Name: players_player_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE players_player_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2270 (class 0 OID 0)
-- Dependencies: 170
-- Name: players_player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE players_player_id_seq OWNED BY players.player_id;


--
-- TOC entry 175 (class 1259 OID 17941)
-- Name: predictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE predictions (
    prediction_id integer NOT NULL,
    prediction_fixture integer NOT NULL,
    prediction_player integer NOT NULL,
    prediction_home_team integer NOT NULL,
    prediction_away_team integer NOT NULL,
    prediction_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 174 (class 1259 OID 17939)
-- Name: predictions_prediction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE predictions_prediction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2271 (class 0 OID 0)
-- Dependencies: 174
-- Name: predictions_prediction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE predictions_prediction_id_seq OWNED BY predictions.prediction_id;


--
-- TOC entry 178 (class 1259 OID 18592)
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 177 (class 1259 OID 18128)
-- Name: wall; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE wall (
    wall_id integer NOT NULL,
    wall_player integer,
    wall_message text NOT NULL,
    wall_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 176 (class 1259 OID 18126)
-- Name: wall_wall_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE wall_wall_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 2272 (class 0 OID 0)
-- Dependencies: 176
-- Name: wall_wall_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE wall_wall_id_seq OWNED BY wall.wall_id;


--
-- TOC entry 2117 (class 2604 OID 17932)
-- Name: fixture_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY fixtures ALTER COLUMN fixture_id SET DEFAULT nextval('fixtures_fixture_id_seq'::regclass);


--
-- TOC entry 2114 (class 2604 OID 17915)
-- Name: player_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY players ALTER COLUMN player_id SET DEFAULT nextval('players_player_id_seq'::regclass);


--
-- TOC entry 2123 (class 2604 OID 17944)
-- Name: prediction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY predictions ALTER COLUMN prediction_id SET DEFAULT nextval('predictions_prediction_id_seq'::regclass);


--
-- TOC entry 2125 (class 2604 OID 18131)
-- Name: wall_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY wall ALTER COLUMN wall_id SET DEFAULT nextval('wall_wall_id_seq'::regclass);


--
-- TOC entry 2256 (class 0 OID 17929)
-- Dependencies: 173
-- Data for Name: fixtures; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO fixtures VALUES (86, 'Manchester-City', 'Crystal-Palace', '2014-12-20 12:00:00+03', -1, -1);


--
-- TOC entry 2273 (class 0 OID 0)
-- Dependencies: 172
-- Name: fixtures_fixture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('fixtures_fixture_id_seq', 88, true);


--
-- TOC entry 2254 (class 0 OID 17912)
-- Dependencies: 171
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO players VALUES (177, 'moe1', 'bd128abd7fbdf9f925725b75550d8fb2032f0db7', false, 'moe.duffdude@google.com', 'NORMAL');
INSERT INTO players VALUES (134, 'moe', '4706da2001c4b6b8dcecafa27c5c4155fc265ee7', false, 'moe.duffdude@gmail.com', 'ADMINISTRATOR');
INSERT INTO players VALUES (141, 'moen', '1ebaeffa07d029015b93e6b8e80d4c63577b29db', false, 'moe.duffdude@icloud.com', 'NORMAL');


--
-- TOC entry 2274 (class 0 OID 0)
-- Dependencies: 170
-- Name: players_player_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('players_player_id_seq', 199, true);


--
-- TOC entry 2258 (class 0 OID 17941)
-- Dependencies: 175
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO predictions VALUES (58, 86, 141, 2, 2, '2014-12-20 12:39:12.621044+03');
INSERT INTO predictions VALUES (57, 86, 134, 3, 2, '2014-12-20 11:53:33.924+03');


--
-- TOC entry 2275 (class 0 OID 0)
-- Dependencies: 174
-- Name: predictions_prediction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('predictions_prediction_id_seq', 58, true);


--
-- TOC entry 2261 (class 0 OID 18592)
-- Dependencies: 178
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO session VALUES ('cfqh68emEDFbqJNYc-VleWXO37mVHkiC', '{"cookie":{"originalMaxAge":2591999999,"expires":"2015-01-29T08:49:22.371Z","secure":false,"httpOnly":true,"path":"/"},"loggedIn":true,"player_id":134,"player_username":"moe","player_email":"moe.duffdude@gmail.com","player_type":"ADMINISTRATOR","player_suspended":false}', '2015-01-29 11:49:21.372');


--
-- TOC entry 2260 (class 0 OID 18128)
-- Dependencies: 177
-- Data for Name: wall; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO wall VALUES (1, 134, 'Welcome to PEPL!', '2014-12-16 17:42:34.307+03');
INSERT INTO wall VALUES (3, 134, 'seconds!', '2014-12-19 08:42:00.841+03');
INSERT INTO wall VALUES (4, 134, 'test', '2014-12-19 21:20:37.814+03');


--
-- TOC entry 2276 (class 0 OID 0)
-- Dependencies: 176
-- Name: wall_wall_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('wall_wall_id_seq', 4, true);


--
-- TOC entry 2134 (class 2606 OID 17937)
-- Name: fixture_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY fixtures
    ADD CONSTRAINT fixture_pk PRIMARY KEY (fixture_id);


--
-- TOC entry 2128 (class 2606 OID 17926)
-- Name: player_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY players
    ADD CONSTRAINT player_email_unique UNIQUE (player_email);


--
-- TOC entry 2130 (class 2606 OID 17922)
-- Name: player_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY players
    ADD CONSTRAINT player_pk PRIMARY KEY (player_id);


--
-- TOC entry 2132 (class 2606 OID 17924)
-- Name: player_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY players
    ADD CONSTRAINT player_username_unique UNIQUE (player_username);


--
-- TOC entry 2136 (class 2606 OID 17947)
-- Name: prediction_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY predictions
    ADD CONSTRAINT prediction_pk PRIMARY KEY (prediction_id);


--
-- TOC entry 2138 (class 2606 OID 18100)
-- Name: prediction_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY predictions
    ADD CONSTRAINT prediction_unique UNIQUE (prediction_fixture, prediction_player);


--
-- TOC entry 2142 (class 2606 OID 18599)
-- Name: session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 2140 (class 2606 OID 18137)
-- Name: wall_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY wall
    ADD CONSTRAINT wall_pk PRIMARY KEY (wall_id);


--
-- TOC entry 2143 (class 2606 OID 18101)
-- Name: prediction_fixture_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY predictions
    ADD CONSTRAINT prediction_fixture_fk FOREIGN KEY (prediction_fixture) REFERENCES fixtures(fixture_id) ON DELETE CASCADE;


--
-- TOC entry 2144 (class 2606 OID 18106)
-- Name: prediction_player_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY predictions
    ADD CONSTRAINT prediction_player_fk FOREIGN KEY (prediction_player) REFERENCES players(player_id) ON DELETE CASCADE;


--
-- TOC entry 2145 (class 2606 OID 18138)
-- Name: wall_player_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY wall
    ADD CONSTRAINT wall_player_fk FOREIGN KEY (wall_player) REFERENCES players(player_id) ON DELETE CASCADE;


-- Completed on 2015-02-01 10:18:27 EAT

--
-- PostgreSQL database dump complete
--

