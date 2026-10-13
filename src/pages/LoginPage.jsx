import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser && !trimmedPass) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    if (!trimmedUser) {
      setErrorMessage('Please enter your email or username.');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticated login transition for demo
    setTimeout(() => {
      setIsLoading(false);
      // Store session
      sessionStorage.setItem('traffic_viz_authenticated', 'true');
      sessionStorage.setItem('traffic_viz_user', trimmedUser);
      if (onLoginSuccess) {
        onLoginSuccess({ username: trimmedUser });
      }
    }, 700);
  };

  const handleQuickDemo = () => {
    setUsername('student@university.edu');
    setPassword('demopassword123');
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('traffic_viz_authenticated', 'true');
      sessionStorage.setItem('traffic_viz_user', 'student@university.edu');
      if (onLoginSuccess) {
        onLoginSuccess({ username: 'student@university.edu' });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-gray-900">
      {/* Centered Card */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Project Branding & Context */}
        <div className="p-8 sm:p-10 bg-slate-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Academic Demonstration</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              Traffic Flow Visualization
            </h1>

            <p className="text-xs font-medium text-blue-700 italic mt-1">
              Dimensionality Reduction Using PCA and t-SNE
            </p>

            <p className="text-xs text-gray-600 mt-4 leading-relaxed">
              Explore traffic patterns and visualize high-dimensional traffic data using PCA and t-SNE.
            </p>

            {/* Subtle Minimal Traffic Network / 2D Scatter Graphic */}
            <div className="my-6 p-4 bg-white border border-gray-200 rounded-lg">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                2D Projection Manifold
              </span>
              <svg viewBox="0 0 240 100" className="w-full h-24 stroke-current">
                {/* Axes */}
                <line x1="20" y1="85" x2="225" y2="85" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="20" y1="10" x2="20" y2="85" stroke="#E5E7EB" strokeWidth="1.5" />

                {/* Free-flow Cluster (Green) */}
                <circle cx="170" cy="30" r="4.5" fill="#16A34A" opacity="0.8" />
                <circle cx="185" cy="25" r="4" fill="#16A34A" opacity="0.8" />
                <circle cx="160" cy="38" r="3.5" fill="#16A34A" opacity="0.8" />
                <circle cx="195" cy="35" r="4" fill="#16A34A" opacity="0.8" />

                {/* Moderate Cluster (Blue) */}
                <circle cx="120" cy="45" r="4" fill="#2563EB" opacity="0.8" />
                <circle cx="135" cy="50" r="3.5" fill="#2563EB" opacity="0.8" />
                <circle cx="110" cy="55" r="4" fill="#2563EB" opacity="0.8" />

                {/* Heavy Cluster (Orange) */}
                <circle cx="65" cy="60" r="4" fill="#EA580C" opacity="0.8" />
                <circle cx="75" cy="70" r="4" fill="#EA580C" opacity="0.8" />
                <circle cx="85" cy="58" r="3.5" fill="#EA580C" opacity="0.8" />

                {/* Gridlock Cluster (Red) */}
                <circle cx="45" cy="72" r="4.5" fill="#DC2626" opacity="0.8" />
                <circle cx="55" cy="78" r="4" fill="#DC2626" opacity="0.8" />
                <circle cx="38" cy="65" r="3.5" fill="#DC2626" opacity="0.8" />

                {/* Subtle Connecting Affinity Lines */}
                <line x1="170" y1="30" x2="185" y2="25" stroke="#16A34A" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                <line x1="120" y1="45" x2="135" y2="50" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                <line x1="65" y1="60" x2="45" y2="72" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
              </svg>

              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-600" /> Free-flow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-600" /> Heavy
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600" /> Gridlock
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Clean Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Sign In</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Access the dimensionality reduction analysis workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Validation Message Area */}
            {errorMessage && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <span className="font-semibold text-red-800">Error:</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="student@university.edu"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-9 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors disabled:bg-gray-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Blue Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Quick Demo Access Option for Presentations */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isLoading}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium rounded transition-colors"
              >
                Quick Demo Access (One-Click)
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
