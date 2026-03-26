// src/pages/super-admin/Settings.tsx
import React, { useState } from 'react';
import { Save, Bell, Lock, Globe, AlertTriangle, Palette, RotateCcw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { updateProfileApi } from '../../api/userApi';

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const { theme, updateTheme, resetTheme, availableFonts } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LMS Portal',
    supportEmail: 'support@lms.com',
    maintenanceMode: false,
    registrationOpen: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifs: true,
    pushNotifs: false,
    marketingEmails: true,
    securityAlerts: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 1000);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updateProfileApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('Password updated successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage platform configurations</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 space-y-1">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Lock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                ? 'bg-black text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <Card>
              <h3 className="text-lg font-bold mb-6 border-b pb-4">General Settings</h3>
              <div className="space-y-6">
                <Input
                  label="Site Name"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
                <Input
                  label="Support Email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                />

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">System Status</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-xs text-gray-500">Disable access for non-admin users</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium">User Registration</p>
                        <p className="text-xs text-gray-500">Allow new users to sign up</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={generalSettings.registrationOpen}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, registrationOpen: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* APPEARANCE TAB - ONLY 3 FIELDS */}
          {activeTab === 'appearance' && (
            <Card>
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-bold">Appearance Settings</h3>
                <button
                  onClick={resetTheme}
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-100"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. Font Select */}
                <div>
                  <label className="block font-medium mb-2">Global Font</label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    {availableFonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Font will apply globally</p>
                </div>

                {/* 2. Sidebar Background */}
                <div>
                  <label className="block font-medium mb-2">Sidebar Background Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme.sidebarBg}
                      onChange={(e) => updateTheme({ sidebarBg: e.target.value })}
                      className="w-16 h-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.sidebarBg}
                      onChange={(e) => updateTheme({ sidebarBg: e.target.value })}
                      placeholder="#000000"
                      className="flex-1 p-3 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* 3. Sidebar Text */}
                <div>
                  <label className="block font-medium mb-2">Sidebar Text Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme.sidebarText}
                      onChange={(e) => updateTheme({ sidebarText: e.target.value })}
                      className="w-16 h-12 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.sidebarText}
                      onChange={(e) => updateTheme({ sidebarText: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 p-3 border rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-lg font-bold mb-6 border-b pb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive daily summaries' },
                  { key: 'pushNotifs', label: 'Push Notifications', desc: 'Real-time browser updates' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips and offers' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <Card>
              <h3 className="text-lg font-bold mb-6 border-b pb-4">Security Settings</h3>
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-amber-700 mt-1">Enable 2FA for maximum security.</p>
                    <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;