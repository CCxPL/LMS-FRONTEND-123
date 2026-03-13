import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader, CheckCircle } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center p-4">

      {/* IMAGE WRAPPER */}
      <div className="relative w-full max-w-[1450px] h-[740px] mx-auto">

        {/* BACKGROUND IMAGE */}
        <img
          src="/fg4.png"
          alt="background"
          className="w-full h-full object-cover rounded-3xl shadow-2xl"
        />

        {/* OVERLAY GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 rounded-3xl"></div>

        {/* FORGOT PASSWORD CARD */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 w-full max-w-[400px] bg-white/98 backdrop-blur-xl rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">

          {/* LOGO */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/WhatsApp_Image_2026-03-13_at_12.13.36_PM-removebg-preview.png" 
              alt="Logo"
              className="h-14 w-auto object-contain" 
            />
          </div>

          {!isSuccess ? (
            <>
              {/* TITLE */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Forgot Password?
              </h1>

              <p className="text-gray-500 mb-8 text-sm text-center">
                Enter your email address and we'll send you a link to reset your password
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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0081d1] focus:ring-2 focus:ring-[#0081d1]/20 outline-none text-sm transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0081d1] to-[#0057a8] text-white py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin w-5 h-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* BACK TO LOGIN */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0081d1] font-medium transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              {/* SUCCESS MESSAGE */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Check Your Email
                </h1>

                <p className="text-gray-600 mb-2 text-sm">
                  We've sent a password reset link to:
                </p>

                <p className="text-[#0081d1] font-semibold mb-6">
                  {email}
                </p>

                <p className="text-gray-500 text-xs mb-8">
                  Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0081d1] to-[#0057a8] text-white py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium"
                  >
                    Back to Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="w-full text-sm text-gray-600 hover:text-[#0081d1] font-medium transition-all"
                  >
                    Didn't receive email? Try again
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;