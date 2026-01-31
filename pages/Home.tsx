
import React from 'react';
import { Post, SchoolConfig, GalleryImage, DisplayBlock, IntroductionArticle, PostCategory, SchoolDocument, DocumentCategory, StaffMember } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChevronRight, Calendar, ImageIcon, ArrowRight, Star, Clock, User } from 'lucide-react';

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
        <div className="flex flex-wrap gap-1 mb-2">
            {pCats.map(slug => {
                const cat = postCategories.find(c => c.slug === slug);
                if (!cat) return null;
                return (
                    <span key={slug} className={`text-white text-[8px] lg:text-[9px] font-black px-2 py-0.5 uppercase rounded shadow-sm tracking-widest bg-${cat.color}-600`}>
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
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                <div className="lg:col-span-2 relative h-[380px] lg:h-[480px] group cursor-pointer overflow-hidden bg-slate-900" onClick={() => onNavigate('news-detail', mainHero.id)}>
                    <img src={mainHero.thumbnail} alt={mainHero.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        {renderBadges(mainHero)}
                        <h2 className="text-white text-2xl lg:text-3xl font-extrabold leading-tight mb-4 hover:text-yellow-400 transition drop-shadow-lg">{mainHero.title}</h2>
                        <div className="flex items-center text-slate-300 text-xs gap-4 font-semibold uppercase tracking-wider">
                            <span className="flex items-center gap-2"><Calendar size={14}/> {mainHero.date}</span>
                        </div>
                    </div>
                </div>
                
                <div className="hidden lg:flex flex-col gap-2 h-[480px]">
                    {subHeros.map(sub => (
                        <div key={sub.id} className="relative flex-1 group cursor-pointer overflow-hidden bg-slate-900" onClick={() => onNavigate('news-detail', sub.id)}>
                            <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-5 w-full">
                                {renderBadges(sub)}
                                <h3 className="text-white text-base font-bold leading-snug hover:text-yellow-400 transition line-clamp-2">{sub.title}</h3>
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
          <section key={block.id} className="mb-16">
            <div className="flex justify-between items-center border-b-2 border-blue-900 mb-8 pb-4">
              <h3 className="text-2xl font-extrabold text-blue-900 uppercase flex items-center tracking-tight">
                <span className="w-2 h-8 bg-blue-600 mr-3 rounded-full"></span> {block.name}
              </h3>
              <button onClick={() => onNavigate('news')} className="text-xs font-bold text-slate-500 hover:text-blue-700 uppercase flex items-center bg-slate-100 px-4 py-2 rounded-full transition">
                Tất cả tin tức <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {blockPosts.map((post) => (
                   <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                       <div className="relative overflow-hidden h-48">
                           <img src={post.thumbnail} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" alt=""/>
                           <div className="absolute top-4 left-4 flex flex-col gap-1">
                                {getPostCategoriesList(post).map(slug => {
                                    const cat = postCategories.find(c => c.slug === slug);
                                    if (!cat) return null;
                                    return (
                                        <div key={slug} className={`text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest bg-${cat.color}-600`}>
                                            {cat.name}
                                        </div>
                                    )
                                })}
                           </div>
                       </div>
                       <div className="p-5 flex flex-col flex-grow">
                           <h4 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-blue-700 transition line-clamp-2">{post.title}</h4>
                           <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow leading-relaxed">{post.summary}</p>
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center border-t border-slate-50 pt-4 mt-auto">
                               <Clock size={12} className="mr-1.5"/> {post.date}
                           </div>
                       </div>
                   </div>
               ))}
            </div>
          </section>
        );
    }

    if (block.type === 'highlight' || block.type === 'list') {
         return (
            <section key={block.id} className="mb-16 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
               <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
                   <h3 className="font-extrabold uppercase text-lg flex items-center tracking-wide"><Star size={20} className="mr-3 text-yellow-400 fill-yellow-400"/> {block.name}</h3>
               </div>
               <div className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {blockPosts.map(post => (
                           <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="flex gap-5 group cursor-pointer hover:bg-slate-50 p-3 -m-3 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-100">
                               <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden shadow-sm border border-slate-100">
                                   <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt=""/>
                               </div>
                               <div className="flex-1">
                                   {renderBadges(post)}
                                   <h4 className="text-base font-bold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 line-clamp-2">{post.title}</h4>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center"><Calendar size={12} className="mr-1.5"/> {post.date}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </section>
         );
    }
    return null;
  };

  const mainBlocks = blocks.filter(b => b.position === 'main');
  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="pb-20">
      <div className="container mx-auto px-6 lg:px-10 mt-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
               {mainBlocks.length > 0 ? mainBlocks.map(block => renderBlock(block)) : (
                 <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">Vui lòng cấu hình các khối nội dung trong trang quản trị.</p>
                 </div>
               )}
            </div>
            <div className="lg:col-span-4 space-y-12">
               <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                   <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white font-bold uppercase text-center text-sm tracking-widest border-b border-white/10">Liên kết nhanh</div>
                   <div className="p-6 grid grid-cols-2 gap-4">
                       <button className="bg-blue-50 hover:bg-blue-600 text-blue-900 hover:text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-blue-100 shadow-sm group">
                           <Calendar size={28} className="text-blue-700 group-hover:text-white transition-colors"/><span className="text-xs font-extrabold text-center uppercase tracking-tighter">Thời khóa biểu</span>
                       </button>
                       <button className="bg-emerald-50 hover:bg-emerald-600 text-emerald-900 hover:text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-emerald-100 shadow-sm group">
                           <Star size={28} className="text-emerald-700 group-hover:text-white transition-colors"/><span className="text-xs font-extrabold text-center uppercase tracking-tighter">Thành tích</span>
                       </button>
                       <button className="bg-orange-50 hover:bg-orange-600 text-orange-900 hover:text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-orange-100 shadow-sm group">
                           <ImageIcon size={28} className="text-orange-700 group-hover:text-white transition-colors"/><span className="text-xs font-extrabold text-center uppercase tracking-tighter">Thư viện ảnh</span>
                       </button>
                       <button onClick={() => onNavigate('contact')} className="bg-indigo-50 hover:bg-indigo-600 text-indigo-900 hover:text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border border-indigo-100 shadow-sm group">
                           <ArrowRight size={28} className="text-indigo-700 group-hover:text-white transition-colors"/><span className="text-xs font-extrabold text-center uppercase tracking-tighter">Liên hệ</span>
                       </button>
                   </div>
               </div>
               <Sidebar blocks={sidebarBlocks} posts={posts} postCategories={postCategories} documents={documents} docCategories={docCategories} onNavigate={onNavigate} currentPage="home" />
            </div>
         </div>
      </div>
      <section className="bg-slate-50 border-y border-slate-200 py-20 mt-16">
         <div className="container mx-auto px-6 lg:px-10">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-3xl font-extrabold text-blue-900 uppercase flex items-center tracking-tight"><span className="w-2 h-10 bg-blue-600 mr-4 rounded-full"></span> Khoảnh khắc Suối Lư</h3>
               <button onClick={() => onNavigate('gallery')} className="px-8 py-3 bg-white text-blue-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-200 shadow-sm">Tất cả Album</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {gallery.slice(0,4).map(img => (
                  <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-2xl group cursor-pointer relative shadow-lg border border-white">
                     <img src={img.url} alt="Gallery" className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center"><ImageIcon className="text-white w-10 h-10 drop-shadow-xl"/></div>
                  </div>
               ))}
               {gallery.length === 0 && <p className="text-slate-400 col-span-4 text-center py-10 font-medium italic">Hình ảnh đang được cập nhật...</p>}
            </div>
         </div>
      </section>
    </div>
  );
};
