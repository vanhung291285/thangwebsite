
import React from 'react';
import { Post } from '../types';
import { Calendar, User, Eye, ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  onClick: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post, onClick }) => {
  
  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'news': return { text: 'Tin tức', color: 'bg-blue-600' };
      case 'announcement': return { text: 'Thông báo', color: 'bg-red-600' };
      case 'activity': return { text: 'HĐ Phong trào', color: 'bg-green-600' };
      case 'professional': return { text: 'HĐ Chuyên môn', color: 'bg-indigo-600' };
      default: return { text: 'Tin tức', color: 'bg-blue-600' };
    }
  };

  const badge = getCategoryLabel(post.category);

  return (
    <div 
      className="bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col h-full group border-b-4 hover:border-b-blue-600"
      onClick={() => onClick(post.id)}
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img 
          src={post.thumbnail} 
          alt={post.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 text-[10px] font-black text-white rounded-full uppercase shadow-lg backdrop-blur-md ${badge.color}`}>
            {badge.text}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white p-4 rounded-full text-blue-900 shadow-2xl transform scale-50 group-hover:scale-100 transition-transform">
                <ArrowUpRight size={28} />
            </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-blue-700 transition-colors leading-tight line-clamp-2 uppercase tracking-tight">
          {post.title}
        </h3>
        <p className="text-slate-500 font-medium text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {post.summary}
        </p>
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-50 pt-6 mt-auto">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-blue-500" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Eye size={14} className="text-slate-300" />
                <span>{post.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
