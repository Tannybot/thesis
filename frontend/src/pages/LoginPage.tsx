/* Login Page — Premium split-pane landing and login page */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QrCode, Eye, EyeOff, LogIn, ShieldCheck, Activity, Target } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left Panel: Lively Landing & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-16">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface-900 to-surface-950 z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-800/30 rounded-full blur-[100px] pointer-events-none z-0" />
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center justify-center gap-4 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}>
            <QrCode size={36} className="text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">LiveTrack</h1>
            <p className="text-primary-300 font-medium text-sm">Enterprise Livestock System</p>
          </div>
        </div>

        {/* Center Marketing Copy */}
        <div className="relative z-10 max-w-2xl animate-in space-y-8 mt-12 mx-auto flex flex-col items-center text-center">
          <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Next-generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-200">
              traceability & health
            </span>
          </h2>
          <p className="text-lg text-surface-300 leading-relaxed max-w-lg mx-auto">
            Monitor livestock through their entire lifecycle. Seamlessly integrate QR scanning, health records, and supply chain movements in one unified platform.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 w-full max-w-2xl">
            <div className="glass-card !bg-surface-900/40 !border-surface-700/50 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-primary-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Verifiable Records</h3>
              <p className="text-sm text-surface-400">Immutable health and movement logs accessible via instant QR scan.</p>
            </div>
            <div className="glass-card !bg-surface-900/40 !border-surface-700/50 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Activity size={24} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Live Analytics</h3>
              <p className="text-sm text-surface-400">Track growth stages, predictive health trends, and mortality metrics.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm text-surface-500 mb-8 flex items-center justify-center gap-8">
          <p>© 2026 LiveTrack Global. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Organized Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative">
        {/* Mobile-only Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 lg:hidden" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl lg:hidden" />

        <div className="relative w-full max-w-[420px] animate-in" style={{ animationDelay: '0.1s' }}>
          
          {/* Mobile-only Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <QrCode size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-50">LiveTrack</h1>
            <p className="text-surface-400 text-sm mt-1">Livestock Monitoring Config</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
            <p className="text-surface-400">Sign in to your administrator dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
              <Target size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label font-semibold text-surface-300" htmlFor="email-input">Work Email</label>
              <input
                id="email-input"
                type="email"
                className="input-field py-3 text-base"
                placeholder="admin@livestock.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label font-semibold text-surface-300" htmlFor="password-input">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field py-3 pr-12 text-base tracking-wide"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-950" />
                <span className="text-sm font-medium text-surface-400 group-hover:text-surface-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center py-3.5 text-base font-semibold mt-4 shadow-primary-500/25"
              disabled={isSubmitting}
              id="login-submit"
            >
              {isSubmitting ? (
                <div className="spinner w-5 h-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign In to Dashboard
                  <LogIn size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-800">
            <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-4 text-center">
              <p className="text-[13px] font-medium text-surface-400 uppercase tracking-wider mb-2">Demo Access</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <code className="bg-surface-950 px-2 py-1 rounded text-primary-400">admin@livestock.com</code>
                <span className="text-surface-600">/</span>
                <code className="bg-surface-950 px-2 py-1 rounded text-primary-400">admin123</code>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
