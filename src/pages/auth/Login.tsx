import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ArrowRight, GraduationCap, Loader } from 'lucide-react';

// Demo users for quick login
const DEMO_USERS = [
  { id: '1', email: 'superadmin@lms.com', role: 'super-admin' },
  { id: '2', email: 'admin@lms.com', role: 'admin' },
  { id: '3', email: 'teacher@lms.com', role: 'teacher' },
  { id: '4', email: 'student@lms.com', role: 'student' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      
      // Get user from localStorage for redirect
      const storedUser = localStorage.getItem('lms_auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
    
    try {
      await login({ email: demoEmail, password: 'password' });
      
      // Get user from localStorage for redirect
      const storedUser = localStorage.getItem('lms_auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LMS Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Forgot Password Button - ADD THIS */}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="w-full text-center text-sm text-gray-600 hover:text-black transition"
            >
              Forgot Password?
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 mb-4 uppercase tracking-wider font-medium">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(u => (
                <button 
                  key={u.id} 
                  onClick={() => handleDemoLogin(u.email)}
                  disabled={isLoading}
                  className="text-sm p-3 border border-gray-200 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all capitalize font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {u.role.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Info Section */}
      <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 from-gray-900 to-black" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Start your learning journey today</h2>
          <p className="text-gray-400 text-lg mb-8">
            Access thousands of courses, track your progress, and achieve your goals with our comprehensive learning platform.
          </p>
          <div className="space-y-4">
            {['Access premium courses', 'Learn from experts', 'Get certified'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;