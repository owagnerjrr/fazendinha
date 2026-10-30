BEGIN;
-- Preserve all existing help records; widen the key to permit distinct plot/actions.
ALTER TABLE farm_help ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'legacy' CHECK(mode IN ('legacy','hoe','plant','water','clean'));
ALTER TABLE farm_help DROP CONSTRAINT farm_help_pkey;
ALTER TABLE farm_help ADD PRIMARY KEY(helper,owner,day,plot,mode);
COMMIT;
