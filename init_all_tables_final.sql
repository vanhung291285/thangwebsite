
-- ==============================================================================
-- MASTER SQL FINAL FIX (2024 V2): KHỞI TẠO TOÀN DIỆN CHO WEBSUOILU
-- Hướng dẫn: Copy toàn bộ vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 0. Bật UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG THỐNG KÊ (QUAN TRỌNG NHẤT ĐỂ KHÔNG TREO APP)
CREATE TABLE IF NOT EXISTS public.daily_stats (
    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG CẤU HÌNH
CREATE TABLE IF NOT EXISTS public.school_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT DEFAULT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
    slogan TEXT DEFAULT 'Dạy tốt - Học tốt - Rèn luyện tốt',
    logo_url TEXT,
    favicon_url TEXT,
    banner_url TEXT,
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
    meta_title TEXT DEFAULT 'Trường PTDTBT TH và THCS Suối Lư',
    meta_description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG CHUYÊN MỤC
CREATE TABLE IF NOT EXISTS public.post_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT 'blue',
    order_index INTEGER DEFAULT 0
);

-- 4. BẢNG BÀI VIẾT
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail TEXT,
    author TEXT DEFAULT 'Admin',
    date DATE DEFAULT CURRENT_DATE,
    category TEXT,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    show_on_home BOOLEAN DEFAULT true,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BẢNG MENU & BLOCKS
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.display_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT DEFAULT 'main',
    type TEXT DEFAULT 'grid',
    order_index INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 4,
    is_visible BOOLEAN DEFAULT true,
    html_content TEXT,
    target_page TEXT DEFAULT 'all'
);

-- ==============================================================================
-- PHÂN QUYỀN TRUY CẬP (RLS) - ĐẢM BẢO KẾT NỐI TỪ VERCEL THÔNG SUỐT
-- ==============================================================================

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Cho phép Khách xem dữ liệu (Public READ)
        EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Public Select" ON public.%I FOR SELECT USING (true)', t);
        
        -- Cho phép Admin TOÀN QUYỀN (Auth ALL)
        EXECUTE format('DROP POLICY IF EXISTS "Admin Manage" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Admin Manage" ON public.%I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', t);
    END LOOP;
END $$;

-- ==============================================================================
-- HÀM BỔ TRỢ (RPC)
-- ==============================================================================

-- Hàm tăng view website
CREATE OR REPLACE FUNCTION public.increment_page_view() RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_stats (date, visit_count) VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cấp quyền gọi hàm cho Public
GRANT EXECUTE ON FUNCTION public.increment_page_view() TO anon, authenticated;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO (ĐẢM BẢO APP KHÔNG RỖNG)
-- ==============================================================================
INSERT INTO public.school_config (name, slogan) 
SELECT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ', 'Dạy tốt - Học tốt - Rèn luyện tốt'
WHERE NOT EXISTS (SELECT 1 FROM public.school_config);

INSERT INTO public.post_categories (name, slug, color, order_index)
SELECT 'Tin tức', 'news', 'blue', 1 WHERE NOT EXISTS (SELECT 1 FROM public.post_categories WHERE slug = 'news');

INSERT INTO public.menu_items (label, path, order_index)
SELECT 'Trang chủ', 'home', 1 WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE path = 'home');

INSERT INTO public.display_blocks (name, type, position, order_index)
SELECT 'Tin mới nhất', 'grid', 'main', 1 WHERE NOT EXISTS (SELECT 1 FROM public.display_blocks WHERE type = 'grid');
