import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './Auth.css';

export default function Signup({ onAuthed }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.register(username, email, password);
      const loginRes = await api.login(username, password);
      if (onAuthed) onAuthed(loginRes.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Choose a username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm your password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
          </div>

          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}