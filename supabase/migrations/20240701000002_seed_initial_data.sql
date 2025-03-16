-- Seed initial data for the Ninio Kindergarten application

-- Insert sample programs
INSERT INTO programs (title, age_group, schedule, description, image_url, category, featured)
VALUES
  ('Early Explorers', '2-3 years', 'Mon-Fri, 9:00 AM - 12:00 PM', 'A gentle introduction to structured learning through play, focusing on social skills, language development, and sensory exploration.', 'https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=600&q=80', 'core', true),
  ('Curious Minds', '3-4 years', 'Mon-Fri, 9:00 AM - 1:00 PM', 'Building on foundational skills with more structured activities focusing on pre-literacy, numeracy, and creative expression.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', 'core', false),
  ('Kindergarten Prep', '4-5 years', 'Mon-Fri, 9:00 AM - 2:00 PM', 'Comprehensive program preparing children for kindergarten with focus on academic readiness, independence, and problem-solving skills.', 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?w=600&q=80', 'core', false),
  ('After School Enrichment', '3-5 years', 'Mon-Fri, 2:00 PM - 5:00 PM', 'Extended day program offering supervised play, homework help for older children, and specialized enrichment activities.', 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=600&q=80', 'extended', false),
  ('Little Artists', 'All ages', 'Tuesdays & Thursdays, 3:00 PM - 4:00 PM', 'Explore various art mediums and techniques while developing creativity, fine motor skills, and self-expression.', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80', 'enrichment', false),
  ('Music & Movement', 'All ages', 'Mondays & Wednesdays, 3:00 PM - 4:00 PM', 'Develop rhythm, coordination, and musical appreciation through singing, dancing, and playing simple instruments.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', 'enrichment', false);

-- Insert sample facilities
INSERT INTO facilities (title, description, image_url, features)
VALUES
  ('Modern Classrooms', 'Bright, spacious classrooms equipped with interactive learning tools and comfortable furniture designed for young learners.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', '{"features": ["Interactive whiteboards", "Child-sized furniture", "Reading corners", "Natural lighting"]}'),
  ('Safe Playground', 'Secure outdoor play area with age-appropriate equipment, soft surfaces, and shaded spaces for year-round enjoyment.', 'https://images.unsplash.com/photo-1597430203889-c93cce4aaa47?w=800&q=80', '{"features": ["Soft impact surfaces", "Age-appropriate equipment", "Secure fencing", "Shaded areas"]}'),
  ('Creative Arts Studio', 'Dedicated space for artistic expression with materials and tools that encourage creativity and fine motor skill development.', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&q=80', '{"features": ["Art supplies", "Display areas", "Washable surfaces", "Multi-purpose tables"]}'),
  ('Dining Area', 'Clean, welcoming space where children enjoy nutritious meals and learn important social skills during mealtimes.', 'https://images.unsplash.com/photo-1544781508-91a38e1084c9?w=800&q=80', '{"features": ["Child-friendly tables", "Hygienic surfaces", "Allergen-free zones", "Bright atmosphere"]}');

-- Insert sample activities
INSERT INTO activities (name, description, age_group, duration, date, image_url, category)
VALUES
  ('Finger Painting', 'Creative art session where children use finger paints to create colorful artwork.', '3-4 years', '45 minutes', CURRENT_DATE + INTERVAL '1 day', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80', 'Creative'),
  ('Story Time', 'Interactive storytelling session with picture books and puppets.', '2-5 years', '30 minutes', CURRENT_DATE + INTERVAL '2 days', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80', 'Literacy'),
  ('Outdoor Play', 'Supervised playtime in the outdoor playground with various equipment.', '3-5 years', '60 minutes', CURRENT_DATE + INTERVAL '3 days', 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&q=80', 'Physical'),
  ('Music & Movement', 'Children learned simple rhythms and movements with percussion instruments.', '2-4 years', '45 minutes', CURRENT_DATE + INTERVAL '4 days', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', 'Music'),
  ('Science Exploration', 'Simple science experiments that introduce basic scientific concepts.', '4-5 years', '45 minutes', CURRENT_DATE + INTERVAL '5 days', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80', 'Science');

-- Insert sample events
INSERT INTO events (title, date, time, description, location, type)
VALUES
  ('Parent-Teacher Meeting', CURRENT_DATE + INTERVAL '7 days', '15:00', 'Quarterly meeting to discuss student progress', 'Main Hall', 'meeting'),
  ('Summer Festival', CURRENT_DATE + INTERVAL '14 days', '10:00', 'Annual summer celebration with games and performances', 'Kindergarten Playground', 'activity'),
  ('Art Exhibition', CURRENT_DATE + INTERVAL '21 days', '13:30', 'Showcasing children''s artwork from the semester', 'Art Room', 'activity'),
  ('Staff Development Day', CURRENT_DATE + INTERVAL '28 days', '08:00', 'Kindergarten closed for staff professional development', 'Main Building', 'holiday'),
  ('Science Day', CURRENT_DATE + INTERVAL '35 days', '10:00', 'Interactive science experiments and demonstrations for all children', 'Science Room', 'activity');
