
-- ==============================================================================
-- SCRIPT NÂNG CẤP QUYỀN QUẢN TRỊ (ADMIN)
-- Hướng dẫn: 
-- 1. Đăng ký một tài khoản trên website trước.
-- 2. Thay thế email bên dưới bằng email bạn đã đăng ký.
-- 3. Chạy lệnh này trong Supabase SQL Editor.
-- ==============================================================================

-- Cách 1: Nâng cấp theo Email (Dễ nhất)
UPDATE public.user_profiles 
SET role = 'ADMIN' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com' -- <-- THAY EMAIL VÀO ĐÂY
);

-- Cách 2: Nếu bạn muốn tất cả các tài khoản hiện có đều thành Admin (Chỉ dùng khi mới cài đặt)
-- UPDATE public.user_profiles SET role = 'ADMIN';

-- Kiểm tra lại danh sách quyền
SELECT p.full_name, u.email, p.role 
FROM public.user_profiles p
JOIN auth.users u ON p.id = u.id;
