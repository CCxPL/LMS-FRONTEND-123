import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import {
  Mail,
  Lock,
  ArrowRight,
  Loader,
} from 'lucide-react';

import DeviceConflictModal from '../../components/common/DeviceConflictModal';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const {
    login,
    forceLogin,
    dismissDeviceConflict,
    deviceConflict,
    isLoading,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forceLoading, setForceLoading] = useState(false);

  const handleLoginSuccess = () => {
    const storedUser = localStorage.getItem('lms_auth_user');

    if (!storedUser) {
      setError('Unable to load logged in user.');
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.mustChangePassword) {
        navigate('/force-password-change', {
          replace: true,
        });

        return;
      }

      navigate(`/${user.role}/dashboard`, {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Failed to read logged in user:',
        error
      );

      setError(
        'Something went wrong while logging in.'
      );
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError('');

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({
        email: cleanEmail,
        password,
      });

      handleLoginSuccess();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        return;
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password';

      setError(message);
    }
  };

  const handleForceLogin = async () => {
    setForceLoading(true);
    setError('');

    try {
      await forceLogin();

      handleLoginSuccess();
    } catch (error) {
      console.error(
        'Force login failed:',
        error
      );

      setError(
        'Force login failed. Please try again.'
      );
    } finally {
      setForceLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* EMAIL */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-sm transition-all text-gray-900"
            style={{
              backgroundColor: '#f9fafb',
              color: '#000000',
            }}
          />
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-sm transition-all text-gray-900"
            style={{
              backgroundColor: '#f9fafb',
              color: '#000000',
            }}
          />
        </div>

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate('/forgot-password')
            }
            className="text-sm text-[#0081d1] hover:text-[#0057a8] font-medium hover:underline transition-all"
          >
            Forgot Password?
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0081d1] to-[#0057a8] text-white py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </>
  );

  return (
    <div className="auth-page-container min-h-screen w-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">
      {/* DEVICE CONFLICT */}
      {deviceConflict && (
        <DeviceConflictModal
          onForceLogin={handleForceLogin}
          onCancel={dismissDeviceConflict}
          isLoading={forceLoading}
        />
      )}

      {/* DESKTOP */}
      <div className="hidden lg:block relative w-full max-w-365.2 h-182.5 mx-auto">
        <img
          src="/bg9.png"
          alt="background"
          className="w-full h-full object-cover rounded-3xl shadow-2xl"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 rounded-3xl" />

        <div className="auth-card absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 w-full max-w-120 bg-white/98 backdrop-blur-xl rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </h1>

          <p className="text-gray-500 mb-8 text-sm text-center">
            Sign in to continue your learning journey
          </p>

          {renderLoginForm()}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden auth-card w-full max-w-120 bg-white/98 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">
        <div className="flex items-center justify-center mb-8">
          <img
            src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png"
            alt="Logo"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-gray-500 mb-8 text-sm text-center">
          Sign in to continue your learning journey
        </p>

        {renderLoginForm()}
      </div>
    </div>
  );
};

export default Login;