
import React, { useState, useRef } from 'react';
import { Post, PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { generateSchoolContent } from '../../services/geminiService';
import { Plus, Edit, Trash2, Search, Save, Loader2, Image, CheckCircle } from 'lucide-react';

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

  const toggleCategory = (slug: string) => {
    const currentCats = Array.isArray(currentPost.category) ? [...currentPost.category] : [];
    const index = currentCats.indexOf(slug);
    if (index > -1) currentCats.splice(index, 1);
    else currentCats.push(slug);
    setCurrentPost({ ...currentPost, category: currentCats as any });
  };

  const handleSave = async () => {
    if (!currentPost.title) return alert("Vui lòng nhập tiêu đề");
    if (!currentPost.category || (Array.isArray(currentPost.category) && currentPost.category.length === 0)) {
        return alert("Vui lòng chọn ít nhất một chuyên mục");
    }

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
        alert("Đã ghi dữ liệu bài viết thành công!");
    } catch (e: any) {
        alert("Lỗi khi ghi dữ liệu: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-slate-50 min-h-screen p-4 animate-fade-in font-sans text-sm">
        {isLoadingContent ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={48}/></div> : (
          <div className="max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm border sticky top-0 z-20">
                <h2 className="text-xl font-extrabold text-slate-800">{currentPost.id ? 'CẬP NHẬT BÀI VIẾT' : 'SOẠN BÀI VIẾT MỚI'}</h2>
                <div className="flex gap-2">
                   <button onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded font-bold text-slate-600 hover:bg-gray-100">HỦY BỎ</button>
                   <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800 shadow-lg flex items-center disabled:opacity-50">
                     {isSaving ? <Loader2 size={16} className="animate-spin mr-2"/> : <Save size={16} className="mr-2" />} 
                     GHI DỮ LIỆU
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                   <div className="bg-white p-6 rounded shadow-sm border">
                      <label className="block font-bold text-slate-700 mb-2 uppercase text-xs">Tiêu đề bài viết</label>
                      <input type="text" className="w-full border border-slate-200 p-3 rounded font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" value={currentPost.title} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} />
                      
                      <div className="mt-4">
                        <label className="block font-bold text-slate-700 mb-2 uppercase text-xs">Tóm tắt ngắn</label>
                        <textarea rows={3} className="w-full border border-slate-200 p-3 rounded text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" value={currentPost.summary} onChange={e => setCurrentPost({...currentPost, summary: e.target.value})} />
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded shadow-sm border">
                      <div className="flex justify-between mb-3 items-center">
                         <label className="font-bold text-slate-700 uppercase text-xs">Nội dung chi tiết (Markdown/HTML)</label>
                         <button onClick={async () => {
                            if (!currentPost.title) return alert("Nhập tiêu đề trước");
                            setIsGenerating(true);
                            try {
                                const content = await generateSchoolContent(currentPost.title, 'news');
                                setCurrentPost(p => ({ ...p, content: content.replace(/\n/g, '<br/>') }));
                            } finally {
                                setIsGenerating(false);
                            }
                         }} disabled={isGenerating} className="text-xs bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full font-black hover:bg-purple-200 flex items-center transition border border-purple-200">
                            {isGenerating ? <Loader2 size={12} className="animate-spin mr-2"/> : <CheckCircle size={12} className="mr-2" />}
                            DÙNG GEMINI AI VIẾT BÀI
                         </button>
                      </div>
                      <textarea ref={editorRef} rows={18} className="w-full border border-slate-200 p-4 bg-white font-sans text-base leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none" value={currentPost.content} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-white p-6 rounded shadow-sm border">
                      <h4 className="font-black border-b border-slate-100 pb-2 mb-4 text-slate-800 uppercase text-xs tracking-widest">Phân loại tin</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {categories.map(cat => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                               <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" checked={Array.isArray(currentPost.category) && currentPost.category.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />
                               <span className="font-bold text-slate-700">{cat.name}</span>
                            </label>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded shadow-sm border">
                      <h4 className="font-black border-b border-slate-100 pb-2 mb-4 text-slate-800 uppercase text-xs tracking-widest">Ảnh đại diện bài viết</h4>
                      <div className="space-y-3">
                         <input type="text" className="w-full border border-slate-200 p-2 rounded text-xs bg-slate-50 font-mono" value={currentPost.thumbnail} onChange={e => setCurrentPost({...currentPost, thumbnail: e.target.value})} placeholder="https://..." />
                         {currentPost.thumbnail ? (
                            <div className="relative group">
                                <img src={currentPost.thumbnail} className="w-full h-40 object-cover rounded border border-slate-200 shadow-inner" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                    <span className="text-white font-bold text-[10px]">ẢNH ĐÃ CHỌN</span>
                                </div>
                            </div>
                         ) : (
                            <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                                <Image size={32} className="mb-2 opacity-50"/>
                                <span className="text-[10px] font-bold">CHƯA CÓ ẢNH</span>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded shadow-sm border">
                      <h4 className="font-black border-b border-slate-100 pb-2 mb-4 text-slate-800 uppercase text-xs tracking-widest">Trạng thái & Ngày đăng</h4>
                      <div className="space-y-4">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 block mb-1">NGÀY HIỂN THỊ</label>
                            <input type="date" className="w-full border border-slate-200 p-2 rounded text-sm font-bold text-slate-700" value={currentPost.date} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} />
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase">Nổi bật (Trang chủ)</span>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={currentPost.isFeatured} onChange={e => setCurrentPost({...currentPost, isFeatured: e.target.checked})} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý nội dung tin bài</h2>
        <button onClick={handleCreate} className="bg-blue-700 text-white px-6 py-2.5 rounded shadow-lg flex items-center space-x-2 hover:bg-blue-800 transition font-black uppercase text-xs tracking-widest">
          <Plus size={18} /><span>Viết bài mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm kiếm tiêu đề bài viết..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Ảnh</th>
                    <th className="px-6 py-4">Tiêu đề bài viết</th>
                    <th className="px-6 py-4">Ngày đăng</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
                    <tr key={post.id} className="hover:bg-blue-50/30 transition group">
                        <td className="px-6 py-4 w-20">
                            <img src={post.thumbnail} className="w-12 h-12 object-cover rounded shadow-sm border border-slate-200" alt=""/>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 group-hover:text-blue-700 transition leading-snug">{post.title}</div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Lượt xem: {post.views || 0}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{post.date}</td>
                        <td className="px-6 py-4 text-right space-x-1">
                            <button onClick={() => handleEdit(post)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition" title="Sửa bài"><Edit size={18} /></button>
                            <button onClick={() => { if(confirm("Xóa bài viết này?")) DatabaseService.deletePost(post.id).then(refreshData); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Xóa bài"><Trash2 size={18} /></button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
