import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toUserMessage } from '../lib/errors';

export default function Login() {
  const { user, profile, signIn } = useAuth();
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
      setError(toUserMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="panel login-panel" aria-labelledby="login-title">
        <div className="login-heading">
          <div className="login-icon" aria-hidden="true">
            <LogIn size={28} />
          </div>
          <h1 id="login-title">Client Portal</h1>
          <p>Sign in to access your projects</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" tabIndex="-1" ref={errorRef}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
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
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Password" />
              <button type="button" className="icon-button password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>
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
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
