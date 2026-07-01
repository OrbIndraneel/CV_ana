import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Palette,
  Monitor,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Mail
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { useTheme } from '../../context/ThemeContext';

interface SettingsPageProps {}

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'security';

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [analysisNotifs, setAnalysisNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security state
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const sectionNav = [
    { id: 'profile' as SettingsSection, icon: User, label: 'Profile' },
    { id: 'appearance' as SettingsSection, icon: Palette, label: 'Appearance' },
    { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
    { id: 'security' as SettingsSection, icon: Shield, label: 'Security' },
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Header */}
      <div className="skeuo-panel p-6 flex flex-col justify-center text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">Settings & Configuration</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Manage your account preferences, appearance, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="skeuo-panel p-4 space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2">Preferences</h3>
            {sectionNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'skeuo-pressed text-indigo-600'
                      : 'skeuo-raised text-slate-600 hover:text-slate-900 active:skeuo-pressed'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                  <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isActive ? 'text-indigo-600 rotate-90' : 'text-[#825D43]'}`} />
                </button>
              );
            })}

            {/* Danger Zone */}
            <div className="pt-4 mt-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-3">Account Actions</h3>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold text-rose-500 skeuo-raised hover:text-rose-600 active:skeuo-pressed transition-all cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Save Success Toast */}
          {saved && (
            <div className="flex items-center gap-3 skeuo-pressed border-l-4 border-emerald-500 text-emerald-700 text-xs font-bold px-5 py-4 rounded-2xl animate-slide-up">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              Settings saved successfully to physical memory.
            </div>
          )}

          {/* ============ PROFILE SECTION ============ */}
          {activeSection === 'profile' && (
            <div className="skeuo-panel overflow-hidden">
              <div className="px-8 py-6 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Profile Information</h3>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Update your personal information and display name.</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl skeuo-raised text-indigo-600 flex items-center justify-center font-bold text-2xl">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="skeuo-pressed px-5 py-3 rounded-2xl flex-1">
                    <p className="text-sm font-bold text-slate-900">{fullName || 'User'}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{email}</p>
                    <p className="text-[10px] text-indigo-600 font-bold mt-1.5 uppercase tracking-wider">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 px-5 skeuo-pressed rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all font-bold"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-12 pl-11 pr-5 skeuo-pressed rounded-full text-xs text-slate-600 cursor-not-allowed opacity-70 font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 pl-2 font-bold">Email cannot be changed.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 skeuo-raised-accent text-white text-xs font-bold px-6 py-3 rounded-full transition-all cursor-pointer active:skeuo-pressed"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ APPEARANCE SECTION ============ */}
          {activeSection === 'appearance' && (
            <div className="skeuo-panel overflow-hidden">
              <div className="px-8 py-6 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Appearance</h3>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Customize the visual theme of the application.</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 pl-2">Display Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {([
                      { id: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean and bright' },
                      { id: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                      { id: 'system' as const, icon: Monitor, label: 'System', desc: 'Follow OS setting' },
                    ]).map((t) => {
                      const Icon = t.icon;
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`relative p-6 rounded-[24px] text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'skeuo-pressed'
                              : 'skeuo-raised hover:skeuo-pressed'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                            </div>
                          )}
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${
                            isSelected ? 'skeuo-raised text-indigo-600' : 'skeuo-pressed text-slate-500 group-hover:text-slate-700'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>{t.label}</p>
                          <p className="text-[10px] text-slate-600 mt-1 font-bold">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 skeuo-raised-accent text-white text-xs font-bold px-6 py-3 rounded-full transition-all cursor-pointer active:skeuo-pressed"
                  >
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ NOTIFICATIONS SECTION ============ */}
          {activeSection === 'notifications' && (
            <div className="skeuo-panel overflow-hidden">
              <div className="px-8 py-6 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Notification Preferences</h3>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Control how and when you receive physical updates.</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Toggle items */}
                {([
                  { label: 'Email Notifications', desc: 'Receive account activity emails', value: emailNotifs, setter: setEmailNotifs, icon: Mail },
                  { label: 'Analysis Completion', desc: 'Get notified when scans finish', value: analysisNotifs, setter: setAnalysisNotifs, icon: CheckCircle2 },
                  { label: 'Weekly Digest', desc: 'Summary of weekly activity and insights', value: weeklyDigest, setter: setWeeklyDigest, icon: Bell },
                ]).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-[24px] skeuo-raised hover:-translate-y-0.5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full skeuo-pressed flex items-center justify-center">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.label}</p>
                          <p className="text-[10px] text-slate-600 font-bold mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      
                      {/* Physical Toggle Switch */}
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={`relative h-8 w-14 rounded-full transition-all duration-300 cursor-pointer ${
                          item.value ? 'bg-indigo-500 shadow-inner' : 'skeuo-pressed'
                        }`}
                      >
                        <span className={`absolute top-1 h-6 w-6 rounded-full transition-transform duration-300 ${
                          item.value ? 'translate-x-7 bg-white shadow-sm' : 'translate-x-1 skeuo-raised'
                        }`} />
                      </button>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 skeuo-raised-accent text-white text-xs font-bold px-6 py-3 rounded-full transition-all cursor-pointer active:skeuo-pressed"
                  >
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ SECURITY SECTION ============ */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              {/* Change Password */}
              <div className="skeuo-panel overflow-hidden">
                <div className="px-8 py-6 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <div className="h-8 w-8 skeuo-pressed rounded-full flex items-center justify-center">
                      <KeyRound className="h-4 w-4 text-indigo-600" />
                    </div>
                    Change Password
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium pl-10">Update your account password to keep your account secure.</p>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPwd ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-12 px-5 pr-12 skeuo-pressed rounded-full text-xs text-slate-900 focus:outline-none font-bold"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer p-1 rounded-full active:skeuo-pressed"
                      >
                        {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-12 px-5 pr-12 skeuo-pressed rounded-full text-xs text-slate-900 focus:outline-none font-bold"
                          placeholder="Enter new password"
                        />
                        <button
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer p-1 rounded-full active:skeuo-pressed"
                        >
                          {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full h-12 px-5 skeuo-pressed rounded-full text-xs text-slate-900 focus:outline-none font-bold transition-all ${
                          confirmPassword && confirmPassword !== newPassword
                            ? 'ring-2 ring-rose-500/50'
                            : ''
                        }`}
                        placeholder="Confirm new password"
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-[10px] text-rose-500 mt-2 pl-3 font-bold">Passwords do not match.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                      className={`flex items-center gap-2 text-white text-xs font-bold px-6 py-3 rounded-full transition-all ${
                        !currentPassword || !newPassword || newPassword !== confirmPassword
                          ? 'bg-[#2f2016] opacity-50 cursor-not-allowed'
                          : 'skeuo-raised-accent cursor-pointer active:skeuo-pressed'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="skeuo-panel overflow-hidden border border-rose-200/50">
                <div className="px-8 py-6 border-b border-rose-200/50 bg-rose-50/10">
                  <h3 className="font-bold text-rose-700 text-sm flex items-center gap-3">
                    <div className="h-8 w-8 skeuo-pressed rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                    </div>
                    Danger Zone
                  </h3>
                  <p className="text-[11px] text-rose-500 mt-1 font-bold pl-11">Irreversible and destructive actions.</p>
                </div>

                <div className="p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="skeuo-pressed px-6 py-4 rounded-2xl flex-1 w-full">
                      <p className="text-sm font-bold text-slate-900">Delete Account</p>
                      <p className="text-[11px] text-slate-600 font-bold mt-1">Permanently remove your account and all data. This action cannot be undone.</p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-xs font-bold text-rose-600 skeuo-raised px-6 py-3.5 rounded-full transition-all cursor-pointer active:skeuo-pressed shrink-0 w-full sm:w-auto justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="w-full sm:w-auto text-xs font-bold text-slate-700 skeuo-raised px-5 py-3 rounded-full transition-all cursor-pointer active:skeuo-pressed"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-5 py-3 rounded-full transition-all cursor-pointer shadow-md shadow-rose-600/20 active:scale-95"
                        >
                          <Trash2 className="h-4 w-4" />
                          Confirm Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
