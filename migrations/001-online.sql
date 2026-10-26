CREATE TABLE IF NOT EXISTS farms (
 user_id text PRIMARY KEY, public_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
 name text NOT NULL DEFAULT 'Fazendeiro', state jsonb NOT NULL, revision integer NOT NULL DEFAULT 0,
 position_at timestamptz NOT NULL DEFAULT now(), last_action_at timestamptz NOT NULL DEFAULT '2000-01-01', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS action_receipts (
 user_id text NOT NULL REFERENCES farms(user_id), id uuid NOT NULL, hash text NOT NULL, result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,id)
);
CREATE TABLE IF NOT EXISTS friendships (
 sender text NOT NULL REFERENCES farms(user_id), recipient text NOT NULL REFERENCES farms(user_id), accepted boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(sender,recipient), CHECK(sender<>recipient)
);
CREATE TABLE IF NOT EXISTS farm_help (
 helper text NOT NULL REFERENCES farms(user_id), owner text NOT NULL REFERENCES farms(user_id), day date NOT NULL DEFAULT current_date,
 plot integer NOT NULL, PRIMARY KEY(helper,owner,day), CHECK(helper<>owner)
);
CREATE TABLE IF NOT EXISTS market_listings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller text NOT NULL REFERENCES farms(user_id), crop text NOT NULL CHECK(crop IN ('carrot','lettuce','tomato')),
 quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99), price integer NOT NULL CHECK(price BETWEEN 1 AND 9999),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','sold','cancelled')), buyer text REFERENCES farms(user_id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS market_open_idx ON market_listings(created_at DESC) WHERE status='open';
CREATE INDEX IF NOT EXISTS friendship_recipient_idx ON friendships(recipient);
