-- Add phone numbers and session packages to NYC demo trainers.
-- Phone numbers use 555 reserved prefix (clearly fictional).
-- All packages priced in USD for market='com'.

-- ── Phone numbers ─────────────────────────────────────────────────────────────
UPDATE trainers SET phone = '+12125550101' WHERE slug = 'marcus-johnson-nyc';
UPDATE trainers SET phone = '+12125550102' WHERE slug = 'sarah-chen-ues';
UPDATE trainers SET phone = '+12125550103' WHERE slug = 'david-rivera-tribeca';
UPDATE trainers SET phone = '+12125550104' WHERE slug = 'james-okafor-harlem';
UPDATE trainers SET phone = '+12125550105' WHERE slug = 'emily-walsh-west-village';
UPDATE trainers SET phone = '+12125550106' WHERE slug = 'tom-hayes-chelsea';
UPDATE trainers SET phone = '+12125550107' WHERE slug = 'nina-patel-park-slope';
UPDATE trainers SET phone = '+12125550108' WHERE slug = 'alex-torres-williamsburg';
UPDATE trainers SET phone = '+12125550109' WHERE slug = 'lisa-santiago-dumbo';
UPDATE trainers SET phone = '+12125550110' WHERE slug = 'michael-brown-crown-heights';
UPDATE trainers SET phone = '+12125550111' WHERE slug = 'diana-kostadinova-astoria';
UPDATE trainers SET phone = '+12125550112' WHERE slug = 'ryan-kim-lic';
UPDATE trainers SET phone = '+12125550113' WHERE slug = 'jessica-deangelo-staten-island';
UPDATE trainers SET phone = '+12125550114' WHERE slug = 'priya-sharma-jackson-heights';
UPDATE trainers SET phone = '+12125550115' WHERE slug = 'carlos-mendez-bronx';

-- ── Session packages ──────────────────────────────────────────────────────────

-- marcus-johnson-nyc
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 400, 'USD', 50, 1, 'One 50-minute session. Strength or fat loss focus.', FALSE, 1 FROM trainers WHERE slug = 'marcus-johnson-nyc' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '5-Session Block', 1800, 'USD', 50, 5, 'Five sessions. Billed upfront, valid 60 days.', TRUE, 2 FROM trainers WHERE slug = 'marcus-johnson-nyc' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '10-Session Block', 3400, 'USD', 50, 10, 'Ten sessions. Best value. Valid 90 days.', FALSE, 3 FROM trainers WHERE slug = 'marcus-johnson-nyc' ON CONFLICT DO NOTHING;

-- sarah-chen-ues
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 450, 'USD', 60, 1, 'One 60-minute session. Women''s strength focus.', FALSE, 1 FROM trainers WHERE slug = 'sarah-chen-ues' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '4-Session Pack', 1700, 'USD', 60, 4, 'Four sessions. Strength programming with weekly check-ins.', TRUE, 2 FROM trainers WHERE slug = 'sarah-chen-ues' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Pack', 3200, 'USD', 60, 8, 'Eight sessions. Full body recomposition program.', FALSE, 3 FROM trainers WHERE slug = 'sarah-chen-ues' ON CONFLICT DO NOTHING;

-- david-rivera-tribeca
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 380, 'USD', 60, 1, 'One session. Athletic performance or movement quality.', FALSE, 1 FROM trainers WHERE slug = 'david-rivera-tribeca' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '6-Session Block', 2100, 'USD', 60, 6, 'Six sessions. Structured performance program.', TRUE, 2 FROM trainers WHERE slug = 'david-rivera-tribeca' ON CONFLICT DO NOTHING;

-- james-okafor-harlem
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 320, 'USD', 60, 1, 'One session. Bodybuilding or sport-specific prep.', FALSE, 1 FROM trainers WHERE slug = 'james-okafor-harlem' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '5-Session Block', 1450, 'USD', 60, 5, 'Five sessions. Progressive overload programming.', TRUE, 2 FROM trainers WHERE slug = 'james-okafor-harlem' ON CONFLICT DO NOTHING;

-- emily-walsh-west-village
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 420, 'USD', 60, 1, 'One session. Prenatal, postnatal, or mobility.', FALSE, 1 FROM trainers WHERE slug = 'emily-walsh-west-village' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '4-Session Pack', 1600, 'USD', 60, 4, 'Four sessions. Tailored to your stage and goals.', TRUE, 2 FROM trainers WHERE slug = 'emily-walsh-west-village' ON CONFLICT DO NOTHING;

-- tom-hayes-chelsea
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 350, 'USD', 60, 1, 'One session. Crossfit or conditioning focus.', FALSE, 1 FROM trainers WHERE slug = 'tom-hayes-chelsea' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Block', 2600, 'USD', 60, 8, 'Eight sessions. Build a real aerobic engine.', TRUE, 2 FROM trainers WHERE slug = 'tom-hayes-chelsea' ON CONFLICT DO NOTHING;

-- nina-patel-park-slope
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 280, 'USD', 75, 1, 'One 75-minute session. Yoga-based strength or mobility.', FALSE, 1 FROM trainers WHERE slug = 'nina-patel-park-slope' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '5-Session Pack', 1300, 'USD', 75, 5, 'Five sessions. Mindful movement programming.', TRUE, 2 FROM trainers WHERE slug = 'nina-patel-park-slope' ON CONFLICT DO NOTHING;

-- alex-torres-williamsburg
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 300, 'USD', 60, 1, 'One session. HIIT or functional movement.', FALSE, 1 FROM trainers WHERE slug = 'alex-torres-williamsburg' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '6-Session Block', 1650, 'USD', 60, 6, 'Six sessions. Group-style intensity, personal attention.', TRUE, 2 FROM trainers WHERE slug = 'alex-torres-williamsburg' ON CONFLICT DO NOTHING;

-- lisa-santiago-dumbo
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 370, 'USD', 60, 1, 'One session. Dance fitness or Zumba instruction.', FALSE, 1 FROM trainers WHERE slug = 'lisa-santiago-dumbo' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '4-Session Pack', 1350, 'USD', 60, 4, 'Four sessions. Fun, sweat, results.', TRUE, 2 FROM trainers WHERE slug = 'lisa-santiago-dumbo' ON CONFLICT DO NOTHING;

-- michael-brown-crown-heights
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 290, 'USD', 60, 1, 'One session. Calisthenics or bodyweight mastery.', FALSE, 1 FROM trainers WHERE slug = 'michael-brown-crown-heights' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '5-Session Block', 1350, 'USD', 60, 5, 'Five sessions. Progressively harder bodyweight programming.', TRUE, 2 FROM trainers WHERE slug = 'michael-brown-crown-heights' ON CONFLICT DO NOTHING;

-- diana-kostadinova-astoria
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 350, 'USD', 60, 1, 'One session. Boxing or martial arts conditioning.', FALSE, 1 FROM trainers WHERE slug = 'diana-kostadinova-astoria' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '6-Session Block', 1950, 'USD', 60, 6, 'Six sessions. Technical and conditioning combined.', TRUE, 2 FROM trainers WHERE slug = 'diana-kostadinova-astoria' ON CONFLICT DO NOTHING;

-- ryan-kim-lic
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 380, 'USD', 60, 1, 'One session. Olympic lifting or strength foundation.', FALSE, 1 FROM trainers WHERE slug = 'ryan-kim-lic' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '5-Session Block', 1750, 'USD', 60, 5, 'Five sessions. Technical coaching with video review.', TRUE, 2 FROM trainers WHERE slug = 'ryan-kim-lic' ON CONFLICT DO NOTHING;

-- jessica-deangelo-staten-island
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 260, 'USD', 60, 1, 'One session. Senior fitness or gentle strength.', FALSE, 1 FROM trainers WHERE slug = 'jessica-deangelo-staten-island' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '4-Session Pack', 950, 'USD', 60, 4, 'Four sessions. Safe, progressive, functional.', TRUE, 2 FROM trainers WHERE slug = 'jessica-deangelo-staten-island' ON CONFLICT DO NOTHING;

-- priya-sharma-jackson-heights
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 270, 'USD', 60, 1, 'One session. Nutrition coaching or lifestyle assessment.', FALSE, 1 FROM trainers WHERE slug = 'priya-sharma-jackson-heights' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '4-Session Pack', 980, 'USD', 60, 4, 'Four sessions. Habit change with accountability check-ins.', TRUE, 2 FROM trainers WHERE slug = 'priya-sharma-jackson-heights' ON CONFLICT DO NOTHING;

-- carlos-mendez-bronx
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 250, 'USD', 60, 1, 'One session. Soccer-specific speed and agility.', FALSE, 1 FROM trainers WHERE slug = 'carlos-mendez-bronx' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '6-Session Block', 1380, 'USD', 60, 6, 'Six sessions. Pre-season conditioning block.', TRUE, 2 FROM trainers WHERE slug = 'carlos-mendez-bronx' ON CONFLICT DO NOTHING;
