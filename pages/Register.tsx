
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Lock, Mail, UserPlus, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                full_name: formData.fullName,
                username: formData.email.split('@')[0], 
            }
        }
      });

      if (authError) throw authError;

      if (data.user) {
         setSuccess(true);
      }
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
       setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
         <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100 animate-fade-in">
             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-500"/>
             </div>
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Đăng ký thành công!</h2>
             <div className="bg-emerald-50 p-4 rounded-2xl mb-8 border border-emerald-100 text-sm text-emerald-800 font-medium leading-relaxed">
                Hệ thống đã gửi một link xác nhận đến <b>{formData.email}</b>. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác) và nhấn vào link để kích hoạt tài khoản.
             </div>
             
             <div className="flex gap-4">
                 <button 
                    onClick={() => onNavigate('home')}
                    className="flex-1 px-5 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition uppercase text-xs"
                 >
                    Về trang chủ
                 </button>
                 <button 
                    onClick={() => onNavigate('login')}
                    className="flex-1 px-5 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition uppercase text-xs"
                 >
                    Đăng nhập ngay
                 </button>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative py-12 px-4">
      <button 
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 flex items-center text-slate-500 hover:text-blue-600 transition font-bold text-sm uppercase"
      >
        <ArrowLeft size={20} className="mr-2" /> Về trang chủ
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100 transform rotate-3">
             <UserPlus size={40} className="text-orange-600" />
           </div>
           <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Đăng ký Thành viên</h2>
           <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Tham gia cộng đồng sư phạm Suối Lư</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-start border border-red-100">
             <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
             <div className="font-bold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ và tên người dùng</label>
             <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  required
                />
             </div>
           </div>

           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ Email</label>
             <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={6}
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nhập lại</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                 </div>
               </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className={`w-full bg-orange-600 text-white font-black py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
           >
             {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'ĐĂNG KÝ TÀI KHOẢN'}
           </button>
           
           <div className="text-center mt-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-tight inline">Đã có tài khoản?</p>
              <button 
                onClick={() => onNavigate('login')} 
                className="ml-2 text-blue-600 font-black uppercase text-xs hover:text-blue-800 transition tracking-tighter"
              >
                Đăng nhập ngay
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};
