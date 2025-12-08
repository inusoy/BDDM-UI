--
-- PostgreSQL database dump
--

\restrict RivVLbqykx4d51ACOERv1mzWSaiRQTLLnsRu10D4zjyDbaMx9fWTW0P4Qja6IpJ

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.0 (Postgres.app)

-- Started on 2025-12-08 23:23:42 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3362 (class 1262 OID 297528)
-- Name: asds_ORCID; Type: DATABASE; Schema: -; Owner: asds_ORCID
--

CREATE DATABASE "asds_ORCID" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'pl_PL.utf8';


ALTER DATABASE "asds_ORCID" OWNER TO "asds_ORCID";

\unrestrict RivVLbqykx4d51ACOERv1mzWSaiRQTLLnsRu10D4zjyDbaMx9fWTW0P4Qja6IpJ
\connect "asds_ORCID"
\restrict RivVLbqykx4d51ACOERv1mzWSaiRQTLLnsRu10D4zjyDbaMx9fWTW0P4Qja6IpJ

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 346124)
-- Name: public; Type: SCHEMA; Schema: -; Owner: asds_ORCID
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "asds_ORCID";

--
-- TOC entry 3363 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: asds_ORCID
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 362288)
-- Name: master_author; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.master_author (
    id integer NOT NULL,
    primary_orcid character varying(19),
    canonical_name character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.master_author OWNER TO "asds_ORCID";

--
-- TOC entry 228 (class 1259 OID 362298)
-- Name: master_author_entry; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.master_author_entry (
    id integer NOT NULL,
    master_author_id integer,
    original_candidate_id integer,
    publication_id integer,
    raw_orcid character varying(19),
    raw_name character varying(255),
    raw_affiliation text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.master_author_entry OWNER TO "asds_ORCID";

--
-- TOC entry 227 (class 1259 OID 362297)
-- Name: master_author_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: asds_ORCID
--

CREATE SEQUENCE public.master_author_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_author_entry_id_seq OWNER TO "asds_ORCID";

--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 227
-- Name: master_author_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asds_ORCID
--

ALTER SEQUENCE public.master_author_entry_id_seq OWNED BY public.master_author_entry.id;


--
-- TOC entry 225 (class 1259 OID 362287)
-- Name: master_author_id_seq; Type: SEQUENCE; Schema: public; Owner: asds_ORCID
--

CREATE SEQUENCE public.master_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_author_id_seq OWNER TO "asds_ORCID";

--
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 225
-- Name: master_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asds_ORCID
--

ALTER SEQUENCE public.master_author_id_seq OWNED BY public.master_author.id;


--
-- TOC entry 229 (class 1259 OID 362432)
-- Name: match_candidates; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.match_candidates (
    author_id_a integer NOT NULL,
    author_id_b integer NOT NULL,
    name_score double precision DEFAULT 0,
    coauthor_boost double precision DEFAULT 0,
    total_score double precision DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying
);


ALTER TABLE public.match_candidates OWNER TO "asds_ORCID";

--
-- TOC entry 218 (class 1259 OID 346126)
-- Name: test_author; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.test_author (
    id integer NOT NULL,
    orcid_id character varying(19) NOT NULL,
    given_name character varying(150),
    family_name character varying(150),
    raw_affiliation_string text,
    is_control_group boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    master_author_id integer,
    processing_status character varying(20) DEFAULT 'unprocessed'::character varying
);


ALTER TABLE public.test_author OWNER TO "asds_ORCID";

--
-- TOC entry 220 (class 1259 OID 346139)
-- Name: test_author_alias; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.test_author_alias (
    id integer NOT NULL,
    author_id integer,
    alias_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.test_author_alias OWNER TO "asds_ORCID";

--
-- TOC entry 219 (class 1259 OID 346138)
-- Name: test_author_alias_id_seq; Type: SEQUENCE; Schema: public; Owner: asds_ORCID
--

CREATE SEQUENCE public.test_author_alias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_author_alias_id_seq OWNER TO "asds_ORCID";

--
-- TOC entry 3367 (class 0 OID 0)
-- Dependencies: 219
-- Name: test_author_alias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asds_ORCID
--

ALTER SEQUENCE public.test_author_alias_id_seq OWNED BY public.test_author_alias.id;


--
-- TOC entry 217 (class 1259 OID 346125)
-- Name: test_author_id_seq; Type: SEQUENCE; Schema: public; Owner: asds_ORCID
--

CREATE SEQUENCE public.test_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_author_id_seq OWNER TO "asds_ORCID";

--
-- TOC entry 3368 (class 0 OID 0)
-- Dependencies: 217
-- Name: test_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asds_ORCID
--

ALTER SEQUENCE public.test_author_id_seq OWNED BY public.test_author.id;


--
-- TOC entry 223 (class 1259 OID 346162)
-- Name: test_authorship; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.test_authorship (
    author_id integer NOT NULL,
    publication_id integer NOT NULL
);


ALTER TABLE public.test_authorship OWNER TO "asds_ORCID";

--
-- TOC entry 222 (class 1259 OID 346152)
-- Name: test_publication; Type: TABLE; Schema: public; Owner: asds_ORCID
--

CREATE TABLE public.test_publication (
    id integer NOT NULL,
    doi character varying(255),
    title text,
    publication_year smallint,
    venue_name character varying(255)
);


ALTER TABLE public.test_publication OWNER TO "asds_ORCID";

--
-- TOC entry 221 (class 1259 OID 346151)
-- Name: test_publication_id_seq; Type: SEQUENCE; Schema: public; Owner: asds_ORCID
--

CREATE SEQUENCE public.test_publication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_publication_id_seq OWNER TO "asds_ORCID";

--
-- TOC entry 3369 (class 0 OID 0)
-- Dependencies: 221
-- Name: test_publication_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asds_ORCID
--

ALTER SEQUENCE public.test_publication_id_seq OWNED BY public.test_publication.id;


--
-- TOC entry 224 (class 1259 OID 346177)
-- Name: view_co_authorship; Type: VIEW; Schema: public; Owner: asds_ORCID
--

CREATE VIEW public.view_co_authorship AS
 SELECT t1.author_id AS author_a,
    t2.author_id AS author_b,
    t1.publication_id AS shared_paper_id
   FROM (public.test_authorship t1
     JOIN public.test_authorship t2 ON ((t1.publication_id = t2.publication_id)))
  WHERE (t1.author_id < t2.author_id);


ALTER VIEW public.view_co_authorship OWNER TO "asds_ORCID";

--
-- TOC entry 3173 (class 2604 OID 362291)
-- Name: master_author id; Type: DEFAULT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author ALTER COLUMN id SET DEFAULT nextval('public.master_author_id_seq'::regclass);


--
-- TOC entry 3175 (class 2604 OID 362301)
-- Name: master_author_entry id; Type: DEFAULT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author_entry ALTER COLUMN id SET DEFAULT nextval('public.master_author_entry_id_seq'::regclass);


--
-- TOC entry 3166 (class 2604 OID 346129)
-- Name: test_author id; Type: DEFAULT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author ALTER COLUMN id SET DEFAULT nextval('public.test_author_id_seq'::regclass);


--
-- TOC entry 3170 (class 2604 OID 346142)
-- Name: test_author_alias id; Type: DEFAULT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author_alias ALTER COLUMN id SET DEFAULT nextval('public.test_author_alias_id_seq'::regclass);


--
-- TOC entry 3172 (class 2604 OID 346155)
-- Name: test_publication id; Type: DEFAULT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_publication ALTER COLUMN id SET DEFAULT nextval('public.test_publication_id_seq'::regclass);


--
-- TOC entry 3203 (class 2606 OID 362306)
-- Name: master_author_entry master_author_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author_entry
    ADD CONSTRAINT master_author_entry_pkey PRIMARY KEY (id);


--
-- TOC entry 3197 (class 2606 OID 362296)
-- Name: master_author master_author_orcid_key; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author
    ADD CONSTRAINT master_author_orcid_key UNIQUE (primary_orcid);


--
-- TOC entry 3199 (class 2606 OID 362294)
-- Name: master_author master_author_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author
    ADD CONSTRAINT master_author_pkey PRIMARY KEY (id);


--
-- TOC entry 3205 (class 2606 OID 362440)
-- Name: match_candidates match_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.match_candidates
    ADD CONSTRAINT match_candidates_pkey PRIMARY KEY (author_id_a, author_id_b);


--
-- TOC entry 3189 (class 2606 OID 346145)
-- Name: test_author_alias test_author_alias_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author_alias
    ADD CONSTRAINT test_author_alias_pkey PRIMARY KEY (id);


--
-- TOC entry 3184 (class 2606 OID 346137)
-- Name: test_author test_author_orcid_id_key; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author
    ADD CONSTRAINT test_author_orcid_id_key UNIQUE (orcid_id);


--
-- TOC entry 3186 (class 2606 OID 346135)
-- Name: test_author test_author_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author
    ADD CONSTRAINT test_author_pkey PRIMARY KEY (id);


--
-- TOC entry 3195 (class 2606 OID 346166)
-- Name: test_authorship test_authorship_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_authorship
    ADD CONSTRAINT test_authorship_pkey PRIMARY KEY (author_id, publication_id);


--
-- TOC entry 3191 (class 2606 OID 346161)
-- Name: test_publication test_publication_doi_key; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_publication
    ADD CONSTRAINT test_publication_doi_key UNIQUE (doi);


--
-- TOC entry 3193 (class 2606 OID 346159)
-- Name: test_publication test_publication_pkey; Type: CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_publication
    ADD CONSTRAINT test_publication_pkey PRIMARY KEY (id);


--
-- TOC entry 3187 (class 1259 OID 346181)
-- Name: idx_alias_name; Type: INDEX; Schema: public; Owner: asds_ORCID
--

CREATE INDEX idx_alias_name ON public.test_author_alias USING btree (alias_name);


--
-- TOC entry 3181 (class 1259 OID 346182)
-- Name: idx_auth_orcid; Type: INDEX; Schema: public; Owner: asds_ORCID
--

CREATE INDEX idx_auth_orcid ON public.test_author USING btree (orcid_id);


--
-- TOC entry 3200 (class 1259 OID 362313)
-- Name: idx_master_entry_master_id; Type: INDEX; Schema: public; Owner: asds_ORCID
--

CREATE INDEX idx_master_entry_master_id ON public.master_author_entry USING btree (master_author_id);


--
-- TOC entry 3201 (class 1259 OID 362312)
-- Name: idx_master_entry_orcid; Type: INDEX; Schema: public; Owner: asds_ORCID
--

CREATE INDEX idx_master_entry_orcid ON public.master_author_entry USING btree (raw_orcid);


--
-- TOC entry 3182 (class 1259 OID 362328)
-- Name: idx_test_author_status; Type: INDEX; Schema: public; Owner: asds_ORCID
--

CREATE INDEX idx_test_author_status ON public.test_author USING btree (processing_status) WHERE ((processing_status)::text = 'unprocessed'::text);


--
-- TOC entry 3210 (class 2606 OID 362307)
-- Name: master_author_entry master_author_entry_master_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.master_author_entry
    ADD CONSTRAINT master_author_entry_master_fkey FOREIGN KEY (master_author_id) REFERENCES public.master_author(id) ON DELETE SET NULL;


--
-- TOC entry 3207 (class 2606 OID 346146)
-- Name: test_author_alias test_author_alias_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author_alias
    ADD CONSTRAINT test_author_alias_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.test_author(id) ON DELETE CASCADE;


--
-- TOC entry 3206 (class 2606 OID 362323)
-- Name: test_author test_author_master_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_author
    ADD CONSTRAINT test_author_master_author_id_fkey FOREIGN KEY (master_author_id) REFERENCES public.master_author(id);


--
-- TOC entry 3208 (class 2606 OID 346167)
-- Name: test_authorship test_authorship_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_authorship
    ADD CONSTRAINT test_authorship_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.test_author(id) ON DELETE CASCADE;


--
-- TOC entry 3209 (class 2606 OID 346172)
-- Name: test_authorship test_authorship_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asds_ORCID
--

ALTER TABLE ONLY public.test_authorship
    ADD CONSTRAINT test_authorship_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.test_publication(id) ON DELETE CASCADE;


--
-- TOC entry 3364 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: asds_ORCID
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-12-08 23:23:42 CET

--
-- PostgreSQL database dump complete
--

\unrestrict RivVLbqykx4d51ACOERv1mzWSaiRQTLLnsRu10D4zjyDbaMx9fWTW0P4Qja6IpJ

