-- Additive: existing orders remain on their original API and ledger.
ALTER TABLE coin_orders ADD COLUMN IF NOT EXISTS payment_api text NOT NULL DEFAULT 'legacy' CHECK(payment_api IN ('legacy','orders'));
ALTER TABLE coin_orders ADD COLUMN IF NOT EXISTS provider_order_id text;
CREATE UNIQUE INDEX IF NOT EXISTS coin_orders_provider_order_idx ON coin_orders(provider_order_id) WHERE provider_order_id IS NOT NULL;
