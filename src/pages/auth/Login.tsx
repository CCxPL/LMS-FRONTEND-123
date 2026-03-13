import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Lock, ArrowRight, GraduationCap, Loader } from "lucide-react";

const DEMO_USERS = [
  { id: "1", email: "superadmin@lms.com", role: "super-admin" },
  { id: "2", email: "admin@lms.com", role: "admin" },
  { id: "3", email: "teacher@lms.com", role: "teacher" },
  { id: "4", email: "student@lms.com", role: "student" },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });

      const storedUser = localStorage.getItem("lms_auth_user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    try {
      await login({ email: demoEmail, password: "password" });

      const storedUser = localStorage.getItem("lms_auth_user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">

      {/* IMAGE WRAPPER */}
      <div className="relative w-full max-w-[1450px] h-[730px] mx-auto">

        {/* BACKGROUND IMAGE */}
        <img
          src="/bg9.png"
          alt="background"
          className="w-full h-full object-cover rounded-3xl shadow-2xl"
        />

        {/* OVERLAY GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 rounded-3xl"></div>

        {/* LOGIN CARD */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 w-full max-w-[480px] bg-white/98 backdrop-blur-xl rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">

          {/* LOGO */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png" 
              alt="Logo"
              className="h-14 w-auto object-contain" 
            />
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </h1>

          <p className="text-gray-500 mb-8 text-sm text-center">
            Sign in to continue your learning journey
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-sm transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-sm transition-all"
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
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

          {/* DEMO LOGIN */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs text-center text-gray-500 mb-4 uppercase font-semibold tracking-wider">
              Quick Demo Login
            </p>

            <div className="grid grid-cols-2 gap-3">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleDemoLogin(u.email)}
                  disabled={isLoading}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#0081d1] hover:bg-blue-50 text-xs capitalize font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {u.role.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;