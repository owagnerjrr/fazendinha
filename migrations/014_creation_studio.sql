BEGIN;
-- All game-owned records remain in farms; the studio is additive and server-authorized.
CREATE TABLE IF NOT EXISTS studio_admins(user_id text PRIMARY KEY REFERENCES farms(user_id), singleton boolean NOT NULL UNIQUE DEFAULT true CHECK(singleton),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_content(id uuid PRIMARY KEY,kind text NOT NULL,name text NOT NULL,draft jsonb NOT NULL,draft_rev integer NOT NULL DEFAULT 1,disabled boolean NOT NULL DEFAULT false,created_by text NOT NULL REFERENCES farms(user_id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_drafts(content_id uuid NOT NULL REFERENCES studio_content(id),revision integer NOT NULL,definition jsonb NOT NULL,author text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(content_id,revision));
CREATE TABLE IF NOT EXISTS studio_versions(content_id uuid NOT NULL REFERENCES studio_content(id),version integer NOT NULL,definition jsonb NOT NULL,author text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(content_id,version));
CREATE TABLE IF NOT EXISTS studio_groups(id uuid PRIMARY KEY,name text NOT NULL,members text[] NOT NULL DEFAULT '{}',updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_releases(id uuid PRIMARY KEY,content_id uuid NOT NULL,version integer NOT NULL,audience jsonb NOT NULL,delivery text NOT NULL CHECK(delivery IN ('availability','grant','unlock')),status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),author text NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),FOREIGN KEY(content_id,version) REFERENCES studio_versions(content_id,version));
CREATE INDEX IF NOT EXISTS studio_releases_content_idx ON studio_releases(content_id,created_at DESC);
CREATE TABLE IF NOT EXISTS studio_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,request_id uuid NOT NULL UNIQUE,author text NOT NULL,action text NOT NULL,target text,reason text NOT NULL,before jsonb,after jsonb,hash text NOT NULL,result jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS player_usage(user_id text PRIMARY KEY REFERENCES farms(user_id),first_seen timestamptz NOT NULL DEFAULT now(),last_seen timestamptz NOT NULL DEFAULT now(),last_input timestamptz,area text NOT NULL DEFAULT 'farm',active_ms bigint NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS player_sessions(user_id text NOT NULL REFERENCES farms(user_id),id uuid NOT NULL,first_seen timestamptz NOT NULL DEFAULT now(),last_seen timestamptz NOT NULL DEFAULT now(),last_input timestamptz,active boolean NOT NULL DEFAULT false,active_ms bigint NOT NULL DEFAULT 0,area text NOT NULL DEFAULT 'farm',PRIMARY KEY(user_id,id));
CREATE TABLE IF NOT EXISTS player_events(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id text NOT NULL REFERENCES farms(user_id),kind text NOT NULL,area text,details jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS player_events_user_idx ON player_events(user_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS player_events_receipt_idx ON player_events(user_id,(details->>'revision')) WHERE details?'revision';
CREATE TABLE IF NOT EXISTS studio_metadata(key text PRIMARY KEY,value jsonb NOT NULL);
INSERT INTO studio_metadata(key,value) VALUES('collection_since',to_jsonb(now())) ON CONFLICT DO NOTHING;
COMMIT;
