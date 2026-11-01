DO $migration$
BEGIN
CREATE TABLE IF NOT EXISTS farm_raid_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 visitor text NOT NULL REFERENCES farms(user_id),
 owner text NOT NULL REFERENCES farms(user_id),
 plot integer NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now(),
 CHECK(visitor<>owner)
);
CREATE INDEX IF NOT EXISTS farm_raid_events_window ON farm_raid_events(visitor,owner,occurred_at DESC);
-- Additive ledger: legacy daily raids and saved farm state are retained unchanged.
END
$migration$;
