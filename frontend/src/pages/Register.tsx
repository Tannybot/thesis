import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Eye, EyeOff, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AppLogo from '@/components/ui/AppLogo';

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(' ');
    if (typeof detail === 'string') return detail;
  }
  return 'Registration failed. Please review your details and try again.';
}

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirm password must match password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password, confirmPassword);
      navigate('/login', { replace: true });
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
            <p className="brand-subtitle">Livestock Traceability & Monitoring System</p>
          </div>
        </div>

        <div className="max-w-3xl">
          <span className="page-eyebrow"><ShieldCheck size={14} /> User-only signup</span>
          <h2 className="hero-title mt-4">Join the platform without exposing admin access.</h2>
          <p className="hero-copy">
            Public registration creates standard user accounts only. Administrative roles remain protected
            inside the system.
          </p>
        </div>

        <p className="text-sm" style={{ color: 'rgba(244, 251, 247, 0.55)' }}>Secure livestock data starts with safe access control.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card animate-in">
          <div className="mobile-only auth-brand-lockup">
            <div className="auth-logo-container"><AppLogo size={160} /></div>
            <h1 className="auth-logo-title">HerdScan</h1>
          </div>

          <div className="mb-8">
            <span className="page-eyebrow">Create account</span>
            <h2 className="text-4xl font-black text-white tracking-tight mt-3">Register</h2>
            <p className="mt-2" style={{ color: 'var(--muted)' }}>Create a secure user account for livestock monitoring workflows.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm font-semibold flex items-start gap-3" style={{ background: 'rgba(251, 113, 133, 0.12)', border: '1px solid rgba(251, 113, 133, 0.25)', color: 'var(--rose)' }}>
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="full-name-input">Full Name</label>
              <input id="full-name-input" type="text" className="input-field" placeholder="Juan Dela Cruz" value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} required />
            </div>
            <div>
              <label className="input-label" htmlFor="register-email-input">Email</label>
              <input id="register-email-input" type="email" className="input-field" placeholder="user@livestock.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="input-label" htmlFor="register-password-input">Password</label>
              <div className="relative">
                <input id="register-password-input" type={showPassword ? 'text' : 'password'} className="input-field pr-12" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="input-label" htmlFor="confirm-password-input">Confirm Password</label>
              <div className="relative">
                <input id="confirm-password-input" type={showConfirmPassword ? 'text' : 'password'} className="input-field pr-12" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner w-5 h-5 border-2 border-black/20 border-t-black" /> : <><UserPlus size={18} /> Create User Account</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--cyan)' }}>
              <LogIn size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
