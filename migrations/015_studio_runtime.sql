BEGIN;
CREATE TABLE IF NOT EXISTS studio_assets(id uuid PRIMARY KEY,name text NOT NULL,category text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),created_by text NOT NULL REFERENCES farms(user_id),disabled boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS studio_asset_versions(asset_id uuid NOT NULL REFERENCES studio_assets(id),version integer NOT NULL,mime text NOT NULL,bytes bytea NOT NULL,width integer,height integer,duration_ms integer,sha256 text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(asset_id,version));
CREATE TABLE IF NOT EXISTS studio_grants(user_id text NOT NULL REFERENCES farms(user_id),content_id uuid NOT NULL REFERENCES studio_content(id),release_id uuid NOT NULL REFERENCES studio_releases(id),created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,content_id));
COMMIT;
