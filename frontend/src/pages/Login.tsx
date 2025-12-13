import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

 // In Login.tsx, update the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    // Call actual API via auth store
    await login(email, password);
    
    console.log('Login successful, navigating to /');
    // Redirect to dashboard/home page
    navigate('/');
  } catch (err: any) {
    console.error('Login error:', err);
    
    // Handle different error types
    if (err.response) {
      const errorMessage = err.response.data?.error || 
                          err.response.data?.message || 
                          'Login failed. Please try again.';
      setError(errorMessage);
    } else if (err.request) {
      setError('Network error. Please check your connection and try again.');
    } else {
      setError(err.message || 'Invalid email or password. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleDemoLogin = async (role: 'admin' | 'restaurant_owner' | 'editor') => {
    const demoUsers = {
      admin: { email: 'admin@menudigitale.com', password: 'Admin123!' },
      restaurant_owner: { email: 'owner@ristorante.com', password: 'Owner123!' },
      editor: { email: 'editor@menudigitale.com', password: 'Editor123!' }
    };

    const demoUser = demoUsers[role];
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    
    // Optional: Auto-submit after setting credentials
    // setTimeout(() => {
    //   handleSubmit(new Event('submit') as any);
    // }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] to-[#E8F0ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 overflow-hidden">
            <img 
              src="/menu.jpeg" 
              alt="MenùDigitale Logo"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#0A0C0B]">MenùDigitale</h1>
          <p className="text-[#687d76] mt-2">Sign in to your restaurant dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0A0C0B] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#687d76]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-[#7BD5B5] outline-none transition"
                  placeholder="you@restaurant.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0A0C0B] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#687d76]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-[#7BD5B5] outline-none transition"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#687d76] hover:text-[#0A0C0B] disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fadeIn">
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#0A0C0B] rounded border-gray-300 focus:ring-[#0A0C0B]"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-[#687d76]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#0A0C0B] hover:text-[#2a2c2b] font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button - Updated to #0A0C0B */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A0C0B] hover:bg-[#1A1C1B] text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0C0B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8">
            <p className="text-center text-sm text-[#687d76] mb-4">Try demo accounts:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="bg-[#E8F0ED] hover:bg-[#d0e0da] text-[#0A0C0B] py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('restaurant_owner')}
                disabled={isLoading}
                className="bg-[#7BD5B5]/20 hover:bg-[#7BD5B5]/30 text-[#0A0C0B] py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Owner
              </button>
              <button
                onClick={() => handleDemoLogin('editor')}
                disabled={isLoading}
                className="bg-[#687d76]/10 hover:bg-[#687d76]/20 text-[#0A0C0B] py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Editor
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-[#687d76]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#0A0C0B] hover:text-[#2a2c2b] font-medium">
                Contact sales
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#687d76]">
            © {new Date().getFullYear()} MenùDigitale. All rights reserved.
            <br />
            Powered by <span className="font-semibold text-[#0A0C0B]">KYZERO® WEBMARKETING</span>
            <br />
            <Link to="/privacy" className="hover:text-[#0A0C0B]">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="hover:text-[#0A0C0B]">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;