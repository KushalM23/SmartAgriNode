import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './Auth.css';

export default function Login({ onAuthed }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(username, password);
      if (onAuthed) onAuthed(res.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter your username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>

        <p className="auth-redirect">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}