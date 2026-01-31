
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { DatabaseService } from '../services/database';
import { Lock, User as UserIcon, GraduationCap, AlertCircle, ArrowLeft, Info, Send, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleResendEmail = async () => {
    if (!email || !supabase) return;
    setError('');
    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      setSuccessMsg('Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).');
      setShowResend(false);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Hệ thống chưa kết nối với Database.");
    
    setError('');
    setSuccessMsg('');
    setLoading(true);
    setShowResend(false);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
         email: email,
         password: password
      });

      if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
              throw new Error('Email hoặc mật khẩu không chính xác.');
          } else if (authError.message.includes('Email not confirmed')) {
              setShowResend(true);
              throw new Error('Tài khoản chưa được xác nhận. Vui lòng kiểm tra Email để kích hoạt.');
          }
          throw authError;
      }

      if (data.session && data.user) {
          const userProfile = await DatabaseService.getUserProfile(data.user.id);
          
          const user: User = {
             id: data.user.id,
             username: userProfile?.username || email.split('@')[0],
             email: email,
             fullName: userProfile?.fullName || data.user.user_metadata?.full_name || 'Thành viên', 
             role: userProfile?.role || UserRole.GUEST 
          };
          
          onLoginSuccess(user);
          
          if (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR) {
            onNavigate('admin-dashboard');
          } else {
            alert("Đăng nhập thành công! Tuy nhiên, tài khoản của bạn đang ở quyền KHÁCH (GUEST).\n\nNếu bạn là giáo viên, hãy liên hệ Quản trị viên tối cao để được cấp quyền Quản lý/Biên tập.");
            onNavigate('home');
          }
      }
    } catch (err: any) {
        setError(err.message || 'Đăng nhập thất bại.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative py-12 px-4">
      <button 
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 flex items-center text-slate-500 hover:text-blue-600 transition font-bold text-sm uppercase tracking-tight"
      >
        <ArrowLeft size={18} className="mr-2" /> Về trang chủ
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-3 border border-blue-100">
             <GraduationCap size={40} className="text-blue-600" />
           </div>
           <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Đăng nhập Hệ thống</h2>
           <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Cổng thông tin nội bộ Suối Lư</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm flex flex-col border border-red-100 animate-shake">
             <div className="flex items-start">
                <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
                <div className="font-bold">{error}</div>
             </div>
             {showResend && (
               <button 
                  onClick={handleResendEmail}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-md"
               >
                  <Send size={14} /> GỬI LẠI EMAIL XÁC NHẬN
               </button>
             )}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 text-sm flex items-start border border-emerald-100 animate-fade-in">
             <CheckCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
             <div className="font-bold">{successMsg}</div>
          </div>
        )}

        <div className="bg-blue-50/50 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-blue-100">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                Mặc định tài khoản đăng ký mới sẽ có quyền <b>KHÁCH</b>. Bạn cần chạy script <code>db_grant_admin.sql</code> trong Supabase để nâng cấp quyền ADMIN cho tài khoản của mình.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ Email</label>
             <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon size={18} />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="name@school.edu.vn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
             </div>
           </div>

           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu bảo mật</label>
             <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className={`w-full bg-[#1e3a8a] text-white font-black py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs ${loading ? 'opacity-70 cursor-wait' : ''}`}
           >
             {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'XÁC THỰC NGAY'}
           </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Chưa có tài khoản?</p>
            <button 
                onClick={() => onNavigate('register')}
                className="mt-2 text-blue-600 font-black uppercase text-sm hover:text-blue-800 transition tracking-tighter"
            >
                Đăng ký thành viên mới
            </button>
        </div>
      </div>
    </div>
  );
};
