
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

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { ManageNews } from './pages/admin/ManageNews';
import { ManagePostCategories } from './pages/admin/ManagePostCategories';
import { ManageBlocks } from './pages/admin/ManageBlocks';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageVideos } from './pages/admin/ManageVideos';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageIntro } from './pages/admin/ManageIntro';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageSettings } from './pages/admin/ManageSettings';

import { DatabaseService } from './services/database'; 
import { supabase, isSupabaseReady } from './services/supabaseClient';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingContact } from './components/FloatingContact';
import { PageRoute, Post, SchoolConfig, User, DisplayBlock, MenuItem, StaffMember, PostCategory, DocumentCategory, SchoolDocument, GalleryImage, GalleryAlbum, UserRole } from './types';

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

  const loadAllData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [
        configData, menuData, blocksData, postsData, staffData, 
        catData, docCatData, docData, galleryData, albumData
      ] = await Promise.allSettled([
        DatabaseService.getConfig(),
        DatabaseService.getMenu(),
        DatabaseService.getBlocks(),
        DatabaseService.getPosts(100), // Lấy nhiều hơn cho Admin
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
      if (showLoader) setIsLoading(false);
    }
  }, []);

  const navigate = useCallback((path: string, id?: string) => {
    setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);
    const url = path === 'home' ? '/' : `/?page=${path}${id ? `&id=${id}` : ''}`;
    window.history.pushState({}, '', url);
  }, []);

  const handleSetUserFromAuth = useCallback(async (authUser: any) => {
    if (!authUser) {
      setCurrentUser(null);
      return;
    }
    const profile = await DatabaseService.getUserProfile(authUser.id);
    if (profile) {
      setCurrentUser({ ...profile, email: authUser.email || '' });
    } else {
      setCurrentUser({
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'user',
        fullName: authUser.user_metadata?.full_name || 'Thành viên mới',
        role: UserRole.GUEST,
        email: authUser.email || ''
      });
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') as PageRoute || 'home';
      const id = params.get('id') || undefined;
      setCurrentPage(page);
      setDetailId(id);
    };
    window.addEventListener('popstate', handlePopState);
    if (isSupabaseReady && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) handleSetUserFromAuth(session.user);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSetUserFromAuth(session?.user || null);
      });
      return () => {
        subscription.unsubscribe();
        window.removeEventListener('popstate', handlePopState);
      };
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadAllData, handleSetUserFromAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-900 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải hệ thống...</p>
      </div>
    );
  }

  const isAdminRoute = currentPage.startsWith('admin-');

  // Hàm render nội dung admin dựa trên route
  const renderAdminContent = () => {
    switch(currentPage) {
      case 'admin-dashboard': return <Dashboard posts={posts} />;
      case 'admin-news': return <ManageNews posts={posts} categories={postCategories} refreshData={() => loadAllData(false)} />;
      case 'admin-categories': return <ManagePostCategories refreshData={() => loadAllData(false)} />;
      case 'admin-blocks': return <ManageBlocks />;
      case 'admin-docs': return <ManageDocuments documents={documents} categories={docCategories} refreshData={() => loadAllData(false)} />;
      case 'admin-gallery': return <ManageGallery images={gallery} albums={albums} refreshData={() => loadAllData(false)} />;
      case 'admin-videos': return <ManageVideos refreshData={() => loadAllData(false)} />;
      case 'admin-staff': return <ManageStaff refreshData={() => loadAllData(false)} />;
      case 'admin-users': return <ManageUsers refreshData={() => loadAllData(false)} />;
      case 'admin-intro': return <ManageIntro refreshData={() => loadAllData(false)} />;
      case 'admin-menu': return <ManageMenu refreshData={() => loadAllData(false)} />;
      case 'admin-settings': return <ManageSettings />;
      default: return (
        <div className="p-8">
           <h1 className="text-2xl font-black text-slate-800 mb-4 uppercase">Trang quản trị</h1>
           <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm text-center">
              <p className="text-slate-500 font-medium">Vui lòng chọn một mục trong menu bên trái để bắt đầu quản lý.</p>
           </div>
        </div>
      );
    }
  };

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
        <AdminLayout 
          activePage={currentPage} 
          onNavigate={navigate} 
          currentUser={currentUser} 
          onLogout={() => {
            supabase?.auth.signOut();
            navigate('home');
          }}
        >
           <div className="p-4 md:p-8 animate-fade-in">
              {renderAdminContent()}
           </div>
        </AdminLayout>
      )}
    </div>
  );
};

export default App;
