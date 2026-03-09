import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, GraduationCap, Loader, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
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

          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-500">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
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
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-500 mb-8">
                We've sent a password reset link to <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition"
                >
                  Back to Login
                </button>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-black transition"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Info Section */}
      <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 from-gray-900 to-black" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Reset your password securely</h2>
          <p className="text-gray-400 text-lg mb-8">
            We take security seriously. Your password reset link will expire in 24 hours for your protection.
          </p>
          <div className="space-y-4">
            {['Check your inbox', 'Click the reset link', 'Create new password'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                  {i + 1}
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

export default ForgotPassword;