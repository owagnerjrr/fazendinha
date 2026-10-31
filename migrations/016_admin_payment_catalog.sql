BEGIN;
CREATE TABLE IF NOT EXISTS studio_payment_packs(id text PRIMARY KEY,name text NOT NULL,coins integer NOT NULL CHECK(coins>=0),fertilizers integer NOT NULL DEFAULT 0 CHECK(fertilizers IN(0,5)),cents integer NOT NULL CHECK(cents>=100),active boolean NOT NULL DEFAULT true,version integer NOT NULL DEFAULT 1,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_package_versions(package_id text NOT NULL REFERENCES studio_payment_packs(id),version integer NOT NULL,name text NOT NULL,coins integer NOT NULL,cents integer NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(package_id,version));
INSERT INTO studio_payment_packs(id,name,coins,fertilizers,cents) VALUES('p10','10.000 moedas',10000,0,1000),('p20','20.000 moedas',20000,0,2000),('p30','30.000 moedas',30000,0,3000),('p40','40.000 moedas',40000,0,4000),('p50','50.000 moedas',50000,0,5000),('f5','5 fertilizantes',0,5,1000) ON CONFLICT DO NOTHING;
INSERT INTO studio_package_versions(package_id,version,name,coins,cents) SELECT id,version,name,coins,cents FROM studio_payment_packs ON CONFLICT DO NOTHING;
ALTER TABLE coin_orders ADD COLUMN IF NOT EXISTS package_version integer;
ALTER TABLE coin_orders ADD COLUMN IF NOT EXISTS package_name text;
-- Existing NULL-version orders keep the exact original six contracts. No order is repriced.
ALTER TABLE coin_orders DROP CONSTRAINT IF EXISTS coin_orders_catalog_check;
ALTER TABLE coin_orders ADD CONSTRAINT coin_orders_catalog_check CHECK(
 (package_version IS NULL AND ((package='f5' AND coins=0 AND amount_cents=1000) OR (package='p10' AND coins=10000 AND amount_cents=1000) OR (package='p20' AND coins=20000 AND amount_cents=2000) OR (package='p30' AND coins=30000 AND amount_cents=3000) OR (package='p40' AND coins=40000 AND amount_cents=4000) OR (package='p50' AND coins=50000 AND amount_cents=5000))) OR
 (package_version>=1 AND package~'^[a-z0-9_-]{1,30}$' AND coins BETWEEN 0 AND 10000000 AND amount_cents BETWEEN 100 AND 100000 AND ((package='f5' AND coins=0) OR (package<>'f5' AND coins>0))));
CREATE OR REPLACE FUNCTION studio_order_contract_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v studio_package_versions%ROWTYPE;
BEGIN
 IF TG_OP='UPDATE' AND ROW(OLD.user_id,OLD.package,OLD.coins,OLD.amount_cents,OLD.package_version,OLD.package_name,OLD.mode,OLD.collector_id,OLD.payment_api) IS DISTINCT FROM ROW(NEW.user_id,NEW.package,NEW.coins,NEW.amount_cents,NEW.package_version,NEW.package_name,NEW.mode,NEW.collector_id,NEW.payment_api) THEN RAISE EXCEPTION 'order contract is immutable';END IF;
 IF NEW.package_version IS NOT NULL THEN
  SELECT * INTO STRICT v FROM studio_package_versions WHERE package_id=NEW.package AND version=NEW.package_version;
  IF v.coins<>NEW.coins OR v.cents<>NEW.amount_cents THEN RAISE EXCEPTION 'order does not match server package version';END IF;
  IF TG_OP='INSERT' THEN NEW.package_name:=v.name;END IF;
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS studio_order_contract ON coin_orders;
CREATE TRIGGER studio_order_contract BEFORE INSERT OR UPDATE OF user_id,package,coins,amount_cents,package_version,package_name,mode,collector_id,payment_api ON coin_orders FOR EACH ROW EXECUTE FUNCTION studio_order_contract_guard();
-- Keep the existing refund/debt/idempotency logic; replace only its fixed fertilizer price guard.
DO $migration$
DECLARE body text;
BEGIN
 SELECT pg_get_functiondef('public.apply_store_payment(uuid,text,text,integer,integer,timestamptz)'::regprocedure) INTO body;
 IF position('p_amount<>1000' in body)>0 THEN
  EXECUTE replace(body,'p_amount<>1000','p_amount<>o.amount_cents OR p_amount<=0');
 ELSIF position('p_amount<>o.amount_cents' in body)=0 THEN
  RAISE EXCEPTION 'unknown fertilizer payment guard; migration refused';
 END IF;
END;
$migration$;
COMMIT;
