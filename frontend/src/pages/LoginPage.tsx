import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Activity, Eye, EyeOff, LogIn, ShieldCheck, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AppLogo from '@/components/ui/AppLogo';

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(' ');
    if (typeof detail === 'string') return detail;
    if (!error.response) return 'Cannot reach the backend API. Check VITE_API_BASE_URL and CORS settings.';
  }
  return 'Login failed. Please try again.';
}

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
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-hero">
        <div className="flex items-center gap-3">
          <div className="brand-mark"><AppLogo /></div>
          <div>
            <h1 className="brand-title">HerdScan</h1>
          </div>
        </div>

        <div className="max-w-3xl">
          <span className="page-eyebrow"><ShieldCheck size={14} /> QR-based monitoring platform</span>
          <h2 className="hero-title mt-4">A clean command center for every animal record.</h2>
          <p className="hero-copy">
            Monitor identity, health, treatments, vaccination schedules, and movement logs with a secure
            dashboard built for academic and field operations.
          </p>
          <div className="auth-feature-grid">
            <div className="auth-feature">
              <ShieldCheck size={22} style={{ color: 'var(--emerald)' }} />
              <p className="text-sm font-bold text-white mt-3">Verified traceability</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>QR-backed animal histories from registration to movement.</p>
            </div>
            <div className="auth-feature">
              <Activity size={22} style={{ color: 'var(--cyan)' }} />
              <p className="text-sm font-bold text-white mt-3">Operational insight</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Health and growth signals presented with dashboard clarity.</p>
            </div>
          </div>
        </div>

        <p className="text-sm" style={{ color: 'rgba(244, 251, 247, 0.55)' }}>HerdScan 2026</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card animate-in">
          <div className="mobile-only auth-brand-lockup">
            <div className="auth-logo-container"><AppLogo size={160} /></div>
            <h1 className="auth-logo-title">HerdScan</h1>
          </div>

          <div className="mb-8">
            <span className="page-eyebrow">Secure access</span>
            <h2 className="text-4xl font-black text-white tracking-tight mt-3">Welcome back</h2>
            <p className="mt-2" style={{ color: 'var(--muted)' }}>Sign in to manage livestock records and traceability workflows.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm font-semibold flex items-start gap-3" style={{ background: 'rgba(251, 113, 133, 0.12)', border: '1px solid rgba(251, 113, 133, 0.25)', color: 'var(--rose)' }}>
              <Target size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="email-input">Email</label>
              <input
                id="email-input"
                type="email"
                className="input-field"
                placeholder="Enter your Username"
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
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: 'var(--emerald)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold" style={{ color: 'var(--cyan)' }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting} id="login-submit">
              {isSubmitting ? <div className="spinner w-5 h-5 border-2 border-black/20 border-t-black" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Need a user account? </span>
            <Link to="/register" className="text-sm font-bold" style={{ color: 'var(--cyan)' }}>Create one</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
