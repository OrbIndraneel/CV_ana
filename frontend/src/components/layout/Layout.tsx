import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppDispatch } from '../../store';
import { clearAuth } from '../../store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onQuickUpload?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentTab, 
  setCurrentTab,
  onQuickUpload 
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Listen for forced logout event triggered by token refresh failure in axios interceptor
    const handleForcedLogout = () => {
      dispatch(clearAuth());
    };

    window.addEventListener('auth_logout', handleForcedLogout);
    return () => {
      window.removeEventListener('auth_logout', handleForcedLogout);
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mesh-gradient font-sans text-slate-900 antialiased">
      {/* Single sidebar panel */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onQuickUpload={onQuickUpload} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
