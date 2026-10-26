CREATE TABLE IF NOT EXISTS farm_raids (
 visitor text NOT NULL REFERENCES farms(user_id), owner text NOT NULL REFERENCES farms(user_id), day date NOT NULL,
 plot integer NOT NULL, PRIMARY KEY(visitor,owner,day), CHECK(visitor<>owner)
);
ALTER TABLE market_listings DROP CONSTRAINT market_listings_crop_check, ADD CONSTRAINT market_listings_crop_check CHECK(crop IN ('carrot','lettuce','tomato','strawberry','corn','tulip','sunflower'));
