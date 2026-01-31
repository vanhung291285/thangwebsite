
import React, { useState, useEffect } from 'react';
import { SchoolDocument, DocumentCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, Link as LinkIcon, FolderOpen, UploadCloud, CheckCircle, Edit, Save, RotateCcw, Download, Loader2 } from 'lucide-react';

interface ManageDocumentsProps {
  documents: SchoolDocument[];
  categories: DocumentCategory[];
  refreshData: () => void;
}

export const ManageDocuments: React.FC<ManageDocumentsProps> = ({ documents, categories, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'categories'>('docs');
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('file');
  const [isSaving, setIsSaving] = useState(false);
  
  const [newDoc, setNewDoc] = useState<Partial<SchoolDocument>>({ 
    date: new Date().toISOString().split('T')[0],
    downloadUrl: '',
    categoryId: ''
  });

  const [newCat, setNewCat] = useState<Partial<DocumentCategory>>({ name: '', slug: '', description: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !newDoc.categoryId) {
        setNewDoc(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 15 * 1024 * 1024) {
            alert("File quá lớn! Vui lòng chọn file dưới 15MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (x) => {
            if (x.target?.result) {
                setNewDoc(prev => ({ 
                    ...prev, 
                    downloadUrl: x.target!.result as string,
                    title: prev.title || file.name.split('.')[0]
                }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddDoc = async () => {
    if (!newDoc.title || !newDoc.number) return alert("Vui lòng nhập Số hiệu và Trích yếu.");
    if (!newDoc.downloadUrl) return alert("Vui lòng tải file lên hoặc dán link.");

    setIsSaving(true);
    try {
        // Chỉ gửi dữ liệu thực sự cần thiết, ID sẽ do Supabase tự sinh
        const docData = {
          number: newDoc.number,
          title: newDoc.title,
          date: newDoc.date,
          categoryId: newDoc.categoryId || null, // Phải là null hoặc UUID hợp lệ
          downloadUrl: newDoc.downloadUrl
        };

        await DatabaseService.saveDocument(docData as any);
        
        setNewDoc({ 
            categoryId: categories[0]?.id || '', 
            date: new Date().toISOString().split('T')[0], 
            title: '', 
            number: '', 
            downloadUrl: '' 
        });
        
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        refreshData();
        alert("Đã thêm văn bản thành công!");
    } catch (e: any) {
        console.error(e);
        alert("Lỗi: " + (e.message || "Không thể lưu văn bản. Hãy kiểm tra lại quyền truy cập bảng documents."));
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa văn bản này?")) {
      await DatabaseService.deleteDocument(id);
      refreshData();
    }
  };

  const displayCategories = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><FolderOpen size={24}/></div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Văn bản & Tài liệu</h2>
                <p className="text-xs text-slate-500">Quản lý hồ sơ, công văn và học liệu số</p>
            </div>
         </div>
         <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setActiveTab('docs')} className={`px-4 py-2 rounded-md text-xs font-bold transition ${activeTab === 'docs' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>DANH SÁCH</button>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-md text-xs font-bold transition ${activeTab === 'categories' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>LOẠI VĂN BẢN</button>
         </div>
      </div>

      {activeTab === 'docs' && (
      <>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Plus size={16}/> Thêm văn bản mới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Loại văn bản</label>
                    <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none" value={newDoc.categoryId} onChange={e => setNewDoc({...newDoc, categoryId: e.target.value})}>
                        <option value="">-- Không phân loại --</option>
                        {displayCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Số kí hiệu</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none" placeholder="VD: 12/QĐ-THCS" value={newDoc.number || ''} onChange={e => setNewDoc({...newDoc, number: e.target.value})}/>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Ngày ban hành</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none" value={newDoc.date} onChange={e => setNewDoc({...newDoc, date: e.target.value})}/>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Phương thức file</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg border">
                        <button onClick={() => setUploadMode('file')} className={`flex-1 py-2 rounded-md text-[10px] font-bold transition ${uploadMode === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>TẢI FILE</button>
                        <button onClick={() => setUploadMode('link')} className={`flex-1 py-2 rounded-md text-[10px] font-bold transition ${uploadMode === 'link' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>DÁN LINK</button>
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Trích yếu nội dung</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition outline-none" placeholder="Nhập nội dung tóm tắt văn bản..." value={newDoc.title || ''} onChange={e => setNewDoc({...newDoc, title: e.target.value})}/>
                </div>

                <div className="md:col-span-4">
                    {uploadMode === 'file' ? (
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${newDoc.downloadUrl?.startsWith('data:') ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {newDoc.downloadUrl?.startsWith('data:') ? (
                                    <><CheckCircle className="w-10 h-10 text-emerald-500 mb-2" /><p className="text-sm text-emerald-700 font-bold">File đã sẵn sàng!</p></>
                                ) : (
                                    <><UploadCloud className="w-10 h-10 text-slate-400 mb-2" /><p className="text-sm text-slate-500">Nhấn để chọn file (PDF, Word...)</p></>
                                )}
                            </div>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    ) : (
                        <div className="flex gap-2">
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 flex items-center"><LinkIcon size={18} className="text-slate-400"/></div>
                            <input type="text" className="flex-1 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dán link Drive, Dropbox..." value={newDoc.downloadUrl || ''} onChange={e => setNewDoc({...newDoc, downloadUrl: e.target.value})}/>
                        </div>
                    )}
                </div>

                <div className="md:col-span-4 flex justify-end">
                    <button onClick={handleAddDoc} disabled={isSaving} className="bg-blue-700 text-white font-black py-3 px-8 rounded-xl hover:bg-blue-800 transition shadow-lg flex items-center gap-2 disabled:opacity-50">
                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} />}
                        LƯU VĂN BẢN
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr>
                        <th className="p-4 w-40">Số kí hiệu</th>
                        <th className="p-4 w-32">Ngày BH</th>
                        <th className="p-4">Trích yếu</th>
                        <th className="p-4 w-40">Tài liệu</th>
                        <th className="p-4 w-16 text-center">Xóa</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-blue-50/50 transition group">
                            <td className="p-4 font-mono font-bold text-blue-700">{doc.number}</td>
                            <td className="p-4 text-slate-500">{doc.date}</td>
                            <td className="p-4 font-bold text-slate-800">{doc.title}</td>
                            <td className="p-4">
                                {doc.downloadUrl && doc.downloadUrl !== '#' ? (
                                    <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline">
                                        <Download size={14} /> Tải về
                                    </a>
                                ) : <span className="text-slate-300 italic">Trống</span>}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-300 hover:text-red-600 p-2 transition"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </>
      )}
    </div>
  );
};
