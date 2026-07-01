import React, { useState } from 'react';
import { Search, Bell, Calendar, HelpCircle, Check } from 'lucide-react';
import { useAppSelector } from '../../store';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onQuickUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onQuickUpload }) => {
  const [searchVal, setSearchVal] = useState('');
  const { analyses } = useAppSelector((state) => state.analysis);
  const [showNotifications, setShowNotifications] = useState(false);

  // Show a few completed analyses as notifications
  const recentUpdates = analyses
    .slice(0, 4);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const getTodayString = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="px-8 pt-8 pb-0">
      <header className="h-16 skeuo-panel flex items-center justify-between px-6 select-none z-30 relative animate-fade-in">
        {/* Search Bar */}
        <div className="w-[380px] relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search candidates, resumes, keyword segments..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full h-10 pl-11 pr-4 rounded-full skeuo-pressed text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Control Widgets */}
        <div className="flex items-center gap-5">
          {/* Date Widget */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-600 font-bold skeuo-pressed px-4 py-2 rounded-full">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{getTodayString()}</span>
          </div>

          {/* Support Help Button */}
          <button 
            title="System Documentation"
            className="text-slate-600 hover:text-slate-800 transition-colors h-10 w-10 flex items-center justify-center skeuo-raised rounded-full active:skeuo-pressed"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`text-slate-600 hover:text-slate-800 transition-colors h-10 w-10 flex items-center justify-center rounded-full relative ${showNotifications ? 'skeuo-pressed' : 'skeuo-raised active:skeuo-pressed'}`}
            >
              <Bell className="h-4.5 w-4.5" />
              {recentUpdates.some(a => a.status === 'processing' || a.status === 'pending') && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-[#F5F6FA] animate-pulse" />
              )}
              {!recentUpdates.some(a => a.status === 'processing' || a.status === 'pending') && recentUpdates.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#F5F6FA]" />
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 skeuo-panel py-3 z-50 animate-slide-up">
                <div className="px-5 py-2 flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Evaluation Tasks</span>
                  <span className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">Clear all</span>
                </div>
                <div className="max-h-72 overflow-y-auto px-3 space-y-2">
                  {recentUpdates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-bold">
                      No active runs or recent logs.
                    </div>
                  ) : (
                    recentUpdates.map((analysis) => (
                      <div 
                        key={analysis.id}
                        className="p-3 skeuo-pressed rounded-xl flex gap-3 text-xs"
                      >
                        <div className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center skeuo-raised ${
                          analysis.status === 'complete' 
                            ? 'text-emerald-600' 
                            : analysis.status === 'failed' 
                            ? 'text-rose-600' 
                            : 'text-amber-500 animate-pulse'
                        }`}>
                          {analysis.status === 'complete' ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-slate-800 truncate leading-tight">
                            Scan Task: {analysis.id.slice(0, 8)}
                          </p>
                          <p className="text-slate-600 mt-0.5 capitalize text-[10px] font-bold">
                            Status: {analysis.status}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap font-bold flex items-center">
                          {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Upload Button */}
          {onQuickUpload && (
            <button
              onClick={onQuickUpload}
              className="flex items-center gap-1.5 skeuo-raised-accent text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all cursor-pointer ml-2"
            >
              Add Resume
            </button>
          )}
        </div>
      </header>
    </div>
  );
};
