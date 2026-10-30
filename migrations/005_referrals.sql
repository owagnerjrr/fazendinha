-- Keep email fingerprints after deletion to prevent repeat signup rewards.
-- No raw email, name, or auth credentials are stored here.
CREATE TABLE IF NOT EXISTS referral_claims (
 invitee text PRIMARY KEY,
 referrer text NOT NULL,
 email_hash text NOT NULL UNIQUE CHECK(length(email_hash)=64),
 created_at timestamptz NOT NULL DEFAULT now(),
 rewarded_at timestamptz,
 reward integer NOT NULL DEFAULT 1000 CHECK(reward=1000),
 CHECK(invitee<>referrer)
);
CREATE INDEX IF NOT EXISTS referral_referrer_idx ON referral_claims(referrer,created_at DESC);
