-- Ephemeral presence only; no changes to farms, purchases or payment records.
CREATE TABLE IF NOT EXISTS studio_presence (
 user_id text PRIMARY KEY REFERENCES farms(user_id),
 owner_id text NOT NULL REFERENCES farms(user_id),
 scene uuid NOT NULL REFERENCES studio_content(id),
 x integer NOT NULL CHECK(x BETWEEN 0 AND 63),
 y integer NOT NULL CHECK(y BETWEEN 0 AND 63),
 direction integer NOT NULL DEFAULT 0 CHECK(direction BETWEEN 0 AND 3),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_presence_room ON studio_presence(owner_id,scene,updated_at);
