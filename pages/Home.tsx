
import React from 'react';
import { Post, SchoolConfig, GalleryImage, DisplayBlock, IntroductionArticle, PostCategory, SchoolDocument, DocumentCategory, StaffMember } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChevronRight, Calendar, ImageIcon, ArrowRight, Star, Clock, User, Layout, Eye } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  postCategories: PostCategory[]; 
  documents: SchoolDocument[];
  docCategories?: DocumentCategory[]; 
  config: SchoolConfig;
  gallery: GalleryImage[];
  blocks: DisplayBlock[];
  introductions?: IntroductionArticle[]; 
  staffList?: StaffMember[]; 
  onNavigate: (path: string, id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ posts, postCategories, documents, docCategories, config, gallery, blocks, introductions = [], staffList = [], onNavigate }) => {
  
  const getPostCategoriesList = (post: Post): string[] => {
    try {
        if (!post.category) return [];
        if (Array.isArray(post.category)) return post.category;
        if (typeof post.category === 'string') {
            if (post.category.startsWith('[')) return JSON.parse(post.category);
            return [post.category];
        }
        return [];
    } catch (e) {
        return typeof post.category === 'string' ? [post.category] : [];
    }
  };

  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    const categorySource = block.htmlContent || 'all'; 

    if (categorySource === 'featured') {
        filtered = filtered.filter(p => p.isFeatured);
    } else if (categorySource !== 'all' && block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs' && block.type !== 'doc_cats' && block.type !== 'staff_list') {
        filtered = filtered.filter(p => {
            const pCats = getPostCategoriesList(p);
            return pCats.includes(categorySource);
        });
    }
    
    const limit = (block.type === 'grid' && config.homeNewsCount > 0) ? config.homeNewsCount : block.itemCount;
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  };

  const renderBadges = (post: Post) => {
    const pCats = getPostCategoriesList(post);
    return (
        <div className="flex flex-wrap gap-1 mb-3">
            {pCats.map(slug => {
                const cat = postCategories.find(c => c.slug === slug);
                if (!cat) return null;
                return (
                    <span key={slug} className={`text-white text-[9px] lg:text-[10px] font-black px-2.5 py-1 uppercase rounded-md shadow-sm tracking-widest bg-${cat.color}-600`}>
                        {cat.name}
                    </span>
                );
            })}
        </div>
    );
  };

  const renderBlock = (block: DisplayBlock) => {
    if (block.targetPage === 'detail') return null;
    if (block.type === 'hero' && !config.showWelcomeBanner) return null;
    if ((block.type === 'highlight' || block.type === 'list') && block.position === 'main' && !config.homeShowProgram) return null;

    const blockPosts = getPostsForBlock(block);
    if (blockPosts.length === 0 && block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs' && block.type !== 'doc_cats' && block.type !== 'staff_list') return null;

    if (block.type === 'hero') {
        const mainHero = blockPosts[0];
        const subHeros = blockPosts.slice(1, 3);
        if (!mainHero) return null;

        return (
          <section key={block.id} className="mb-12">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shadow-2xl rounded-[32px] overflow-hidden border border-slate-200 bg-white p-2">
                <div className="lg:col-span-2 relative h-[400px] lg:h-[550px] group cursor-pointer overflow-hidden rounded-[24px] bg-slate-900" onClick={() => onNavigate('news-detail', mainHero.id)}>
                    <img src={mainHero.thumbnail} alt={mainHero.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-10 w-full">
                        {renderBadges(mainHero)}
                        <h2 className="text-white text-3xl lg:text-4xl font-black leading-tight mb-5 hover:text-yellow-400 transition drop-shadow-2xl">{mainHero.title}</h2>
                        <div className="flex items-center text-slate-300 text-xs gap-6 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full"><Calendar size={14} className="text-yellow-400"/> {mainHero.date}</span>
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full"><Eye size={14} className="text-blue-400"/> {mainHero.views || 0} lượt xem</span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden lg:flex flex-col gap-3 h-[550px]">
                    {subHeros.map(sub => (
                        <div key={sub.id} className="relative flex-1 group cursor-pointer overflow-hidden rounded-[24px] bg-slate-900" onClick={() => onNavigate('news-detail', sub.id)}>
                            <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                {renderBadges(sub)}
                                <h3 className="text-white text-lg font-black leading-snug hover:text-yellow-400 transition line-clamp-2">{sub.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </section>
        );
    }

    if (block.type === 'grid') {
        return (
          <section key={block.id} className="mb-20">
            <div className="flex justify-between items-end border-b-4 border-blue-900 mb-10 pb-5">
              <div>
                <h3 className="text-3xl font