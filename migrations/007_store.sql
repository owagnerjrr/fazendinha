CREATE TABLE IF NOT EXISTS coin_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id text NOT NULL,request_id uuid NOT NULL,
 package text NOT NULL CHECK(package IN ('p10','p20','p30','p40','p50')),coins integer NOT NULL CHECK(coins IN (10000,20000,30000,40000,50000)),
 amount_cents integer NOT NULL CHECK(amount_cents=coins/10),method text NOT NULL CHECK(method IN ('pix','card')),
 status text NOT NULL DEFAULT 'created',mode text NOT NULL CHECK(mode IN ('test','production')),collector_id text NOT NULL,
 preference_id text UNIQUE,checkout_url text,pix_code text,pix_qr text,creation_lease timestamptz,checked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,request_id)
);
CREATE INDEX IF NOT EXISTS coin_orders_owner_idx ON coin_orders(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS coin_payments (
 payment_id text PRIMARY KEY,order_id uuid NOT NULL REFERENCES coin_orders(id),status text NOT NULL,
 amount_cents integer NOT NULL,refunded_cents integer NOT NULL DEFAULT 0,credited_coins integer NOT NULL DEFAULT 0 CHECK(credited_coins>=0),
 provider_updated_at timestamptz NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),
 fee_cents integer NOT NULL DEFAULT 0,net_cents integer,money_release_date timestamptz
);
CREATE INDEX IF NOT EXISTS coin_payments_order_idx ON coin_payments(order_id);
CREATE TABLE IF NOT EXISTS coin_movements (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,payment_id text NOT NULL REFERENCES coin_payments(payment_id),
 order_id uuid NOT NULL REFERENCES coin_orders(id),user_id text NOT NULL,delta integer NOT NULL CHECK(delta<>0),
 reason text NOT NULL,provider_updated_at timestamptz NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_webhook_events (
 event_key text PRIMARY KEY,payment_id text NOT NULL,received_at timestamptz NOT NULL DEFAULT now(),processed_at timestamptz
);
