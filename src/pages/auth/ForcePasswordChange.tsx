import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const ForcePasswordChange: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, text: 'Fair', color: 'bg-yellow-500' };
    return { strength, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'super-admin': return '/super-admin/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/login';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (oldPassword === newPassword) {
      showToast('New password must be different from default password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await changePassword(oldPassword, newPassword);

      if (success) {
        showToast('Password changed successfully!', 'success');
        navigate(getRoleDashboard(), { replace: true });
      } else {
        showToast('Default password is incorrect', 'error');
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container min-h-screen w-full bg-linear-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">
      
      {/* DESKTOP/LAPTOP VIEW */}
      <div className="hidden lg:block relative w-full max-w-365 h-182.5 mx-auto">
        <img
          src="/fp.png"
          alt="background"
          className="w-full h-full object-cover rounded-3xl shadow-2xl"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/10 rounded-3xl"></div>

        {/* LEFT SIDE FORM - Smaller & Compact */}
        <div className="auth-card absolute left-8 lg:left-40 top-1/2 -translate-y-1/2 w-full max-w-95 bg-white/98 backdrop-blur-xl rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">
          
          <div className="flex items-center justify-center mb-5">
            <img 
              src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png" 
              alt="Logo"
              className="h-10 w-auto object-contain" 
            />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">
            Change Password
          </h1>

          <p className="text-gray-500 mb-4 text-xs text-center">
            Welcome, <span className="font-semibold text-[#0081d1]">{user?.name}</span>!
          </p>

          {/* Alert Box - Compact */}
          <div className="mb-4 p-2.5 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-yellow-900 mb-1">Temporary Password</p>
                <div className="flex items-center gap-2 mt-1 p-1.5 bg-white/60 rounded border border-yellow-200">
                  <code className="text-yellow-900 font-mono text-xs font-semibold">
                    {user?.defaultPassword || '12345678'}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Current Password */}
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
                style={{ backgroundColor: '#f9fafb', color: '#000000' }}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
                style={{ backgroundColor: '#f9fafb', color: '#000000' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password Strength Indicator - Compact */}
            {newPassword && (
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-gray-500 text-[10px]">Strength</span>
                  <span className={`font-semibold text-[10px] ${
                    passwordStrength.text === 'Weak' ? 'text-red-600' :
                    passwordStrength.text === 'Fair' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
                style={{ backgroundColor: '#f9fafb', color: '#000000' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && newPassword === confirmPassword && (
              <div className="flex items-center gap-1 text-green-600 text-[10px]">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Passwords match!</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#0081d1] to-[#0057a8] text-white py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-medium text-xs mt-4"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin w-3.5 h-3.5" />
                  Updating...
                </>
              ) : (
                <>
                  Change Password
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-[10px] text-gray-500 text-center">
              One-time security measure
            </p>
          </div>

        </div>
      </div>

      {/* MOBILE/TABLET VIEW */}
      <div className="lg:hidden auth-card w-full max-w-95 bg-white/98 backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">

        <div className="flex items-center justify-center mb-5">
          <img 
            src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png" 
            alt="Logo"
            className="h-10 w-auto object-contain" 
          />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">
          Change Password
        </h1>

        <p className="text-gray-500 mb-4 text-xs text-center">
          Welcome, <span className="font-semibold text-[#0081d1]">{user?.name}</span>!
        </p>

        {/* Alert Box */}
        <div className="mb-4 p-2.5 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-yellow-900 mb-1">Temporary Password</p>
              <div className="flex items-center gap-2 mt-1 p-1.5 bg-white/60 rounded border border-yellow-200">
                <code className="text-yellow-900 font-mono text-xs font-semibold">
                  {user?.defaultPassword || '12345678'}
                </code>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="relative">
            <input
              type={showOldPassword ? 'text' : 'password'}
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-xs transition-all text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-green-600 text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Passwords match
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-linear-to-r from-[#0081d1] to-[#0057a8] text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-xs mt-4"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin w-3.5 h-3.5" />
                Updating...
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default ForcePasswordChange;