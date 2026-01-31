
import React, { useState } from 'react';
import { SchoolConfig, MenuItem } from '../types';
import { Menu, X, GraduationCap, Phone, Mail, Facebook, Youtube, Globe, UserPlus, LogIn, User } from 'lucide-react';

interface HeaderProps {
  config: SchoolConfig;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  activePath: string;
}

export const Header: React.FC<HeaderProps> = ({ config, menuItems, onNavigate, activePath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    if (path.startsWith('http')) {
       window.open(path, '_blank');
    } else {
       onNavigate(path);
    }
    setIsMenuOpen(false);
  };

  const hasBanner = !!config.bannerUrl;

  return (
    <header className="font-sans flex flex-col shadow-md relative z-50">
      {/* 1. TOP BAR: Liên hệ & Thành viên */}
      <div className="bg-[#1e3a8a] text-white py-2 px-4 text-xs border-b border-blue-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-6 opacity-95 font-medium">
             <span className="flex items-center gap-1.5"><Phone size={12} className="text-yellow-400"/> Hotline: <strong className="text-sm">{config.hotline || config.phone}</strong></span>
             <span className="hidden md:inline text-blue-500">|</span>
             <span className="hidden sm:flex items-center gap-1.5"><Mail size={12} className="text-yellow-400"/> {config.email}</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 pr-3 border-r border-blue-700">
                <button 
                  onClick={() => handleNav('login')}
                  className="hover:text-yellow-400 transition flex items-center gap-1 font-bold uppercase tracking-tighter"
                >
                  <LogIn size={14}/> Đăng nhập
                </button>
                <button 
                  onClick={() => handleNav('register')}
                  className="hover:text-yellow-400 transition flex items-center gap-1 font-bold uppercase tracking-tighter"
                >
                  <UserPlus size={14}/> Đăng ký thành viên
                </button>
             </div>
             <div className="flex gap-2.5">
                {config.facebook && <a href={config.facebook} target="_blank" rel="noreferrer" className="hover:text-yellow-300 transition"><Facebook size={16}/></a>}
                {config.youtube && <a href={config.youtube} target="_blank" rel="noreferrer" className="hover:text-red-400 transition"><Youtube size={16}/></a>}
             </div>
          </div>
        </div>
      </div>

      {/* 2. BRANDING AREA */}
      <div 
        className="bg-white relative transition-all duration-300 min-h-[160px] flex items-center shadow-inner"
        style={{ 
            backgroundImage: hasBanner ? `url(${config.bannerUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundColor: 'white'
        }}
      >
         {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>}
         
         <div className="container mx-auto px-4 py-4 relative z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-5 cursor-pointer group" onClick={() => handleNav('home')}>
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-900 shadow-xl border-4 border-yellow-400 p-1 shrink-0 overflow-hidden transform group-hover:rotate-3 transition duration-500">
                      {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <GraduationCap size={48} />}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold uppercase leading-tight text-blue-900 drop-shadow-sm tracking-tight" style={{ fontFamily: "'Roboto Slab', serif" }}>
                            {config.name}
                        </h1>
                        <p className="text-sm md:text-base font-bold text-red-600 mt-1 uppercase tracking-widest">
                            {config.slogan || 'Trách nhiệm - Yêu thương - Sáng tạo'}
                        </p>
                    </div>
                </div>

                <button className="lg:hidden p-2 rounded-lg text-blue-900 border border-blue-900/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>
         </div>
      </div>

      {/* 3. NAVIGATION BAR */}
      <div className="bg-[#0f4c81] shadow-lg border-t-4 border-yellow-500 sticky top-0 z-40">
         <div className="container mx-auto">
            <nav className="hidden lg:flex items-center">
               <div className="flex flex-1 items-center overflow-x-auto no-scrollbar">
                   {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`px-6 py-4 text-sm font-black uppercase transition-all duration-200 border-r border-blue-800/30 hover:bg-yellow-500 hover:text-blue-900 ${
                            activePath === item.path ? 'bg-blue-800 text-yellow-400 border-b-2 border-b-yellow-400' : 'text-white border-b-2 border-b-transparent'
                          }`}
                      >
                        {item.label}
                      </button>
                   ))}
               </div>
            </nav>
         </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full top-full z-50 animate-fade-in">
          <div className="flex flex-col divide-y divide-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`text-left font-bold p-4 uppercase text-sm ${activePath === item.path ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-600' : 'text-gray-900'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
