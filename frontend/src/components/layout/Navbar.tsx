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
    <header className="h-18 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 select-none z-30 relative animate-fade-in">
      {/* Search Bar */}
      <div className="w-[380px] relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search candidates, resumes, keyword segments..."
          value={searchVal}
          onChange={handleSearchChange}
          className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-slate-100 transition-all"
        />
      </div>

      {/* Control Widgets */}
      <div className="flex items-center gap-6">
        {/* Date Widget */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Calendar className="h-4.5 w-4.5 text-slate-400" />
          <span>{getTodayString()}</span>
        </div>

        {/* Support Help Button */}
        <button 
          title="System Documentation"
          className="text-slate-455 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100/70 rounded-full"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-455 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100/70 rounded-full relative"
          >
            <Bell className="h-5 w-5" />
            {recentUpdates.some(a => a.status === 'processing' || a.status === 'pending') && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            )}
            {!recentUpdates.some(a => a.status === 'processing' || a.status === 'pending') && recentUpdates.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3.5 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 py-2.5 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Evaluation Tasks</span>
                <span className="text-[10px] text-indigo-650 font-bold cursor-pointer hover:underline">Clear all</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recentUpdates.length === 0 ? (
                  <div className="py-8 px-4 text-center text-xs text-slate-400">
                    No active runs or recent logs.
                  </div>
                ) : (
                  recentUpdates.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100/60 last:border-0 flex gap-3 text-xs"
                    >
                      <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                        analysis.status === 'complete' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : analysis.status === 'failed' 
                          ? 'bg-rose-50 text-rose-600' 
                          : 'bg-amber-50 text-amber-600 animate-pulse'
                      }`}>
                        {analysis.status === 'complete' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-700 truncate">
                          Scan Task: {analysis.id.slice(0, 8)}
                        </p>
                        <p className="text-slate-400 mt-0.5 capitalize text-[10px]">
                          Status: {analysis.status}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
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
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-indigo-650 active:bg-gray-950 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Add Resume
          </button>
        )}
      </div>
    </header>
  );
};
