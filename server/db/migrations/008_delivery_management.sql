-- ============================================================================
-- Migration 008: Dynamic Delivery Fee & Serviceable Pincodes Engine
-- ============================================================================

BEGIN;

-- 1. Create serviceable_pincodes table
CREATE TABLE IF NOT EXISTS serviceable_pincodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pincode VARCHAR(10) UNIQUE NOT NULL,
    area_name TEXT NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL DEFAULT 10.0,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by pincode and enabled status
CREATE INDEX IF NOT EXISTS idx_serviceable_pincodes_pin ON serviceable_pincodes(pincode);
CREATE INDEX IF NOT EXISTS idx_serviceable_pincodes_enabled ON serviceable_pincodes(is_enabled);

-- 2. Seed initial 45 Hyderabad + Ranga Reddy PIN Codes from Mudimyala Sanctuary (501503)
INSERT INTO serviceable_pincodes (pincode, area_name, distance_km, is_enabled) VALUES
  ('501503', 'Mudimyala / Chevella Sanctuary', 4.0, TRUE),
  ('501504', 'Chevella Town / Aloor', 6.0, TRUE),
  ('501501', 'Chevella Rural / Shankarpally Road', 12.0, TRUE),
  ('501505', 'Vikarabad Road / Pargi', 35.0, TRUE),
  ('501506', 'Nawabpet / Chevella East', 16.0, TRUE),
  ('501508', 'Shabad / Shahbad', 18.0, TRUE),
  ('501509', 'Aloor / Chevella South', 10.0, TRUE),
  ('501510', 'Shankarpally / Janwada', 14.0, TRUE),
  ('501512', 'Kandada / Chevella North', 15.0, TRUE),
  ('501513', 'Damagundam / Forest Sanctuary', 8.0, TRUE),
  ('501203', 'Vikarabad / Ananthagiri Hills', 32.0, TRUE),
  ('501218', 'Tellapur / Kollur', 22.0, TRUE),
  ('501359', 'Mokila / Tangatur', 18.0, TRUE),
  ('500005', 'Chandrayangutta / Barkas', 38.0, TRUE),
  ('500019', 'Erragadda / Sanathnagar', 38.0, TRUE),
  ('500030', 'Rajendranagar / Pillar 200 / SVVU', 26.0, TRUE),
  ('500032', 'Gachibowli / Financial District', 26.0, TRUE),
  ('500035', 'Saroornagar / Kothapet', 46.0, TRUE),
  ('500046', 'Chandanagar / Serilingampally', 34.0, TRUE),
  ('500048', 'Old Bowenpally / Military Dairy Farm', 42.0, TRUE),
  ('500052', 'Bowenpally / Hasmathpet', 44.0, TRUE),
  ('500058', 'Uppal Kalan / IDA Uppal', 48.0, TRUE),
  ('500060', 'Dilsukhnagar / Malakpet', 44.0, TRUE),
  ('500069', 'Musheerabad / Kavadiguda', 42.0, TRUE),
  ('500070', 'Hayathnagar / Vanasthalipuram', 52.0, TRUE),
  ('500074', 'LB Nagar / Nagole', 48.0, TRUE),
  ('500075', 'Moinabad / Chilkur Balaji', 16.0, TRUE),
  ('500077', 'Bandlaguda Jagir / Sun City', 24.0, TRUE),
  ('500079', 'Karmanghat / Champapet', 46.0, TRUE),
  ('500084', 'Kondapur / Botanical Garden', 32.0, TRUE),
  ('500086', 'Hafeezpet / Madinaguda', 35.0, TRUE),
  ('500089', 'Manikonda / Puppalguda / Narsingi', 24.0, TRUE),
  ('500090', 'Nizampet / Bachupally', 42.0, TRUE),
  ('500091', 'Kismatpur / Peeramcheru', 22.0, TRUE),
  ('500092', 'Bowrampet / Gandimaisamma', 48.0, TRUE),
  ('500097', 'Attapur / Hyderguda', 28.0, TRUE),
  ('500098', 'Hydershakote / Manchirevula', 22.0, TRUE),
  ('500100', 'Miyapur / Hafeezpet West', 36.0, TRUE),
  ('500102', 'Nallagandla / Tellapur Extension', 25.0, TRUE),
  ('500104', 'Kokapet / Neopolis', 22.0, TRUE),
  ('500107', 'Narsingi / Ocean Park', 24.0, TRUE),
  ('500108', 'Financial District Phase 2 / Nanakramguda', 25.0, TRUE),
  ('500111', 'Puppalguda Golden Mile', 24.0, TRUE),
  ('500112', 'Kollur ORR Junction', 20.0, TRUE),
  ('500113', 'Velimela / Pati', 20.0, TRUE)
ON CONFLICT (pincode) DO UPDATE 
  SET area_name = EXCLUDED.area_name,
      distance_km = EXCLUDED.distance_km,
      is_enabled = EXCLUDED.is_enabled;

-- 3. Upsert default store delivery configuration in store_settings
INSERT INTO store_settings (key, value) VALUES
  ('delivery_rate_per_km', '10'),
  ('delivery_origin_address', '"Garuda Sanctuary, Mudimyala, Chevella, Telangana 501503"'),
  ('delivery_origin_pincode', '"501503"'),
  ('free_delivery_threshold', '1000')
ON CONFLICT (key) DO NOTHING;

COMMIT;
