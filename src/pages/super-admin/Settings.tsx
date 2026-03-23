import React, { useState } from 'react';
import { Save, Bell, Lock, Globe, AlertTriangle, Palette, RotateCcw, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const { theme, updateTheme, resetTheme, availableFonts } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LMS Portal',
    supportEmail: 'support@lms.com',
    maintenanceMode: false,
    registrationOpen: true,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifs: true,
    pushNotifs: false,
    marketingEmails: true,
    securityAlerts: true,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Password validation
  const validatePassword = () => {
    if (!securitySettings.currentPassword) {
      showToast('Please enter current password', 'error');
      return false;
    }
    if (!securitySettings.newPassword) {
      showToast('Please enter new password', 'error');
      return false;
    }
    if (securitySettings.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return false;
    }
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  // Handle Password Update
  const handlePasswordUpdate = () => {
    if (!validatePassword()) return;
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Password updated successfully', 'success');
      setSecuritySettings({
        ...securitySettings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }, 1000);
  };

  // Handle 2FA Toggle
  const handle2FAToggle = () => {
    setIsSaving(true);
    setTimeout(() => {
      setSecuritySettings({
        ...securitySettings,
        twoFactorEnabled: !securitySettings.twoFactorEnabled,
      });
      setIsSaving(false);
      showToast(
        securitySettings.twoFactorEnabled 
          ? '2FA disabled successfully' 
          : '2FA enabled successfully',
        'success'
      );
    }, 800);
  };

  // Handle Save All Settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      
      // Save based on active tab
      switch (activeTab) {
        case 'general':
          showToast('General settings saved successfully', 'success');
          break;
        case 'appearance':
          showToast('Appearance settings saved successfully', 'success');
          break;
        case 'notifications':
          showToast('Notification preferences saved successfully', 'success');
          break;
        case 'security':
          showToast('Security settings saved successfully', 'success');
          break;
      }
      
      console.log('Saved Settings:', {
        general: generalSettings,
        notifications: notificationSettings,
        security: securitySettings,
        appearance: theme,
      });
    }, 1000);
  };

  // Handle Theme Reset
  const handleResetTheme = () => {
    resetTheme();
    showToast('Theme reset to default', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform configurations</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id 
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
              <h3 className="text-lg font-bold mb-6 border-b pb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </h3>
              <div className="space-y-6">
                <Input 
                  label="Site Name" 
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                  placeholder="Enter site name"
                />
                <Input 
                  label="Support Email" 
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                  placeholder="support@example.com"
                />
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4 text-gray-900">System Status</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-10 h-6 rounded-full transition ${
                          generalSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                        }`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition transform ${
                            generalSettings.maintenanceMode ? 'translate-x-5 mt-1 ml-1' : 'translate-x-1 mt-1'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Maintenance Mode</p>
                          <p className="text-xs text-gray-500">Disable access for non-admin users</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
                        className="sr-only"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-10 h-6 rounded-full transition ${
                          generalSettings.registrationOpen ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition transform ${
                            generalSettings.registrationOpen ? 'translate-x-5 mt-1 ml-1' : 'translate-x-1 mt-1'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">User Registration</p>
                          <p className="text-xs text-gray-500">Allow new users to sign up</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generalSettings.registrationOpen}
                        onChange={(e) => setGeneralSettings({...generalSettings, registrationOpen: e.target.checked})}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <Card>
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance Settings
                </h3>
                <button 
                  onClick={handleResetTheme}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Font Select */}
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Global Font Family</label>
                  <select 
                    value={theme.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {availableFonts.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Changes will apply globally across the platform</p>
                </div>

                {/* Sidebar Background */}
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Sidebar Background Color</label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={theme.sidebarBg}
                      onChange={(e) => updateTheme({ sidebarBg: e.target.value })}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={theme.sidebarBg}
                      onChange={(e) => updateTheme({ sidebarBg: e.target.value })}
                      placeholder="#000000"
                      className="flex-1 p-3 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Customize the main sidebar background color</p>
                </div>

                {/* Sidebar Text */}
                <div>
                  <label className="block font-semibold mb-2 text-gray-900">Sidebar Text Color</label>
                  <div className="flex gap-3">
                    <input 
                      type="color" 
                      value={theme.sidebarText}
                      onChange={(e) => updateTheme({ sidebarText: e.target.value })}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={theme.sidebarText}
                      onChange={(e) => updateTheme({ sidebarText: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 p-3 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Text and icon color in the sidebar</p>
                </div>

                {/* Preview Box */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                  <div 
                    className="p-4 rounded-lg shadow-sm"
                    style={{ 
                      backgroundColor: theme.sidebarBg, 
                      color: theme.sidebarText,
                      fontFamily: theme.fontFamily 
                    }}
                  >
                    <p className="font-semibold">Sample Sidebar Text</p>
                    <p className="text-sm opacity-80 mt-1">This is how your sidebar will look</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-lg font-bold mb-6 border-b pb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive daily digest and important updates via email' },
                  { key: 'pushNotifs', label: 'Push Notifications', desc: 'Get real-time browser notifications for urgent alerts' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, tutorials, and promotional offers' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Notifications about login attempts and account changes' },
                ].map((item) => (
                  <label 
                    key={item.key} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-10 h-6 rounded-full transition ${
                        notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition transform ${
                          notificationSettings[item.key as keyof typeof notificationSettings] 
                            ? 'translate-x-5 mt-1 ml-1' 
                            : 'translate-x-1 mt-1'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings({...notificationSettings, [item.key]: e.target.checked})}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <Card>
              <h3 className="text-lg font-bold mb-6 border-b pb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </h3>
              <div className="space-y-6">
                {/* 2FA Section */}
                <div className={`p-4 rounded-lg border-2 flex items-start gap-3 ${
                  securitySettings.twoFactorEnabled 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  {securitySettings.twoFactorEnabled ? (
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${
                      securitySettings.twoFactorEnabled ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      Two-Factor Authentication {securitySettings.twoFactorEnabled ? '(Enabled)' : '(Disabled)'}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      securitySettings.twoFactorEnabled ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {securitySettings.twoFactorEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Add an extra layer of security to your account'}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={handle2FAToggle}
                      disabled={isSaving}
                      className={`mt-3 ${
                        securitySettings.twoFactorEnabled 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {isSaving ? 'Processing...' : securitySettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4 text-gray-900">Change Password</h4>
                  <div className="space-y-4">
                    <Input 
                      label="Current Password" 
                      type="password" 
                      placeholder="Enter current password"
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                    />
                    <Input 
                      label="New Password" 
                      type="password" 
                      placeholder="Enter new password (min 8 characters)"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                    />
                    <Input 
                      label="Confirm New Password" 
                      type="password" 
                      placeholder="Re-enter new password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handlePasswordUpdate}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
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