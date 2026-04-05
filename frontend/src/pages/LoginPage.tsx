/* Login Page — Futuristic neon split-pane landing */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #091a13 0%, #0d2818 40%, #132e1f 70%, #0f2318 100%)' }}
    >
      {/* Left Panel: Lively Landing & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-16">
        {/* Dynamic Background Effects */}
        <div
          className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(11, 26, 22, 0.9) 50%, rgba(6, 15, 12, 0.95) 100%)' }}
        />
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 70%)', filter: 'blur(80px)' }}
        />

        {/* Center Marketing Copy containing the Header */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="max-w-2xl animate-in space-y-8 mx-auto flex flex-col items-center text-center">
            
            {/* Header / Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 duration-500"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.5)',
                  animation: 'pulse-glow 5s ease-in-out infinite',
                }}
              >
                <QrCode size={24} className="text-white" />
              </div>
              <div className="text-left flex flex-col justify-center">
                <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">LiveTrack</h1>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: '#34d399' }}>Enterprise Framework</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight text-balance">
                Next-Generation <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee, #34d399, #10b981)' }}
                >
                  Livestock Intelligence
                </span>
              </h2>
              <p className="text-base lg:text-lg leading-relaxed max-w-lg mx-auto text-balance" style={{ color: 'rgba(110, 231, 183, 0.8)' }}>
                Seamlessly monitor your herd across its entire lifecycle. Unify health diagnostics, growth analytics, and movement logs in one powerful platform.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-10 w-full max-w-xl mx-auto px-2">
              <div
                className="p-6 rounded-[1.5rem] backdrop-blur-md flex flex-col items-center transition-transform hover:-translate-y-1 duration-300"
                style={{
                  background: 'rgba(11, 26, 22, 0.6)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.1)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                >
                  <ShieldCheck size={24} style={{ color: '#34d399' }} />
                </div>
                <h3 className="text-white text-base font-bold mb-2 tracking-wide">Instant Traceability</h3>
                <p className="text-sm text-balance leading-relaxed" style={{ color: 'rgba(52, 211, 153, 0.65)' }}>Verify immutable health, transit, and lifecycle logs with a single QR scan.</p>
              </div>
              <div
                className="p-6 rounded-[1.5rem] backdrop-blur-md flex flex-col items-center transition-transform hover:-translate-y-1 duration-300"
                style={{
                  background: 'rgba(11, 26, 22, 0.6)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  boxShadow: '0 10px 40px -10px rgba(34, 211, 238, 0.1)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(34, 211, 238, 0.12)' }}
                >
                  <Activity size={24} style={{ color: '#22d3ee' }} />
                </div>
                <h3 className="text-white text-base font-bold mb-2 tracking-wide">Predictive Analytics</h3>
                <p className="text-sm text-balance leading-relaxed" style={{ color: 'rgba(52, 211, 153, 0.65)' }}>Monitor key growth metrics, forecast health trends, and optimize yield.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm mb-8 flex items-center justify-center gap-8" style={{ color: 'rgba(52, 211, 153, 0.35)' }}>
          <p>© 2026 LiveTrack Global. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#34d399] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#34d399] transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Organized Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative">
        {/* Mobile-only Background Effects */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(135deg, #091a13, #0d2818, #091a13)' }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full lg:hidden"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent)', filter: 'blur(60px)' }}
        />

        <div className="relative w-full max-w-[420px] animate-in" style={{ animationDelay: '0.1s' }}>

          {/* Mobile-only Logo */}
          <div className="lg:hidden text-center mb-10">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              <QrCode size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">LiveTrack</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>Livestock Monitoring Config</p>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-base tracking-wide" style={{ color: 'rgba(52, 211, 153, 0.7)' }}>Securely access your administrator dashboard.</p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
              }}
            >
              <Target size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="email-input">Work Email</label>
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
              <label className="input-label" htmlFor="password-input">Password</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(52, 211, 153, 0.4)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{
                    accentColor: '#10b981',
                  }}
                />
                <span className="text-sm font-medium transition-colors" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold transition-colors" style={{ color: '#34d399' }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center py-3.5 text-base font-semibold mt-4"
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

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(11, 26, 22, 0.5)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
              }}
            >
              <p className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>Demo Access</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <code
                  className="px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(6, 15, 12, 0.6)', color: '#22d3ee' }}
                >admin@livestock.com</code>
                <span style={{ color: 'rgba(16, 185, 129, 0.3)' }}>/</span>
                <code
                  className="px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(6, 15, 12, 0.6)', color: '#22d3ee' }}
                >admin123</code>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
