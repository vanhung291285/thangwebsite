
import { createClient } from '@supabase/supabase-js';

// Thông tin dự án từ người dùng
const PROJECT_URL = 'https://coewpyizwqhxabavzeuo.supabase.co';
const ANON_KEY = 'sb_publishable_Xq_pB7nEw-5brUwW0QpNPw_AHlSAVok';

// Hàm lấy biến môi trường an toàn (ưu tiên env, sau đó dùng giá trị mặc định)
const getEnv = (key: string, fallback: string): string => {
  try {
    const env = (process.env as any) || {};
    return env[key] || env[`VITE_${key}`] || env[`NEXT_PUBLIC_${key}`] || fallback;
  } catch {
    return fallback;
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL', PROJECT_URL);
const SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY', ANON_KEY);

export const isSupabaseReady = SUPABASE_URL.includes('supabase.co') && SUPABASE_KEY.length > 5;

// Khởi tạo client
export const supabase = isSupabaseReady 
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null as any;

if (!isSupabaseReady) {
  console.error("Supabase Config is invalid!");
}
