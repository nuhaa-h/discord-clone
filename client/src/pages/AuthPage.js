import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await login({ email: formData.email, password: formData.password });
      } else {
        res = await register(formData);
      }
      loginUser(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 127.14 96.36" fill="white">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
        </div>

        <h1 className="auth-title">
          {isLogin ? 'Welcome back!' : 'Create an account'}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? "We're so excited to see you again!"
            : 'Join the community today!'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="CoolUser123"
                required
                minLength={2}
                maxLength={32}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account? " : 'Already have an account? '}
          <button type="button" className="link-btn" onClick={toggleMode}>
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
