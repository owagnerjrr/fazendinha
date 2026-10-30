-- Additive: preserves farms, friendships and every player's progress.
CREATE TABLE IF NOT EXISTS social_blocks (
 owner text NOT NULL REFERENCES farms(user_id), blocked text NOT NULL REFERENCES farms(user_id),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(owner,blocked), CHECK(owner<>blocked)
);
CREATE INDEX IF NOT EXISTS social_blocks_target_idx ON social_blocks(blocked,owner);
CREATE TABLE IF NOT EXISTS friend_messages (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 sender text NOT NULL REFERENCES farms(user_id), recipient text NOT NULL REFERENCES farms(user_id),
 client_id uuid NOT NULL, body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 500),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(sender,client_id), CHECK(sender<>recipient)
);
CREATE INDEX IF NOT EXISTS friend_messages_pair_idx ON friend_messages(LEAST(sender,recipient),GREATEST(sender,recipient),id DESC);
CREATE INDEX IF NOT EXISTS friend_messages_rate_idx ON friend_messages(sender,created_at DESC);
