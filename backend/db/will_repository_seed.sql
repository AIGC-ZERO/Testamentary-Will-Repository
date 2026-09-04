--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.witnessings DROP CONSTRAINT IF EXISTS witnessings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.providers DROP CONSTRAINT IF EXISTS providers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.franchise_employees DROP CONSTRAINT IF EXISTS franchise_employees_franchise_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disputes DROP CONSTRAINT IF EXISTS disputes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.business_orders DROP CONSTRAINT IF EXISTS business_orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agreements DROP CONSTRAINT IF EXISTS agreements_user_id_fkey;
DROP INDEX IF EXISTS public.witnessings_status_idx;
DROP INDEX IF EXISTS public.users_mobile_key;
DROP INDEX IF EXISTS public.sms_codes_mobile_purpose_idx;
DROP INDEX IF EXISTS public.registrations_status_idx;
DROP INDEX IF EXISTS public.registrations_applicant_idx;
DROP INDEX IF EXISTS public.franchises_status_idx;
DROP INDEX IF EXISTS public.disputes_stage_idx;
DROP INDEX IF EXISTS public.custody_records_will_id_key;
DROP INDEX IF EXISTS public.business_orders_order_code_key;
DROP INDEX IF EXISTS public.business_orders_business_status_idx;
DROP INDEX IF EXISTS public.business_orders_business_code_idx;
DROP INDEX IF EXISTS public.business_orders_biz_id_key;
DROP INDEX IF EXISTS public.audit_logs_created_at_idx;
DROP INDEX IF EXISTS public.admin_users_account_key;
ALTER TABLE IF EXISTS ONLY public.witnessings DROP CONSTRAINT IF EXISTS witnessings_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.sms_logs DROP CONSTRAINT IF EXISTS sms_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.sms_codes DROP CONSTRAINT IF EXISTS sms_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.providers DROP CONSTRAINT IF EXISTS providers_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.franchises DROP CONSTRAINT IF EXISTS franchises_pkey;
ALTER TABLE IF EXISTS ONLY public.franchise_employees DROP CONSTRAINT IF EXISTS franchise_employees_pkey;
ALTER TABLE IF EXISTS ONLY public.disputes DROP CONSTRAINT IF EXISTS disputes_pkey;
ALTER TABLE IF EXISTS ONLY public.custody_records DROP CONSTRAINT IF EXISTS custody_records_pkey;
ALTER TABLE IF EXISTS ONLY public.business_orders DROP CONSTRAINT IF EXISTS business_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.agreements DROP CONSTRAINT IF EXISTS agreements_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS public.sms_logs ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.witnessings;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.sms_logs_id_seq;
DROP TABLE IF EXISTS public.sms_logs;
DROP TABLE IF EXISTS public.sms_codes;
DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.providers;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.franchises;
DROP TABLE IF EXISTS public.franchise_employees;
DROP TABLE IF EXISTS public.disputes;
DROP TABLE IF EXISTS public.custody_records;
DROP TABLE IF EXISTS public.business_orders;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.agreements;
DROP TABLE IF EXISTS public.admin_users;
DROP TABLE IF EXISTS public._prisma_migrations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    account text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreements (
    id text NOT NULL,
    user_id text,
    type text NOT NULL,
    title text NOT NULL,
    providers jsonb,
    matters text[],
    fee text,
    status text DEFAULT '已提交'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    who text NOT NULL,
    action text NOT NULL,
    meta jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: business_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_orders (
    id text NOT NULL,
    biz_id bigint,
    order_code text NOT NULL,
    user_id text,
    business_code text NOT NULL,
    business_model text DEFAULT '0'::text NOT NULL,
    business_status text DEFAULT '00'::text NOT NULL,
    applicant_name text,
    law_name text,
    phone_number text,
    company_name text,
    partner_code text,
    paid_fees text,
    paid_fees_time text,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: custody_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custody_records (
    id text NOT NULL,
    will_id text NOT NULL,
    holder text NOT NULL,
    since text NOT NULL,
    last_check text,
    ok boolean DEFAULT true NOT NULL,
    location text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id text NOT NULL,
    user_id text,
    title text NOT NULL,
    applicant text NOT NULL,
    owner text,
    stage text NOT NULL,
    ref_id text,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: franchise_employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.franchise_employees (
    id text NOT NULL,
    franchise_id text NOT NULL,
    name text NOT NULL,
    gender text,
    phone_number text,
    registration_time text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: franchises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.franchises (
    id text NOT NULL,
    name text NOT NULL,
    region text,
    contact text,
    status text NOT NULL,
    note text,
    type text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    user_id text,
    title text NOT NULL,
    amount numeric(12,2) NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.providers (
    id text NOT NULL,
    user_id text NOT NULL,
    kind text NOT NULL,
    name text NOT NULL,
    phone text,
    org text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id text NOT NULL,
    user_id text,
    applicant text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    cert_no text,
    content_hash text,
    will_date text,
    heirs text,
    summary text,
    materials jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: sms_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_codes (
    id text NOT NULL,
    mobile text NOT NULL,
    code text NOT NULL,
    purpose text DEFAULT 'login'::text NOT NULL,
    used boolean DEFAULT false NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sms_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_logs (
    id integer NOT NULL,
    to_name text,
    to_mobile text,
    template text NOT NULL,
    content text NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sms_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sms_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sms_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sms_logs_id_seq OWNED BY public.sms_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    mobile text NOT NULL,
    password_hash text,
    name text,
    gender text,
    id_no text,
    marriage text,
    address text,
    hometown text,
    register_addr text,
    real_named boolean DEFAULT false NOT NULL,
    face boolean DEFAULT false NOT NULL,
    fingerprint boolean DEFAULT false NOT NULL,
    id_proof boolean DEFAULT false NOT NULL,
    identity_type text DEFAULT '0'::text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: witnessings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.witnessings (
    id text NOT NULL,
    user_id text,
    applicant text NOT NULL,
    services text[],
    status text NOT NULL,
    fee numeric(12,2) DEFAULT 0 NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    agent text,
    schedule_at text,
    ceremony_hash text,
    witness_name text,
    executor text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: sms_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_logs ALTER COLUMN id SET DEFAULT nextval('public.sms_logs_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
10a20f02-c4ba-4037-83df-b07c918fd5d5	ef8baa885c72279e2ddc9ddab4d61ade0eb71a8af821a9f18009ec81327969db	2026-09-04 03:33:11.010195+00	20260904033310_init	\N	\N	2026-09-04 03:33:10.566361+00	1
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, account, password_hash, name, role, active, last_login_at, created_at, updated_at) FROM stdin;
cmtmefkpf0001adrs1wv8zjji	agent01	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	周业务	业务员	t	2026-09-03 01:05:00	2026-09-04 03:33:15.027	2026-09-04 03:33:15.027
cmtmefkpf0003adrsofumuwq2	cs01	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	孙客服	客服	f	2026-08-20 03:00:00	2026-09-04 03:33:15.027	2026-09-04 03:33:15.027
cmtmefkpf0004adrs92v4v43w	manager01	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	林倩	管理人	t	2026-08-30 13:00:00	2026-09-04 03:33:15.027	2026-09-04 03:33:15.027
cmtmefkpf0002adrsdu6yh5ob	admin01	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	王管理	管理员	t	2026-09-04 03:34:58.766	2026-09-04 03:33:15.027	2026-09-04 03:34:58.768
cmtmefkpf0000adrsvezjkeip	reviewer01	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	李审核	审核员	t	2026-09-04 03:42:32.281	2026-09-04 03:33:15.027	2026-09-04 03:42:32.282
\.


--
-- Data for Name: agreements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agreements (id, user_id, type, title, providers, matters, fee, status, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, who, action, meta, created_at) FROM stdin;
cmtmefktm000kadrslsedl5gx	周业务	设置排期 WS20260902007 → 2026-09-05 10:00	\N	2026-09-03 01:12:33
cmtmefktm000ladrsp21ejfk9	李审核	退回补充 RG20260825005	\N	2026-09-02 09:45:08
cmtmefktm000madrsnvruo28t	系统	订单 ORD20260902007 支付成功 ¥3000	\N	2026-09-02 06:35:02
cmtmefktm000nadrsvh2j61zn	王管理	保管标记异常 WL20260815011	\N	2026-08-22 03:20:00
cmtmefktm000oadrsotyz4w5o	周业务	标记完成 WS20260815011，ceremonyHash c7b42e9a	\N	2026-08-20 07:30:00
cmtmehsrc0000ijztq3zifoo1	王管理	后台登录 admin01	\N	2026-09-04 03:34:58.776
cmtmeriox0001ijztmw47lp44	李审核	后台登录 reviewer01	\N	2026-09-04 03:42:32.29
cmtmeriwh0002ijzty4e13w5h	李审核	通过登记 RG20260902015 → QD-WILL-20260904-015	\N	2026-09-04 03:42:32.561
\.


--
-- Data for Name: business_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_orders (id, biz_id, order_code, user_id, business_code, business_model, business_status, applicant_name, law_name, phone_number, company_name, partner_code, paid_fees, paid_fees_time, note, created_at, updated_at) FROM stdin;
cmtmefkrc0007adrst1faou5n	2026090207001	ORD20260902007	cmtmefkpu0005adrsbpj7bpqm	0	0	00	田野	赵律师	13912342210	山东德和律所	FR20240612001	3000	2026-09-02 14:35:02	自书遗嘱见证	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
cmtmefkrc0008adrsrsc1fnbl	2026082803002	ORD20260828003	cmtmefkpu0005adrsbpj7bpqm	5	0	01	田野	孙主任	053288886666	青岛安和律师事务所	FR20231108002	1800	2026-08-28 09:20:11	遗嘱保管服务	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
cmtmefkrc0009adrs80lymef8	2026081501103	ORD20260815011	\N	1	0	01	王秀兰	赵律师	13912342210	山东德和律所	FR20240612001	5000	2026-08-15 10:25:00	遗嘱执行	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
cmtmefkrc000aadrsj2znrdra	2026072200904	ORD20260722009	\N	2	1	02	刘芳	钱助理	13700001111	山东德和律所	FR20240612001	2200	2026-07-22 16:10:00	遗嘱监管	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
cmtmefkrc000badrs73gm5prs	2026090100505	ORD20260901005	\N	3	0	00	陈建国	孙主任	053288886666	青岛安和律师事务所	FR20231108002	\N	\N	遗产管理申请	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
cmtmefkrc000cadrsyefo2ukb	2026081000206	ORD20260810002	\N	4	0	01	林倩	赵律师	13912342210	山东德和律所	FR20240612001	8000	2026-08-10 13:20:00	遗嘱纠纷调解	2026-09-04 03:33:15.097	2026-09-04 03:33:15.097
\.


--
-- Data for Name: custody_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custody_records (id, will_id, holder, since, last_check, ok, location, created_at, updated_at) FROM stdin;
cmtmefkrz000dadrs7iln9u75	WL20260703012	王秀兰	2026-07-05	2026-09-01	t	市南保管库 A-12	2026-09-04 03:33:15.119	2026-09-04 03:33:15.119
cmtmefkrz000eadrslq8pe3tz	WL20260828003	田野	2026-08-29	2026-09-02	t	市南保管库 B-08	2026-09-04 03:33:15.119	2026-09-04 03:33:15.119
cmtmefkrz000fadrsqxqy1bk4	WL20260815011	王秀兰	2026-08-22	2026-08-28	f	市南保管库 A-15	2026-09-04 03:33:15.119	2026-09-04 03:33:15.119
cmtmefkrz000gadrs9dxrubjk	WL20260722009	刘芳	2026-07-26	2026-09-03	t	黄岛保管库 C-03	2026-09-04 03:33:15.119	2026-09-04 03:33:15.119
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disputes (id, user_id, title, applicant, owner, stage, ref_id, description, created_at, updated_at) FROM stdin;
DP20260810002	\N	遗产分配争议调解	林倩	王管理	调解中	\N	\N	2026-09-04 03:33:15.109	2026-08-10 06:20:00
DP20260705006	\N	遗嘱效力异议	赵丽	王管理	取证中	\N	\N	2026-09-04 03:33:15.109	2026-07-08 03:00:00
DP20260618003	\N	遗嘱执行阻碍纠纷	刘芳	李审核	诉讼中	\N	\N	2026-09-04 03:33:15.109	2026-08-22 01:40:00
DP20260520001	\N	继承人身份确认	陈建国	李审核	已结案	\N	\N	2026-09-04 03:33:15.109	2026-06-15 08:45:00
\.


--
-- Data for Name: franchise_employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.franchise_employees (id, franchise_id, name, gender, phone_number, registration_time, created_at) FROM stdin;
cmtmefksp000hadrspdk05fei	FR20240612001	赵律师	男	13912342210	2024-06-12	2026-09-04 03:33:15.145
cmtmefksp000iadrs2bjh8gc3	FR20240612001	钱助理	女	13700001111	2024-08-01	2026-09-04 03:33:15.145
cmtmefksp000jadrs3mr9z10c	FR20231108002	孙主任	男	053288886666	2023-11-08	2026-09-04 03:33:15.145
\.


--
-- Data for Name: franchises; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.franchises (id, name, region, contact, status, note, type, created_at, updated_at) FROM stdin;
FR20260901001	胶州公正服务社	胶州市	0532-8722****	待审核	\N	2	2026-09-04 03:33:15.132	2026-09-04 03:33:15.132
FR20260820002	城阳法务咨询中心	城阳区	137****8899	待审核	\N	2	2026-09-04 03:33:15.132	2026-09-04 03:33:15.132
FR20240612001	山东德和律所（赵律师团队）	市南区	13912342210	已入库	\N	1	2026-09-04 03:33:15.132	2026-09-04 03:33:15.132
FR20231108002	青岛安和律师事务所	市北区	053288886666	已入库	\N	1	2026-09-04 03:33:15.132	2026-09-04 03:33:15.132
FR20250715003	即墨遗产服务中心	即墨区	186****5566	已驳回	\N	2	2026-09-04 03:33:15.132	2026-09-04 03:33:15.132
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, title, amount, status, created_at, updated_at) FROM stdin;
ORD20260903001	cmtmefkpu0005adrsbpj7bpqm	遗嘱见证服务费	3000.00	待支付	2026-09-03 02:20:00	2026-09-04 03:33:15.157
ORD20260902007	cmtmefkpu0005adrsbpj7bpqm	遗嘱见证服务费	3000.00	已支付	2026-09-02 06:35:00	2026-09-04 03:33:15.157
ORD20260828003	cmtmefkpu0005adrsbpj7bpqm	遗嘱保管服务费	1800.00	已支付	2026-08-28 01:20:00	2026-09-04 03:33:15.157
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.providers (id, user_id, kind, name, phone, org, created_at) FROM stdin;
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, user_id, applicant, type, status, cert_no, content_hash, will_date, heirs, summary, materials, created_at, updated_at) FROM stdin;
RG20260703012	cmtmefkpu0005adrsbpj7bpqm	王秀兰	自书遗嘱	已受理	QD-WILL-20260703-012	a3f28c1d	\N	\N	\N	\N	2026-07-03 02:22:00	2026-09-04 03:33:15.074
RG20260812008	\N	陈建国	打印遗嘱	审核中	\N	\N	\N	\N	\N	\N	2026-08-12 07:40:00	2026-09-04 03:33:15.074
RG20260825005	\N	刘芳	自书遗嘱	退回补充	\N	\N	\N	\N	\N	\N	2026-08-25 01:18:00	2026-09-04 03:33:15.074
RG20260901003	\N	张明远	录音遗嘱	已提交	\N	\N	\N	\N	\N	\N	2026-09-01 03:05:00	2026-09-04 03:33:15.074
RG20260818021	\N	赵丽	打印遗嘱	驳回终止	\N	\N	\N	\N	\N	\N	2026-08-18 00:30:00	2026-09-04 03:33:15.074
RG20260902015	cmtmefkpu0005adrsbpj7bpqm	田野	自书遗嘱	已受理	QD-WILL-20260904-015	f6fd0e6fd63ee1a7	\N	\N	\N	\N	2026-09-02 08:50:00	2026-09-04 03:42:32.544
\.


--
-- Data for Name: sms_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sms_codes (id, mobile, code, purpose, used, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: sms_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sms_logs (id, to_name, to_mobile, template, content, status, created_at) FROM stdin;
1	田野	\N	见证排期通知	您的见证业务 WS20260902007 已排期至 2026-09-05 10:00，请准时到场。	成功	2026-09-03 01:12:33
2	陈建国	\N	补件通知	请补充手持证件清晰照片后重新提交登记申请。	成功	2026-09-02 09:45:08
3	王秀兰	\N	登记受理通知	您的遗嘱登记已受理，证明编号 QD-WILL-20260703-012。	成功	2026-07-05 02:30:00
4	刘芳	\N	验证码	验证码 ******，5分钟内有效，请勿泄露。	成功	2026-08-25 01:15:22
5	\N	138****6721	验证码	验证码 ******，5分钟内有效，请勿泄露。	失败	2026-09-01 03:02:18
6	田野	\N	登记受理通知	您的遗嘱登记已受理，证明编号 QD-WILL-20260904-015。	成功	2026-09-04 03:42:32.553
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, mobile, password_hash, name, gender, id_no, marriage, address, hometown, register_addr, real_named, face, fingerprint, id_proof, identity_type, active, created_at, updated_at) FROM stdin;
cmtmefkpu0005adrsbpj7bpqm	13800000001	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	田野	0	370***********3531	已婚	青岛市市南区	山东青岛	\N	t	f	f	t	0	t	2026-09-04 03:33:15.043	2026-09-04 03:33:15.043
cmtmefkqc0006adrs20ecafu3	13800000002	$2b$10$qSpPQaO./H4fE1beAX6QIOOlYV6yqETJoUMjiNP5CrxqZuDPB2v4S	王秀兰	1	\N	\N	\N	\N	\N	t	f	f	f	0	t	2026-09-04 03:33:15.06	2026-09-04 03:33:15.06
\.


--
-- Data for Name: witnessings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.witnessings (id, user_id, applicant, services, status, fee, paid, agent, schedule_at, ceremony_hash, witness_name, executor, created_at, updated_at) FROM stdin;
WS20260902007	cmtmefkpu0005adrsbpj7bpqm	田野	{见证,保管}	待排期	6800.00	t	周业务	2026-09-05 10:00	\N	\N	\N	2026-09-04 03:33:15.085	2026-09-04 03:33:15.085
WS20260830004	\N	陈建国	{见证}	待审核	3000.00	t	\N	\N	\N	\N	\N	2026-09-04 03:33:15.085	2026-09-04 03:33:15.085
WS20260815011	\N	王秀兰	{见证,执行}	已完成	8500.00	t	周业务	2026-08-20 14:00	c7b42e9a	\N	\N	2026-09-04 03:33:15.085	2026-09-04 03:33:15.085
WS20260722009	\N	刘芳	{见证}	已完成	3000.00	t	周业务	2026-07-25 09:30	d1a84f3c	\N	\N	2026-09-04 03:33:15.085	2026-09-04 03:33:15.085
\.


--
-- Name: sms_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sms_logs_id_seq', 6, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: business_orders business_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_orders
    ADD CONSTRAINT business_orders_pkey PRIMARY KEY (id);


--
-- Name: custody_records custody_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custody_records
    ADD CONSTRAINT custody_records_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: franchise_employees franchise_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.franchise_employees
    ADD CONSTRAINT franchise_employees_pkey PRIMARY KEY (id);


--
-- Name: franchises franchises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT franchises_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: sms_codes sms_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_codes
    ADD CONSTRAINT sms_codes_pkey PRIMARY KEY (id);


--
-- Name: sms_logs sms_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_logs
    ADD CONSTRAINT sms_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: witnessings witnessings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.witnessings
    ADD CONSTRAINT witnessings_pkey PRIMARY KEY (id);


--
-- Name: admin_users_account_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_account_key ON public.admin_users USING btree (account);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: business_orders_biz_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_orders_biz_id_key ON public.business_orders USING btree (biz_id);


--
-- Name: business_orders_business_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_orders_business_code_idx ON public.business_orders USING btree (business_code);


--
-- Name: business_orders_business_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_orders_business_status_idx ON public.business_orders USING btree (business_status);


--
-- Name: business_orders_order_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_orders_order_code_key ON public.business_orders USING btree (order_code);


--
-- Name: custody_records_will_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX custody_records_will_id_key ON public.custody_records USING btree (will_id);


--
-- Name: disputes_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disputes_stage_idx ON public.disputes USING btree (stage);


--
-- Name: franchises_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX franchises_status_idx ON public.franchises USING btree (status);


--
-- Name: registrations_applicant_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registrations_applicant_idx ON public.registrations USING btree (applicant);


--
-- Name: registrations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registrations_status_idx ON public.registrations USING btree (status);


--
-- Name: sms_codes_mobile_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sms_codes_mobile_purpose_idx ON public.sms_codes USING btree (mobile, purpose);


--
-- Name: users_mobile_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_mobile_key ON public.users USING btree (mobile);


--
-- Name: witnessings_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX witnessings_status_idx ON public.witnessings USING btree (status);


--
-- Name: agreements agreements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: business_orders business_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_orders
    ADD CONSTRAINT business_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: franchise_employees franchise_employees_franchise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.franchise_employees
    ADD CONSTRAINT franchise_employees_franchise_id_fkey FOREIGN KEY (franchise_id) REFERENCES public.franchises(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: witnessings witnessings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.witnessings
    ADD CONSTRAINT witnessings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


