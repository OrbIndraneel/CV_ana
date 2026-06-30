import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Briefcase, 
  Settings, 
  LogOut, 
  Folder, 
  Layers, 
  CheckSquare, 
  Sliders,
  Lock,
  CreditCard
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/authSlice';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

import { Logo } from '../common/Logo';

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const mainNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Talent Dashboard' },
    { id: 'resumes', icon: Files, label: 'Resume Directory' },
    { id: 'jobs', icon: Briefcase, label: 'Job Openings' },
    { id: 'comparisons', icon: Sliders, label: 'Role Compatibility Matrix' },
  ];

  return (
    <div className="flex h-screen border-r border-slate-200/60 select-none flex-shrink-0 animate-fade-in">
      {/* Left Compact Pane */}
      <div className="w-[68px] bg-slate-950 flex flex-col items-center justify-between py-6">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo Brand Icon */}
          <Logo showText={false} iconSize={36} logoColorClass="text-indigo-500" />
          
          {/* Main Action Icons */}
          <div className="flex flex-col gap-4 w-full px-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isFree = !user?.subscription_tier || user.subscription_tier === 'free';
              const isLocked = item.id === 'comparisons' && isFree;

              return (
                <button
                  key={item.id}
                  onClick={() => isLocked ? setCurrentTab('pricing') : setCurrentTab(item.id)}
                  title={isLocked ? `${item.label} (Premium)` : item.label}
                  className={`flex items-center justify-center h-11 w-full rounded-full transition-all duration-300 relative group ${
                    isActive 
                      ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/20' 
                      : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5.5 w-5.5" />
                    {isLocked && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 rounded-full p-0.5 border border-slate-950">
                        <Lock className="h-2 w-2" />
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <span className="absolute left-16 bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-full opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {isLocked ? `${item.label} (PRO)` : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-4 w-full px-2">
          <button 
            onClick={() => setCurrentTab('pricing')}
            title="Pricing & Billing"
            className={`flex items-center justify-center h-11 w-full rounded-full transition-all duration-300 ${
              currentTab === 'pricing'
                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/20'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CreditCard className="h-5.5 w-5.5" />
          </button>

          <button 
            onClick={() => setCurrentTab('settings')}
            title="Settings"
            className={`flex items-center justify-center h-11 w-full rounded-full transition-all duration-300 ${
              currentTab === 'settings'
                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/20'
                : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="h-5.5 w-5.5" />
          </button>
          
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center justify-center h-11 w-full rounded-full text-slate-405 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-5.5 w-5.5" />
          </button>
        </div>
      </div>

      {/* Right Navigation Details Pane */}
      <div className="w-64 bg-white/70 backdrop-blur-md flex flex-col justify-between border-r border-slate-200/50">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-xs font-bold text-slate-400 tracking-widest uppercase">System Module</h1>
            <p className="text-lg font-bold text-slate-900 font-display mt-0.5">CV Dada</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Navigation</h3>
              <nav className="space-y-1.5">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  const isFree = !user?.subscription_tier || user.subscription_tier === 'free';
                  const isLocked = item.id === 'comparisons' && isFree;

                  return (
                    <button
                      key={item.id}
                      onClick={() => isLocked ? setCurrentTab('pricing') : setCurrentTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        {item.label}
                      </span>
                      {isLocked && (
                        <span className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Talent Pool Filter</h3>
              <div className="space-y-1.5">
                <button className="w-full flex items-center justify-between px-4 py-2 rounded-full text-xs text-slate-650 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-amber-500" />
                    Engineering
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">12</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 rounded-full text-xs text-slate-650 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-indigo-450" />
                    Product Management
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">4</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 rounded-full text-xs text-slate-650 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-emerald-500" />
                    Data & Analytics
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">8</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Monitors</h3>
              <div className="space-y-2.5 px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                <div className="flex items-center gap-2 text-[11px] text-slate-650 font-medium">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Model: spaCy Core lg</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-650 font-medium">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Celery Queue: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-650 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-inner shadow-indigo-700/50">
            {user?.email ? user.email.slice(0, 2).toUpperCase() : 'RC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {user?.full_name || 'Recruiter Officer'}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-none mt-1">
              {user?.email || 'officer@talent.net'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
