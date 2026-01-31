
-- ==============================================================================
-- SCRIPT TỔNG HỢP DI CHUYỂN DỮ LIỆU SANG SERVER SINGAPORE
-- Hướng dẫn: Copy toàn bộ nội dung này vào SQL Editor của dự án Singapore mới và nhấn RUN.
-- ==============================================================================

-- 1. BẢNG CẤU HÌNH (SCHOOL_CONFIG)
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan TEXT DEFAULT 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logo_url TEXT,
  banner_url TEXT,
  favicon_url TEXT,
  address TEXT DEFAULT 'Xã Suối Lư, Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone TEXT,
  email TEXT,
  hotline TEXT,
  map_url TEXT,
  facebook TEXT,
  youtube TEXT,
  website TEXT,
  show_welcome_banner BOOLEAN DEFAULT true,
  home_news_count INTEGER DEFAULT 6,
  home_show_program BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#1e3a8a',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE school_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Config" ON school_config FOR SELECT USING (true);
CREATE POLICY "Auth Manage Config" ON school_config FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO school_config (name) SELECT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ' WHERE NOT EXISTS (SELECT 1 FROM school_config);

-- 2. BẢNG CHUYÊN MỤC (POST_CATEGORIES)
CREATE TABLE IF NOT EXISTS post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT 'blue',
  order_index INTEGER DEFAULT 0
);
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Categories" ON post_categories FOR SELECT USING (true);
CREATE POLICY "Auth Manage Categories" ON post_categories FOR ALL USING (auth.role() = 'authenticated');

-- 3. BẢNG BÀI VIẾT (POSTS)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  thumbnail TEXT,
  image_caption TEXT,
  author TEXT,
  date DATE DEFAULT CURRENT_DATE,
  category TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT true,
  block_ids TEXT[],
  tags TEXT[],
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Auth Manage Posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);

-- 4. BẢNG CÁN BỘ (STAFF_MEMBERS)
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date DATE,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0
);
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Staff" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Auth Manage Staff" ON staff_members FOR ALL USING (auth.role() = 'authenticated');

-- 5. BẢNG VIDEOS
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Auth Manage Videos" ON videos FOR ALL USING (auth.role() = 'authenticated');

-- 6. THỐNG KÊ TRUY CẬP (DAILY_STATS)
CREATE TABLE IF NOT EXISTS daily_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  visit_count INTEGER DEFAULT 1
);
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stats" ON daily_stats FOR SELECT USING (true);
CREATE OR REPLACE FUNCTION increment_page_view() RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, visit_count) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PROFILE NGƯỜI DÙNG (USER_PROFILES)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'GUEST'
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Profile" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger tự động tạo Profile khi đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, username, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', 'GUEST');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
