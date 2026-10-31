-- Additive: existing presence rows remain in the original farm.
ALTER TABLE farm_presence ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT 'farm' CHECK (area IN ('farm','expansion'));
