
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Introduction } from './pages/Introduction';
import { Documents } from './pages/Documents';
import { Gallery } from './pages/Gallery';
import { Staff } from './pages/Staff'; 
import { Login } from './pages/Login'; 
import { Register } from './pages/Register';
import { DatabaseService } from './services/database'; 
import { supabase, isSupabaseReady } from './services/supabaseClient';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingContact } from './components/FloatingContact';
import { PageRoute, Post, SchoolConfig, User, DisplayBlock, MenuItem, StaffMember, PostCategory, DocumentCategory, SchoolDocument, GalleryImage, GalleryAlbum } from './types';
import { Loader2 } from 'lucide-react';

const FALLBACK_CONFIG: SchoolConfig = {
  name: 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan: 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '0123.456.789',
  email: 'thcsuoilu@dienbien.edu.vn',
  hotline: '0123.456.789',
  mapUrl: '',
  facebook: '',
  youtube: '',
  website: '',
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a',
  metaTitle: 'Trường Suối Lư',
  metaDescription: 'Cổng thông tin điện tử Trường PTDTBT TH và THCS Suối Lư'
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // States cho dữ liệu
  const [config, setConfig] = useState<SchoolConfig>(FALLBACK_CONFIG);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useCallback((path: string, id?: string) => {
    setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);
    const url = path === 'home' ? '/' : `/?page=${path}${id ? `&id=${id}` : ''}`;
    window.history.pushState({}, '', url);
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [
        configData, menuData, blocksData, postsData, staffData, 
        catData, docCatData, docData, galleryData, albumData
      ] = await Promise.allSettled([
        DatabaseService.getConfig(),
        DatabaseService.getMenu(),
        DatabaseService.getBlocks(),
        DatabaseService.getPosts(15),
        DatabaseService.getStaff(),
        DatabaseService.getPostCategories(),
        DatabaseService.getDocCategories(),
        DatabaseService.getDocuments(),
        DatabaseService.getGallery(),
        DatabaseService.getAlbums()
      ]);

      if (configData.status === 'fulfilled' && Object.keys(configData.value).length > 0) setConfig(configData.value);
      if (menuData.status === 'fulfilled') setMenuItems(menuData.value);
      if (blocksData.status === 'fulfilled') setBlocks(blocksData.value);
      if (postsData.status === 'fulfilled') setPosts(postsData.value);
      if (staffData.status === 'fulfilled') setStaffList(staffData.value);
      if (catData.status === 'fulfilled') setPostCategories(catData.value);
      if (docCatData.status === 'fulfilled') setDocCategories(docCatData.value);
      if (docData.status === 'fulfilled') setDocuments(docData.value);
      if (galleryData.status === 'fulfilled') setGallery(galleryData.value);
      if (albumData.status === 'fulfilled') setAlbums(albumData.value);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu từ Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Lắng nghe sự kiện URL
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') as PageRoute || 'home';
      const id = params.get('id') || undefined;
      setCurrentPage(page);
      setDetailId(id);
    };
    window.addEventListener('popstate', handlePopState);
    
    // Auth Listener
    if (isSupabaseReady && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) DatabaseService.getUserProfile(session.user.id).then(setCurrentUser);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) DatabaseService.getUserProfile(session.user.id).then(setCurrentUser);
        else setCurrentUser(null);
      });
      return () => {
        subscription.unsubscribe();
        window.removeEventListener('popstate', handlePopState);
      };
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadAllData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-900 font-bold animate-pulse">ĐANG KẾT NỐI DATABASE...</p>
      </div>
    );
  }

  const isAdminRoute = currentPage.startsWith('admin-');

  return (
    <div className={`min-h-screen flex flex-col ${isAdminRoute ? 'bg-slate-50' : 'bg-white'}`}>
      {!isAdminRoute ? (
        <>
          <Header config={config} menuItems={menuItems.length > 0 ? menuItems : [{id: '1', label: 'Trang chủ', path: 'home', order: 1}]} onNavigate={navigate} activePath={currentPage} />
          <main className="flex-1 animate-fade-in">
            {currentPage === 'home' && (
              <Home 
                posts={posts} 
                postCategories={postCategories}
                config={config} 
                blocks={blocks} 
                staffList={staffList} 
                documents={documents}
                docCategories={docCategories}
                gallery={gallery} 
                onNavigate={navigate} 
              />
            )}
            {currentPage === 'intro' && <Introduction config={config} />}
            {currentPage === 'documents' && <Documents documents={documents} categories={docCategories} initialCategorySlug={detailId} />}
            {currentPage === 'gallery' && <Gallery images={gallery} albums={albums} />}
            {currentPage === 'staff' && <Staff staffList={staffList} />}
            {currentPage === 'login' && <Login onLoginSuccess={setCurrentUser} onNavigate={navigate} />}
            {currentPage === 'register' && <Register onNavigate={navigate} />}
          </main>
          <Footer config={config} />
          <ScrollToTop />
          <FloatingContact config={config} />
        </>
      ) : (
        <AdminLayout activePage={currentPage} onNavigate={navigate} currentUser={currentUser} onLogout={() => supabase?.auth.signOut()}>
           <div className="p-8">
              <h1 className="text-2xl font-black text-slate-800 mb-4">HỆ THỐNG QUẢN TRỊ WEBSITE</h1>
              <p className="text-slate-500">Kết nối thành công với dự án: <b>websuoilu</b></p>
           </div>
        </AdminLayout>
      )}
    </div>
  );
};

export default App;
