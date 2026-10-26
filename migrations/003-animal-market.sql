-- Widen the accepted product IDs only. Preserve all listings, balances and reserves.
ALTER TABLE market_listings
  DROP CONSTRAINT market_listings_crop_check,
  ADD CONSTRAINT market_listings_crop_check CHECK(crop IN ('carrot','lettuce','tomato','strawberry','corn','tulip','sunflower','egg','milk','goatMilk'));
