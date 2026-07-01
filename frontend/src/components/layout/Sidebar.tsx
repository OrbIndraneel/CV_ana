import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Briefcase, 
  Settings, 
  LogOut, 
  Sliders,
  CreditCard,
  Trophy
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
    { id: 'challenge', icon: Trophy, label: 'AI Challenge Processor' },
  ];

  return (
    <div className="flex h-screen select-none flex-shrink-0 animate-fade-in py-6 pl-6">
      {/* Skeuomorphic Sidebar Panel */}
      <div className="w-64 skeuo-panel text-slate-900 flex flex-col justify-between h-full">
        <div className="p-6 overflow-y-auto">
          <div className="mb-8 flex items-center gap-3 skeuo-pressed p-3 rounded-2xl">
            <Logo showText={false} iconSize={32} logoColorClass="text-indigo-600" />
            <div>
              <h1 className="text-[10px] font-bold text-slate-600 tracking-widest uppercase leading-none">System Module</h1>
              <p className="text-lg font-bold text-slate-900 font-display mt-0.5 leading-none">CV Dada</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Navigation</h3>
              <nav className="space-y-3">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'skeuo-pressed text-indigo-600' 
                          : 'skeuo-raised text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Settings & Account</h3>
              <nav className="space-y-3">
                <button 
                  onClick={() => setCurrentTab('pricing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentTab === 'pricing' 
                      ? 'skeuo-pressed text-indigo-600' 
                      : 'skeuo-raised text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className={`h-4.5 w-4.5 ${currentTab === 'pricing' ? 'text-indigo-600' : 'text-slate-600'}`} />
                  Pricing & Billing
                </button>
                <button 
                  onClick={() => setCurrentTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentTab === 'settings' 
                      ? 'skeuo-pressed text-indigo-600' 
                      : 'skeuo-raised text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Settings className={`h-4.5 w-4.5 ${currentTab === 'settings' ? 'text-indigo-600' : 'text-slate-600'}`} />
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 skeuo-raised hover:text-rose-600 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5 text-rose-500" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 m-4 skeuo-pressed rounded-2xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeuo-raised text-indigo-600 flex items-center justify-center font-bold text-sm tracking-wide">
            {user?.email ? user.email.slice(0, 2).toUpperCase() : 'RC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">
              {user?.full_name || 'Recruiter Officer'}
            </p>
            <p className="text-[10px] text-slate-600 truncate leading-none mt-1">
              {user?.email || 'officer@talent.net'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
