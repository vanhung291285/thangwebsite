
import React, { useState, useRef } from 'react';
import { Post, PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { generateSchoolContent } from '../../services/geminiService';
import { 
  Plus, Edit, Trash2, Search, Save, Loader2, Image as ImageIcon, CheckCircle, 
  UploadCloud, Link as LinkIcon, X, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, List, Type, Heading1, Heading2, Heading3,
  Eye, Calendar, ChevronLeft, Layout, Settings2, Sparkles
} from 'lucide-react';

interface ManageNewsProps {
  posts: Post[];
  categories: PostCategory[]; 
  refreshData: () => void;
}

export const ManageNews: React.FC<ManageNewsProps> = ({ posts, categories, refreshData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = async (post: Post) => {
    setIsEditing(true);
    setIsLoadingContent(true);
    try {
        const fullPost = await DatabaseService.getPostById(post.id);
        if (fullPost) {
            let catArray: string[] = [];
            if (fullPost.category) {
                if (typeof fullPost.category === 'string' && fullPost.category.startsWith('[')) {
                    try { catArray = JSON.parse(fullPost.category); } catch { catArray = [fullPost.category]; }
                } else if (Array.isArray(fullPost.category)) {
                    catArray = fullPost.category;
                } else {
                    catArray = [fullPost.category];
                }
            }
            setCurrentPost({ ...fullPost, category: catArray as any });
        }
    } finally {
        setIsLoadingContent(false);
    }
  };

  const handleCreate = () => {
    setCurrentPost({
      title: '', slug: '', summary: '', content: '', thumbnail: '',
      category: [] as any, author: 'Admin', status: 'published',
      isFeatured: false, showOnHome: true, attachments: [],
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const insertAtCursor = (startTag: string, endTag: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = before + startTag + selection + endTag + after;
    setCurrentPost({ ...currentPost, content: newContent });

    setTimeout(() => {
      textarea.focus();
      const newPos = start + startTag.length + selection.length + endTag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          const imgHtml = `\n<div style="text-align: center; margin: 30px 0;">\n  <img src="${x.target.result}" style="max-width: 100%; border-radius: 16px; shadow: 0 20px 50px rgba(0,0,0,0.15);" alt="Image"/>\n  <p style="font-size: 14px; color: #64748b; font-style: italic; margin-top: 12px; font-family: sans-serif;">— Chú thích ảnh minh họa —</p>\n</div>\n`;
          insertAtCursor(imgHtml);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!currentPost.title) return alert("Vui lòng nhập tiêu đề");
    setIsSaving(true);
    try {
        const postData = {
            ...currentPost,
            slug: currentPost.slug || currentPost.title?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
            category: JSON.stringify(currentPost.category || [])
        } as Post;
        await DatabaseService.savePost(postData);
        refreshData();
        setIsEditing(false);
    } catch (e: any) {
        alert("Lỗi: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-[#f8fafc] min-h-screen animate-fade-in pb-20">
        <div className="max-w-[1700px] mx-auto p-4 md:p-8">
           {/* Top Control Bar */}
           <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/80 backdrop-blur-xl p-5 rounded-[24px] shadow-sm border border-slate-200 sticky top-4 z-[60] gap-4">
              <div className="flex items-center gap-5">
                 <button onClick={() => setIsEditing(false)} className="group p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all active:scale-95">
                    <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                 </button>
                 <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                       {currentPost.id ? 'Chỉnh sửa bài viết' : 'Kiến tạo bài viết mới'}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                       <Settings2 size={12}/> Hệ thống quản trị nội dung Suối Lư
                    </p>
                 </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-10 py-4 bg-blue-700 text-white rounded-2xl font-black hover:bg-blue-800 shadow-2xl shadow-blue-900/30 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50">
                   {isSaving ? <Loader2 size={20} className="animate-spin mr-3"/> : <Save size={20} className="mr-3" />} 
                   XUẤT BẢN NGAY
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Content Editor Zone (9 columns) */}
                <div className="lg:col-span-9 space-y-8">
                   <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-slate-200 transition-all">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Tiêu đề nội dung</label>
                      <input 
                        type="text" 
                        className="w-full border-none p-0 text-4xl md:text-5xl font-black text-slate-900 placeholder-slate-200 outline-none transition-all leading-tight focus:placeholder-transparent" 
                        placeholder="Tiêu đề bắt đầu từ đây..."
                        value={currentPost.title} 
                        onChange={e => setCurrentPost({...currentPost, title: e.target.value})} 
                      />
                      
                      <div className="mt-12 h-px bg-slate-100"></div>

                      <div className="mt-10">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Lời dẫn giải (Summary)</label>
                        <textarea 
                          rows={3} 
                          className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[24px] text-xl text-slate-600 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none leading-relaxed italic" 
                          placeholder="Viết một đoạn ngắn giới thiệu bài viết..."
                          value={currentPost.summary} 
                          onChange={e => setCurrentPost({...currentPost, summary: e.target.value})} 
                        />
                      </div>
                   </div>

                   <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[800px]">
                      {/* Editor Toolbar Ultra */}
                      <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 sticky top-[116px] z-50">
                         <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => insertAtCursor('<h1>', '</h1>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Heading 1"><Heading1 size={20}/></button>
                            <button onClick={() => insertAtCursor('<h2>', '</h2>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Heading 2"><Heading2 size={20}/></button>
                            <button onClick={() => insertAtCursor('<h3>', '</h3>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Heading 3"><Heading3 size={20}/></button>
                            <button onClick={() => insertAtCursor('<p>', '</p>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Paragraph"><Type size={20}/></button>
                         </div>
                         
                         <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => insertAtCursor('<b>', '</b>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Bold"><Bold size={20}/></button>
                            <button onClick={() => insertAtCursor('<i>', '</i>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Italic"><Italic size={20}/></button>
                            <button onClick={() => insertAtCursor('<u>', '</u>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Underline"><Underline size={20}/></button>
                         </div>

                         <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => insertAtCursor('<div style="text-align: left;">', '</div>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Align Left"><AlignLeft size={20}/></button>
                            <button onClick={() => insertAtCursor('<div style="text-align: center;">', '</div>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Align Center"><AlignCenter size={20}/></button>
                            <button onClick={() => insertAtCursor('<div style="text-align: right;">', '</div>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Align Right"><AlignRight size={20}/></button>
                         </div>

                         <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>')} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:text-blue-600" title="Bullet List"><List size={20}/></button>
                            <button onClick={() => inlineImageInputRef.current?.click()} className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 transition-all flex items-center gap-2 font-bold" title="Chèn ảnh từ máy tính">
                                <ImageIcon size={20}/> <span className="text-xs uppercase">Chèn ảnh</span>
                            </button>
                            <input type="file" ref={inlineImageInputRef} className="hidden" accept="image/*" onChange={handleInlineImageUpload} />
                         </div>

                         <div className="flex-grow"></div>
                         
                         <button onClick={async () => {
                            if (!currentPost.title) return alert("Nhập tiêu đề trước");
                            setIsGenerating(true);
                            try {
                                const content = await generateSchoolContent(currentPost.title, 'news');
                                setCurrentPost(p => ({ ...p, content: content }));
                            } finally {
                                setIsGenerating(false);
                            }
                         }} disabled={isGenerating} className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-purple-500/30 flex items-center transition-all active:scale-95 text-xs group">
                            {isGenerating ? <Loader2 size={18} className="animate-spin mr-3"/> : <Sparkles size={18} className="mr-3 group-hover:animate-pulse" />}
                            AI SOẠN NỘI DUNG
                         </button>
                      </div>
                      
                      <textarea 
                        ref={editorRef} 
                        className="flex-grow w-full border-none p-10 md:p-16 bg-white font-serif text-xl text-slate-800 leading-[1.8] focus:ring-0 outline-none resize-none min-h-[600px]" 
                        value={currentPost.content} 
                        placeholder="Câu chuyện bắt đầu tại đây..."
                        onChange={e => setCurrentPost({...currentPost, content: e.target.value})} 
                      />
                   </div>
                </div>

                {/* Sidebar Column (3 columns) */}
                <div className="lg:col-span-3 space-y-8">
                   <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-3">Ảnh bìa bài viết</h4>
                      
                      <div className="space-y-5">
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group"
                         >
                            <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                               <UploadCloud size={32} className="text-blue-600" />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tải ảnh bìa chính</span>
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (x) => setCurrentPost({...currentPost, thumbnail: x.target?.result as string});
                              reader.readAsDataURL(e.target.files[0]);
                            }
                         }} />

                         {currentPost.thumbnail ? (
                            <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-slate-100 group">
                                <img src={currentPost.thumbnail} className="w-full h-56 object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <button onClick={() => setCurrentPost({...currentPost, thumbnail: ''})} className="bg-white p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all shadow-xl active:scale-95">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                         ) : (
                            <div className="w-full h-56 bg-slate-50 border border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-300">
                                <ImageIcon size={64} className="mb-4 opacity-10"/>
                                <span className="text-[10px] font-black tracking-widest uppercase opacity-30 text-center px-6">Giao diện sẽ trông đẹp hơn nếu có ảnh bìa</span>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-3">Thiết lập bài viết</h4>
                      <div className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-widest">NGÀY HIỂN THỊ</label>
                            <div className="relative">
                               <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input type="date" className="w-full border border-slate-100 p-4 pl-12 rounded-[20px] text-sm font-black text-slate-700 bg-slate-50 focus:bg-white outline-none transition-all shadow-sm" value={currentPost.date} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="flex items-center justify-between p-4 rounded-[20px] bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white transition-all group">
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-700">Ghim tin nổi bật</span>
                                <input type="checkbox" className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer transition-all" checked={currentPost.isFeatured} onChange={e => setCurrentPost({...currentPost, isFeatured: e.target.checked})} />
                            </label>
                            <label className="flex items-center justify-between p-4 rounded-[20px] bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white transition-all group">
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-700">Hiện trang chủ</span>
                                <input type="checkbox" className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer transition-all" checked={currentPost.showOnHome} onChange={e => setCurrentPost({...currentPost, showOnHome: e.target.checked})} />
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-3">Chuyên mục</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                         {categories.map(cat => {
                            const isSelected = Array.isArray(currentPost.category) && currentPost.category.includes(cat.slug);
                            return (
                               <label key={cat.id} className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl transition-all border ${isSelected ? 'bg-blue-50 border-blue-200 shadow-md translate-x-1' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                                  <input type="checkbox" className="hidden" checked={isSelected} onChange={() => {
                                     const currentCats = Array.isArray(currentPost.category) ? [...currentPost.category] : [];
                                     const index = currentCats.indexOf(cat.slug);
                                     if (index > -1) currentCats.splice(index, 1);
                                     else currentCats.push(cat.slug);
                                     setCurrentPost({ ...currentPost, category: currentCats as any });
                                  }} />
                                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 rotate-0' : 'border-slate-300 -rotate-45'}`}>
                                     {isSelected && <CheckCircle size={14} className="text-white" />}
                                   </div>
                                  <span className={`font-black text-xs uppercase tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{cat.name}</span>
                               </label>
                            );
                         })}
                      </div>
                   </div>
                </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center">
              <Layout className="mr-4 text-blue-600" size={36} /> Nội dung tin bài
           </h2>
           <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-[0.1em]">Tiếp cận và quản lý dòng chảy thông tin nhà trường</p>
        </div>
        <button onClick={handleCreate} className="w-full md:w-auto bg-blue-700 text-white px-10 py-5 rounded-[24px] shadow-2xl shadow-blue-900/40 flex items-center justify-center space-x-4 hover:bg-blue-800 transition-all font-black uppercase text-sm tracking-widest transform active:scale-95 group">
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          <span>Tạo bài viết mới</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
               type="text" 
               placeholder="Tìm kiếm tiêu đề, từ khóa..." 
               className="w-full pl-16 pr-8 py-5 border border-slate-200 rounded-3xl outline-none focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 bg-white transition-all font-bold text-slate-700 placeholder:font-medium" 
               value={searchTerm} 
               onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                <tr>
                    <th className="px-10 py-8">Phương tiện</th>
                    <th className="px-10 py-8">Tiêu đề & Thông số</th>
                    <th className="px-10 py-8">Phân mục</th>
                    <th className="px-10 py-8">Ngày xuất bản</th>
                    <th className="px-10 py-8 text-right">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
                    <tr key={post.id} className="hover:bg-blue-50/40 transition-all group">
                        <td className="px-10 py-8 w-44">
                            <div className="w-28 h-20 rounded-[20px] overflow-hidden shadow-lg border border-slate-100 transform group-hover:scale-105 transition-transform duration-500">
                               <img src={post.thumbnail} className="w-full h-full object-cover" alt=""/>
                            </div>
                        </td>
                        <td className="px-10 py-8">
                            <div className="font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight text-xl max-w-xl line-clamp-2">{post.title}</div>
                            <div className="flex items-center gap-6 mt-4">
                               <div className="flex items-center text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                  <Eye size={14} className="mr-2 text-blue-500"/> {post.views || 0} lượt xem
                               </div>
                               {post.isFeatured && (
                                  <div className="text-[10px] bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                                    <Sparkles size={10}/> Nổi bật
                                  </div>
                               )}
                            </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-wrap gap-2">
                              {(() => {
                                 try {
                                    const cats = typeof post.category === 'string' && post.category.startsWith('[') ? JSON.parse(post.category) : [post.category];
                                    return cats.map((c: string) => (
                                       <span key={c} className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm">{c}</span>
                                    ));
                                 } catch { return null; }
                              })()}
                           </div>
                        </td>
                        <td className="px-10 py-8 font-black text-slate-400 tabular-nums tracking-widest text-base">{post.date}</td>
                        <td className="px-10 py-8 text-right space-x-3">
                            <button onClick={() => handleEdit(post)} className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white p-4 rounded-2xl transition-all shadow-md inline-flex items-center justify-center hover:shadow-blue-500/20 active:scale-90" title="Chỉnh sửa bài viết"><Edit size={22} /></button>
                            <button onClick={() => { if(confirm("Xóa bài viết này?")) DatabaseService.deletePost(post.id).then(refreshData); }} className="bg-white text-red-500 hover:bg-red-500 hover:text-white p-4 rounded-2xl transition-all shadow-md inline-flex items-center justify-center hover:shadow-red-500/20 active:scale-90" title="Xóa bài"><Trash2 size={22} /></button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        {posts.length === 0 && (
           <div className="p-32 text-center flex flex-col items-center justify-center bg-slate-50/50">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
                 <Search size={48} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Kho dữ liệu đang trống</p>
           </div>
        )}
      </div>
    </div>
  );
};
