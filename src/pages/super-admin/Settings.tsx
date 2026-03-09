import React, { useState } from 'react';
import { Save, Bell, Lock, Globe, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

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
          {activeTab === 'general' && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">General Settings</h3>
              <div className="space-y-6">
                <Input 
                  label="Site Name" 
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                />
                <Input 
                  label="Support Email" 
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                />
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">System Status</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                        <p className="text-xs text-gray-500">Disable access for non-admin users</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">User Registration</p>
                        <p className="text-xs text-gray-500">Allow new users to sign up</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={generalSettings.registrationOpen}
                        onChange={(e) => setGeneralSettings({...generalSettings, registrationOpen: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive daily summaries and alerts' },
                  { key: 'pushNotifs', label: 'Push Notifications', desc: 'Real-time updates on browser' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, offers, and platform news' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and password changes' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings({...notificationSettings, [item.key]: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                  </label>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Security Settings</h3>
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      We recommend enabling 2FA for all admin accounts to ensure maximum security.
                    </p>
                    <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 border-none text-white">
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  <Button variant="outline" className="w-full">Update Password</Button>
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