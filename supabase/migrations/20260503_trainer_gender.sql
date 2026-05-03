-- Add gender column to trainers
-- Used for the "Female Trainers" filter on /find

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS gender TEXT
    CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));

-- Seed gender for existing demo trainers based on names
UPDATE trainers SET gender = 'female' WHERE slug IN (
  'sarah-al-mansoori', 'sarah',
  'nour-haddad',
  'ana-martinez', 'lucia-fernandez',
  'camille-dubois',
  'priya-kapoor',
  'giulia-romano', 'sofia-bianchi',
  'emily-chen-uk',
  'ashley-rivera'
);

UPDATE trainers SET gender = 'male' WHERE slug IN (
  'khalid-rashid',
  'pablo-garcia',
  'antoine-leroy', 'thomas-moreau',
  'arjun-sharma', 'rohit-verma',
  'marco-ferrari',
  'james-hartley', 'tom-walsh-uk',
  'derek-kim', 'marcus-johnson'
);
