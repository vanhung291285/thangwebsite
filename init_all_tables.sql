
-- ==============================================================================
-- SCRIPT KHỞI TẠO TOÀN BỘ HỆ THỐNG DỮ LIỆU WEBSITE (websuoilu)
-- ==============================================================================

-- Bật tiện ích UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cấu hình trường học
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan TEXT DEFAULT 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logo_url TEXT,
  banner_url TEXT,
  favicon_url TEXT,
  principal_name TEXT,
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

-- 2. Chuyên mục bài viết
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

-- 3. Bài viết (Tin tức)
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
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Auth Manage Posts" ON posts FOR ALL USING (auth.role() = 'authenticated');

-- 4. Văn bản & Tài liệu
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0
);
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Doc Cats" ON document_categories FOR SELECT USING (true);
CREATE POLICY "Auth Manage Doc Cats" ON document_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES document_categories(id),
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Docs" ON documents FOR SELECT USING (true);
CREATE POLICY "Auth Manage Docs" ON documents FOR ALL USING (auth.role() = 'authenticated');

-- 5. Album ảnh & Hình ảnh
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Albums" ON gallery_albums FOR SELECT USING (true);
CREATE POLICY "Auth Manage Albums" ON gallery_albums FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption TEXT,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Auth Manage Images" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- 6. Video (Youtube)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Auth Manage Videos" ON videos FOR ALL USING (auth.role() = 'authenticated');

-- 7. Cán bộ giáo viên
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date DATE,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Staff" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Auth Manage Staff" ON staff_members FOR ALL USING (auth.role() = 'authenticated');

-- 8. Menu hệ thống
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Auth Manage Menu" ON menu_items FOR ALL USING (auth.role() = 'authenticated');

-- 9. Khối hiển thị (Blocks)
CREATE TABLE IF NOT EXISTS display_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT,
  type TEXT,
  order_index INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 4,
  is_visible BOOLEAN DEFAULT true,
  html_content TEXT,
  target_page TEXT DEFAULT 'all'
);
ALTER TABLE display_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Blocks" ON display_blocks FOR SELECT USING (true);
CREATE POLICY "Auth Manage Blocks" ON display_blocks FOR ALL USING (auth.role() = 'authenticated');

-- 10. Giới thiệu nhà trường
CREATE TABLE IF NOT EXISTS school_introductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);
ALTER TABLE school_introductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Intro" ON school_introductions FOR SELECT USING (true);
CREATE POLICY "Auth Manage Intro" ON school_introductions FOR ALL USING (auth.role() = 'authenticated');

-- 11. Thống kê truy cập
CREATE TABLE IF NOT EXISTS daily_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  visit_count INTEGER DEFAULT 1
);
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stats" ON daily_stats FOR SELECT USING (true);

-- Hàm tăng view
CREATE OR REPLACE FUNCTION increment_page_view() RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, visit_count) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm tăng view bài viết
CREATE OR REPLACE FUNCTION increment_post_view(post_id UUID) RETURNS void AS $$
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. User Profiles
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
