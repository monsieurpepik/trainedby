-- Fix broken avatar URL for Emily Chen (UK market)
-- photo-1609899464726-209f9a4e9b6c returns 404 on Unsplash
UPDATE trainers
SET avatar_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85'
WHERE slug = 'emily-chen-uk'
  AND market = 'uk';

-- Remove duplicate session_packages that may have been created by running
-- the market_trainers migration more than once.
-- Keep only the package with the lowest id (first inserted) per trainer+name combo.
DELETE FROM session_packages
WHERE id NOT IN (
  SELECT MIN(id)
  FROM session_packages
  GROUP BY trainer_id, name
);

-- Also fix the find.astro demo data URL for Emily Chen
-- (this is in code, not DB, but document the replacement here)
-- Old: photo-1609899464726-209f9a4e9b6c
-- New: photo-1571019613454-1cb2f99b2d8b (verified 200 OK)
