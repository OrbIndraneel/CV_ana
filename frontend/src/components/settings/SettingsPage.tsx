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
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800">Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account preferences, appearance, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm p-4 space-y-1">
            {sectionNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-slate-405'}`} />
                  {item.label}
                  <ChevronRight className={`h-3.5 w-3.5 ml-auto transition-transform ${isActive ? 'text-indigo-400 rotate-90' : 'text-slate-350'}`} />
                </button>
              );
            })}

            {/* Danger Zone */}
            <div className="pt-4 mt-4 border-t border-slate-200/60">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all cursor-pointer"
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
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-2xl animate-slide-up">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved successfully.
            </div>
          )}

          {/* ============ PROFILE SECTION ============ */}
          {activeSection === 'profile' && (
            <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200/60">
                <h3 className="font-bold text-slate-800 text-sm">Profile Information</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Update your personal information and display name.</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-805">{fullName || 'User'}</p>
                    <p className="text-xs text-slate-405 font-medium">{email}</p>
                    <p className="text-[10px] text-indigo-650 font-bold mt-1">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-105 transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-11 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Email cannot be changed.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-650 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
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
            <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200/60">
                <h3 className="font-bold text-slate-800 text-sm">Appearance</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Customize the visual theme of the application.</p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
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
                          className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-sm'
                              : 'border-slate-200 bg-white/40 hover:border-slate-350 hover:bg-slate-55/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle2 className="h-5 w-5 text-indigo-650" />
                            </div>
                          )}
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-indigo-100 text-indigo-650' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-indigo-750' : 'text-slate-750'}`}>{t.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-655 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
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
            <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200/60">
                <h3 className="font-bold text-slate-805 text-sm">Notification Preferences</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Control how and when you receive updates.</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Toggle items */}
                {([
                  { label: 'Email Notifications', desc: 'Receive account activity emails', value: emailNotifs, setter: setEmailNotifs, icon: Mail },
                  { label: 'Analysis Completion', desc: 'Get notified when scans finish', value: analysisNotifs, setter: setAnalysisNotifs, icon: CheckCircle2 },
                  { label: 'Weekly Digest', desc: 'Summary of weekly activity and insights', value: weeklyDigest, setter: setWeeklyDigest, icon: Bell },
                ]).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 bg-white/40 hover:bg-slate-50/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                          <Icon className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-750">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={`relative h-7 w-12 rounded-full transition-colors duration-200 cursor-pointer ${
                          item.value ? 'bg-indigo-650' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          item.value ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-650 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
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
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200/60">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-indigo-650" />
                    Change Password
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Update your account password to keep your account secure.</p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPwd ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-105 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-slate-105 transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full h-11 px-4 bg-slate-50 border rounded-full text-xs text-slate-700 focus:outline-none focus:ring-2 transition-all ${
                          confirmPassword && confirmPassword !== newPassword
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-gray-400 focus:ring-slate-100'
                        }`}
                        placeholder="Confirm new password"
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">Passwords do not match.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSave}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-650 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Shield className="h-4 w-4" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white/60 backdrop-blur-md rounded-3xl ring-1 ring-red-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-red-150 bg-red-50/20">
                  <h3 className="font-bold text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-655" />
                    Danger Zone
                  </h3>
                  <p className="text-[11px] text-red-400 mt-0.5 font-medium">Irreversible and destructive actions.</p>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-750">Delete Account</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Permanently remove your account and all data. This action cannot be undone.</p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50/50 px-4.5 py-2 rounded-full transition-all cursor-pointer animate-fade-in"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-full transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4.5 py-2 rounded-full transition-all cursor-pointer shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
