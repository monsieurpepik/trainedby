-- Assign local mockup photos to trainers with no avatar_url.
-- Photos served from Netlify public/mockup/.
-- Only updates rows where avatar_url IS NULL or empty — never overwrites.

-- Female trainers: alternate between yoga and jogging photos
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM trainers
  WHERE (avatar_url IS NULL OR avatar_url = '')
    AND gender = 'female'
)
UPDATE trainers t
SET avatar_url = CASE
  WHEN r.rn % 2 = 1
    THEN 'https://trainedby.ae/mockup/Smiling_Woman_Holding_A_Yoga_Mat_original_1533570.jpg'
  ELSE
    'https://trainedby.ae/mockup/Woman_Jogging_In_The_Park_At_Sunny_Morning_original_2610180.jpg'
END
FROM ranked r
WHERE t.id = r.id;

-- Male trainers: alternate between cable crossover and pushups photos
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM trainers
  WHERE (avatar_url IS NULL OR avatar_url = '')
    AND gender = 'male'
)
UPDATE trainers t
SET avatar_url = CASE
  WHEN r.rn % 2 = 1
    THEN 'https://trainedby.ae/mockup/Sportsman_Training_In_Cable_Crossover_original_1252808.jpg'
  ELSE
    'https://trainedby.ae/mockup/Reverse_Pushups_Outdoors_original_808410.jpg'
END
FROM ranked r
WHERE t.id = r.id;

-- No gender set → cable crossover as default
UPDATE trainers
SET avatar_url = 'https://trainedby.ae/mockup/Sportsman_Training_In_Cable_Crossover_original_1252808.jpg'
WHERE (avatar_url IS NULL OR avatar_url = '')
  AND gender IS NULL;
