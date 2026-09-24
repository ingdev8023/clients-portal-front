import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toUserMessage } from '../lib/errors';
import PreferenceControls from '../components/PreferenceControls';
import { usePreferences } from '../hooks/usePreferences';
import SystemAnimation from '../components/SystemAnimation/SystemAnimation';

export default function Login() {
  const { user, profile, signIn } = useAuth();
  const { t } = usePreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  if (user && profile) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'client') return <Navigate to="/portal" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(toUserMessage(err, t('login.failed'), t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <SystemAnimation />
      <div className="login-background-overlay" aria-hidden="true" />
      <div className="login-preferences"><PreferenceControls /></div>
      <section className="panel login-panel" aria-labelledby="login-title">
        <div className="login-heading">
          <div className="login-icon" aria-hidden="true">
            <LogIn size={28} />
          </div>
          <h1 id="login-title">{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" tabIndex="-1" ref={errorRef}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('login.password')}</label>
            <div className="password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder={t('login.password')} />
              <button type="button" className="icon-button password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')} title={showPassword ? t('login.hidePassword') : t('login.showPassword')}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={submitting}
          >
            <LogIn size={18} />
            {submitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </section>
    </main>
  );
}
