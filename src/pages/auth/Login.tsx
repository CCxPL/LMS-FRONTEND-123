import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ArrowRight, GraduationCap, Loader } from 'lucide-react';

const DEMO_USERS = [
  { id: '1', email: 'superadmin@lms.com', password: 'password123', role: 'super-admin' },
  { id: '2', email: 'admin@lms.com', password: 'password123', role: 'admin' },
  { id: '3', email: 'teacher@lms.com', password: 'password123', role: 'teacher' },
  { id: '4', email: 'student@lms.com', password: 'password123', role: 'student' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const GLOW_INTENSITY = {
    layer1: 0.2, layer2: 0.1, layer3: 0.1,
    layer4: 0.1, layer5: 0.1, layer6: 0.1,
    radial1: 0.1, radial2: 0.05,
  };

  const GLOW_SPREAD = {
    radius1: 20, radius2: 40, radius3: 60,
    radius4: 80, radius5: 100, radius6: 120,
  };

  const RADIAL_SCALE = { scale1: 1.3, scale2: 1.5 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      const storedUser = localStorage.getItem('lms_auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');

    try {
      await login({ email: demoEmail, password: demoPassword });
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center p-4 lg:p-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex overflow-hidden relative">

        {/* Left: Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative z-10">
          <div className="max-w-md w-full">

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">EduLearn</span>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back!</h1>
              <p className="text-gray-500 text-lg">Sign in to continue your learning journey</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors group">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600 cursor-pointer rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm font-medium select-none">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-all"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium mt-6"
              >
                {isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" />Signing in...</>
                ) : (
                  <>Sign In<ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 mb-4 uppercase tracking-wider font-semibold">
                Quick Demo Login
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleDemoLogin(u.email, u.password)}
                    className="text-sm p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all font-medium capitalize"
                  >
                    {u.role.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Design */}
        <div className="hidden lg:block w-1/2 relative overflow-visible bg-white">
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="relative flex items-center justify-center">
              <img
                src="/laptop.png"
                alt="Learning Platform"
                className="relative z-20 w-[420px] h-auto object-contain"
                style={{
                  filter: `
                    drop-shadow(0 0 ${GLOW_SPREAD.radius1}px rgba(59, 130, 246, ${GLOW_INTENSITY.layer1}))
                    drop-shadow(0 0 ${GLOW_SPREAD.radius2}px rgba(37, 99, 235, ${GLOW_INTENSITY.layer2}))
                    drop-shadow(0 0 ${GLOW_SPREAD.radius3}px rgba(29, 78, 216, ${GLOW_INTENSITY.layer3}))
                    drop-shadow(0 0 ${GLOW_SPREAD.radius4}px rgba(30, 64, 175, ${GLOW_INTENSITY.layer4}))
                    drop-shadow(0 0 ${GLOW_SPREAD.radius5}px rgba(96, 165, 250, ${GLOW_INTENSITY.layer5}))
                    drop-shadow(0 0 ${GLOW_SPREAD.radius6}px rgba(147, 197, 253, ${GLOW_INTENSITY.layer6}))
                  `
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(59, 130, 246, ${GLOW_INTENSITY.radial1}) 0%, transparent 70%)`,
                  filter: 'blur(40px)',
                  transform: `scale(${RADIAL_SCALE.scale1})`
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(37, 99, 235, ${GLOW_INTENSITY.radial2}) 0%, transparent 70%)`,
                  filter: 'blur(60px)',
                  transform: `scale(${RADIAL_SCALE.scale2})`
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;