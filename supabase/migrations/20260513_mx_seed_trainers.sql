-- Mexico market seed trainers
-- 4 trainers: CDMX (×2), Guadalajara, Monterrey
-- market = 'mx', locale = 'es'
-- Also expands market/locale check constraints to include 'mx' and 'com'

ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_market_check;
ALTER TABLE trainers ADD CONSTRAINT trainers_market_check
  CHECK (market = ANY (ARRAY['ae','uk','us','com','es','mx','fr','it','in']));

ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_locale_check;
ALTER TABLE trainers ADD CONSTRAINT trainers_locale_check
  CHECK (locale = ANY (ARRAY['en','fr','it','es']));

INSERT INTO trainers (
  slug, name, email, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count,
  city, country, instagram, training_modes,
  verification_status, plan, accepting_clients, locale, market, gender
) VALUES
(
  'carlos-mendoza-mx', 'Carlos Mendoza', 'carlos.mendoza.mx@trainedby.demo',
  'Entrenador de Fuerza y Acondicionamiento — CDMX',
  'Entrenador certificado CONADE con 9 años de experiencia en Ciudad de México. Me especializo en fuerza funcional, pérdida de grasa y rendimiento deportivo. Trabajo con profesionales ocupados que quieren resultados reales sin perder el tiempo. Entreno en Santa Fe, Polanco y online para toda la República.',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=85',
  ARRAY['Fuerza Funcional','Pérdida de Grasa','Rendimiento Deportivo','Entrenamiento en Circuito'],
  ARRAY['CONADE Entrenador Certificado','NSCA CSCS','FMS Nivel 2'],
  9, 280, 4.9, 41, 'Ciudad de México', 'Mexico', 'carlos.mendoza.fit',
  ARRAY['in-person','online'], 'verified', 'pro', TRUE, 'es', 'mx', 'male'
),
(
  'valeria-reyes-mx', 'Valeria Reyes', 'valeria.reyes.mx@trainedby.demo',
  'Entrenadora de Bienestar Femenino — Guadalajara',
  'Entrenadora personal ISSA y instructora de yoga RYT 500 en Guadalajara. Trabajo con mujeres que quieren recuperar su energía, fortalecer su cuerpo y mejorar su relación con el movimiento. Sin dietas extremas, sin entrenamientos imposibles. Resultados sostenibles desde el primer mes.',
  'https://images.unsplash.com/photo-1609899537878-48700df47cf4?w=800&q=85',
  ARRAY['Bienestar Femenino','Yoga','Entrenamiento Funcional','Nutrición Básica'],
  ARRAY['ISSA Personal Trainer','RYT 500 Yoga Alliance','Especialista en Fitness Femenino'],
  6, 195, 5.0, 38, 'Guadalajara', 'Mexico', 'valeria.reyes.wellness',
  ARRAY['in-person','online'], 'verified', 'pro', TRUE, 'es', 'mx', 'female'
),
(
  'diego-flores-mx', 'Diego Flores', 'diego.flores.mx@trainedby.demo',
  'Especialista en Rendimiento Atlético — Monterrey',
  'Ex futbolista profesional, ahora entrenador NSCA en Monterrey. Llevo 7 años preparando atletas amateur y profesionales: velocidad, potencia explosiva y acondicionamiento físico de alto rendimiento. Si quieres entrenar como deportista de élite, aquí es. Disponible en San Pedro Garza García y online.',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=85',
  ARRAY['Rendimiento Atlético','Velocidad','Potencia Explosiva','Preparación Física'],
  ARRAY['NSCA CSCS','CONADE Entrenador de Alto Rendimiento','UEFA C License'],
  7, 165, 4.8, 29, 'Monterrey', 'Mexico', 'diego.flores.performance',
  ARRAY['in-person','online'], 'verified', 'pro', TRUE, 'es', 'mx', 'male'
),
(
  'sofia-herrera-mx', 'Sofía Herrera', 'sofia.herrera.mx@trainedby.demo',
  'Entrenadora de Fuerza y Nutrición — CDMX',
  'Entrenadora certificada ISSA y nutricionista deportiva en la Ciudad de México. Me especializo en transformaciones integrales: entreno tu cuerpo y ajusto tu alimentación al mismo tiempo. 8 años, más de 200 clientes, resultados documentados. Zona Roma, Condesa y online.',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b6?w=800&q=85',
  ARRAY['Transformación Corporal','Nutrición Deportiva','Entrenamiento de Fuerza','Hábitos Saludables'],
  ARRAY['ISSA Certified Personal Trainer','ISSA Nutrition Coach','CONADE Nivel 2'],
  8, 220, 4.9, 44, 'Ciudad de México', 'Mexico', 'sofia.herrera.fit',
  ARRAY['in-person','online'], 'verified', 'pro', TRUE, 'es', 'mx', 'female'
)
ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  plan = EXCLUDED.plan;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesión Individual', 900, 'MXN', 60, 1, 'Una sesión de 60 minutos de fuerza y acondicionamiento personalizado.', FALSE, 1 FROM trainers WHERE slug = 'carlos-mendoza-mx' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Paquete 8 Sesiones', 6400, 'MXN', 60, 8, '8 sesiones de entrenamiento. Incluye plan personalizado.', TRUE, 2 FROM trainers WHERE slug = 'carlos-mendoza-mx' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesión Individual', 800, 'MXN', 55, 1, 'Sesión de 55 minutos de entrenamiento funcional y bienestar femenino.', FALSE, 1 FROM trainers WHERE slug = 'valeria-reyes-mx' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Paquete Mensual', 5600, 'MXN', 55, 8, '8 sesiones al mes. Incluye plan de nutrición básica y seguimiento semanal.', TRUE, 2 FROM trainers WHERE slug = 'valeria-reyes-mx' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesión Individual', 1000, 'MXN', 60, 1, 'Sesión de rendimiento atlético de 60 minutos. Evaluación inicial incluida.', FALSE, 1 FROM trainers WHERE slug = 'diego-flores-mx' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Programa Élite 12 Sesiones', 9600, 'MXN', 60, 12, '12 sesiones de preparación física de alto rendimiento. Plan de periodización incluido.', TRUE, 2 FROM trainers WHERE slug = 'diego-flores-mx' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesión Individual', 850, 'MXN', 60, 1, 'Sesión de 60 minutos de fuerza con revisión nutricional básica incluida.', FALSE, 1 FROM trainers WHERE slug = 'sofia-herrera-mx' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Transformación Integral — 1 Mes', 6000, 'MXN', 60, 8, '8 sesiones + plan de nutrición personalizado + check-in semanal.', TRUE, 2 FROM trainers WHERE slug = 'sofia-herrera-mx' ON CONFLICT DO NOTHING;
