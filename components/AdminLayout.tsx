
import React from 'react';
import { 
  LayoutDashboard, FileText, Settings, LogOut, GraduationCap, 
  Menu, Users, Image, FolderOpen, List, LayoutTemplate, 
  Briefcase, Info, Tag, Video, ShieldCheck 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (path: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePage, onNavigate, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Danh sách đầy đủ 11 module quản trị
  const menuItems = [
    { id: 'admin-dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, minRole: UserRole.GUEST },
    { id: 'admin-news', label: 'Quản lý Tin tức', icon: FileText, minRole: UserRole.EDITOR },
    { id: 'admin-intro', label: 'Giới thiệu nhà trường', icon: Info, minRole: UserRole.EDITOR },
    { id: 'admin-docs', label: 'Văn bản - Tài liệu', icon: FolderOpen, minRole: UserRole.EDITOR },
    { id: 'admin-gallery', label: 'Thư viện ảnh', icon: Image, minRole: UserRole.EDITOR },
    { id: 'admin-videos', label: 'Thư viện Video', icon: Video, minRole: UserRole.EDITOR },
    { id: 'admin-staff', label: 'Danh sách Cán bộ', icon: Briefcase, minRole: UserRole.EDITOR }, 
    { id: 'admin-categories', label: 'Chuyên mục bài viết', icon: Tag, minRole: UserRole.ADMIN },
    { id: 'admin-users', label: 'Tài khoản người dùng', icon: Users, minRole: UserRole.ADMIN },
    { id: 'admin-menu', label: 'Cấu hình Menu', icon: List, minRole: UserRole.ADMIN },
    { id: 'admin-blocks', label: 'Cấu hình Khối', icon: LayoutTemplate, minRole: UserRole.ADMIN }, 
    { id: 'admin-settings', label: 'Cấu hình chung', icon: Settings, minRole: UserRole.ADMIN },
  ];

  // Hàm kiểm tra quyền: ADMIN thấy tất cả, EDITOR thấy các mục nội dung
  const canAccess = (itemRole: UserRole) => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.ADMIN) return true;
    if (currentUser.role === UserRole.EDITOR) {
      return itemRole === UserRole.EDITOR || itemRole === UserRole.GUEST;
    }
    return itemRole === UserRole.GUEST;
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] text-white transition-all duration-300 flex flex-col fixed md:relative h-full z-20 shadow-xl`}>
        <div className="p-4 flex items-center justify-center border-b border-slate-700 h-16 bg-[#1e293b]">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2 font-bold text-lg text-blue-400">
              <ShieldCheck />
              <span className="text-white tracking-tight">HỆ THỐNG QUẢN TRỊ</span>
            </div>
          ) : (
             <ShieldCheck className="text-blue-400" />
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (!canAccess(item.minRole)) return null;
              
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center px-4 py-3 transition-all border-l-4 ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
                    }`}
                  >
                    <Icon size={20} className="min-w-[20px]" />
                    {sidebarOpen && <span className={`ml-3 truncate font-bold text-sm uppercase`}>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700 bg-[#0f172a]">
           <button 
             onClick={onLogout}
             className="w-full flex items-center px-2 py-2 text-red-400 hover:bg-red-500/10 rounded transition font-bold text-sm"
           >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3">ĐĂNG XUẤT</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-gray-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-blue-600 transition">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-black text-slate-800">{currentUser?.fullName}</div>
              <div className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full inline-block ${
                currentUser?.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {currentUser?.role === UserRole.ADMIN ? 'Quản trị tối cao' : (currentUser?.role === UserRole.EDITOR ? 'Biên tập viên' : 'Thành viên')}
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-200 shadow-sm">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
