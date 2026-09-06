import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function LoginModal({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Verification check: username is 123 and password is 123
    if (username.trim() === '123' && password === '123') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          username: '123',
          name: 'Lead Drilling Engineer 123',
          role: 'Lead Drilling Engineer',
          avatar: 'DE'
        });
      }, 250);
    } else {
      setError('Invalid credentials. Use sample login: Username "123" and Password "123".');
    }
  };

  const handleFillDemo = () => {
    setUsername('123');
    setPassword('123');
    setError('');
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="login-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Minimal Engineer Header */}
        <div className="login-header minimal-header">
          <h2 className="login-title-minimal">Welcome Engineer</h2>
        </div>

        {/* Sample Credentials Quick-Notice */}
        <div className="demo-credentials-banner">
          <div className="demo-banner-left">
            <KeyRound size={16} color="#8F7C3A" style={{ flexShrink: 0 }} />
            <div className="demo-banner-creds">
              Sample login: <code>123</code> / <code>123</code>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-fill-demo" 
            onClick={handleFillDemo}
            title="Auto-fill demo credentials"
          >
            Auto-fill
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="login-error-box">
            <AlertCircle size={17} color="#FF6B6B" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username or Email
            </label>
            <div className="login-input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="login-username"
                type="text"
                className="form-input login-input"
                placeholder="Enter username (123)"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="login-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input login-input"
                placeholder="Enter password (123)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
