/*
  # Seed advisor and user data

  1. Sample Data
    - 10 SEBI Registered Analysts
    - 10 Mutual Fund Distributors
    - Each advisor has:
      - Unique registration numbers
      - Varying years of experience
      - Multiple languages
      - Verified status
      - Profile information
*/

-- Seed SEBI Registered Analysts
INSERT INTO users (id, email, password_hash, full_name, role, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'priya.sharma@example.com', 'dummy_hash', 'Priya Sharma', 'advisor', '+91-9876543210'),
  ('22222222-2222-2222-2222-222222222222', 'rajesh.kumar@example.com', 'dummy_hash', 'Rajesh Kumar', 'advisor', '+91-9876543211'),
  ('33333333-3333-3333-3333-333333333333', 'aisha.patel@example.com', 'dummy_hash', 'Aisha Patel', 'advisor', '+91-9876543212'),
  ('44444444-4444-4444-4444-444444444444', 'vikram.singh@example.com', 'dummy_hash', 'Vikram Singh', 'advisor', '+91-9876543213'),
  ('55555555-5555-5555-5555-555555555555', 'neha.gupta@example.com', 'dummy_hash', 'Neha Gupta', 'advisor', '+91-9876543214'),
  ('66666666-6666-6666-6666-666666666666', 'arjun.reddy@example.com', 'dummy_hash', 'Arjun Reddy', 'advisor', '+91-9876543215'),
  ('77777777-7777-7777-7777-777777777777', 'zara.khan@example.com', 'dummy_hash', 'Zara Khan', 'advisor', '+91-9876543216'),
  ('88888888-8888-8888-8888-888888888888', 'rahul.mehta@example.com', 'dummy_hash', 'Rahul Mehta', 'advisor', '+91-9876543217'),
  ('99999999-9999-9999-9999-999999999999', 'ananya.das@example.com', 'dummy_hash', 'Ananya Das', 'advisor', '+91-9876543218'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'karthik.raj@example.com', 'dummy_hash', 'Karthik Raj', 'advisor', '+91-9876543219');

INSERT INTO advisors (user_id, registration_number, registration_type, years_of_experience, languages, about_me, profile_picture_url, is_verified) VALUES
  ('11111111-1111-1111-1111-111111111111', 'INH000001234', 'SEBI', 12, ARRAY['English', 'Hindi', 'Gujarati'], 'Experienced SEBI registered research analyst specializing in equity markets and mutual funds.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'INH000001235', 'SEBI', 8, ARRAY['English', 'Hindi', 'Telugu'], 'Technical analysis expert with a focus on short to medium-term trading strategies.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'INH000001236', 'SEBI', 15, ARRAY['English', 'Gujarati', 'Marathi'], 'Fundamental analysis specialist with focus on long-term wealth creation.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'INH000001237', 'SEBI', 10, ARRAY['English', 'Hindi', 'Punjabi'], 'Expert in portfolio management and risk assessment.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('55555555-5555-5555-5555-555555555555', 'INH000001238', 'SEBI', 7, ARRAY['English', 'Bengali', 'Hindi'], 'Specializing in small-cap and mid-cap stock analysis.', 'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('66666666-6666-6666-6666-666666666666', 'INH000001239', 'SEBI', 13, ARRAY['English', 'Telugu', 'Tamil'], 'Expert in sectoral analysis and market trends.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('77777777-7777-7777-7777-777777777777', 'INH000001240', 'SEBI', 9, ARRAY['English', 'Urdu', 'Hindi'], 'Specialist in derivatives and options trading strategies.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('88888888-8888-8888-8888-888888888888', 'INH000001241', 'SEBI', 11, ARRAY['English', 'Marathi', 'Hindi'], 'Focus on dividend investing and value stocks.', 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('99999999-9999-9999-9999-999999999999', 'INH000001242', 'SEBI', 6, ARRAY['English', 'Bengali', 'Hindi'], 'Expert in IPO analysis and new market opportunities.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'INH000001243', 'SEBI', 14, ARRAY['English', 'Tamil', 'Malayalam'], 'Specializing in global markets and international investments.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true);

-- Seed Mutual Fund Distributors
INSERT INTO users (id, email, password_hash, full_name, role, phone) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'amit.patel@example.com', 'dummy_hash', 'Amit Patel', 'advisor', '+91-9876543220'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'meera.reddy@example.com', 'dummy_hash', 'Meera Reddy', 'advisor', '+91-9876543221'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'suresh.kumar@example.com', 'dummy_hash', 'Suresh Kumar', 'advisor', '+91-9876543222'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'divya.sharma@example.com', 'dummy_hash', 'Divya Sharma', 'advisor', '+91-9876543223'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'rohit.verma@example.com', 'dummy_hash', 'Rohit Verma', 'advisor', '+91-9876543224'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'pooja.iyer@example.com', 'dummy_hash', 'Pooja Iyer', 'advisor', '+91-9876543225'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'farhan.qureshi@example.com', 'dummy_hash', 'Farhan Qureshi', 'advisor', '+91-9876543226'),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'shreya.joshi@example.com', 'dummy_hash', 'Shreya Joshi', 'advisor', '+91-9876543227'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'arun.nair@example.com', 'dummy_hash', 'Arun Nair', 'advisor', '+91-9876543228'),
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'lisa.dsouza@example.com', 'dummy_hash', 'Lisa Dsouza', 'advisor', '+91-9876543229');

INSERT INTO advisors (user_id, registration_number, registration_type, years_of_experience, languages, about_me, profile_picture_url, is_verified) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ARN-12345', 'MFD', 10, ARRAY['English', 'Gujarati', 'Hindi'], 'Experienced mutual fund distributor specializing in tax-saving and retirement planning.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ARN-12346', 'MFD', 6, ARRAY['English', 'Tamil', 'Telugu'], 'Specializing in goal-based investing and SIP planning.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ARN-12347', 'MFD', 12, ARRAY['English', 'Kannada', 'Hindi'], 'Expert in debt mutual funds and fixed-income investments.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ARN-12348', 'MFD', 8, ARRAY['English', 'Hindi', 'Punjabi'], 'Specializing in children\'s education planning and retirement solutions.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ARN-12349', 'MFD', 15, ARRAY['English', 'Hindi', 'Marathi'], 'Focus on high-net-worth individual portfolio management.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'ARN-12350', 'MFD', 7, ARRAY['English', 'Tamil', 'Malayalam'], 'Expert in international fund investments.', 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'ARN-12351', 'MFD', 9, ARRAY['English', 'Urdu', 'Hindi'], 'Specializing in Shariah-compliant mutual funds.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'ARN-12352', 'MFD', 11, ARRAY['English', 'Marathi', 'Gujarati'], 'Focus on small-cap and mid-cap fund selection.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'ARN-12353', 'MFD', 13, ARRAY['English', 'Malayalam', 'Tamil'], 'Expert in tax-efficient mutual fund investing.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true),
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'ARN-12354', 'MFD', 5, ARRAY['English', 'Konkani', 'Hindi'], 'Specializing in new fund offers and fund analysis.', 'https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', true);