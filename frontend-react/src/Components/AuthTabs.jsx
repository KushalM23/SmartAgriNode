import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

export default function AuthTabs({ defaultTab = 'login', onAuthed }) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480, width: '100%', padding: '1.5rem' }}>
        <div className="tabs tabs-compact" style={{ marginBottom: '0.5rem' }}>
          <button className={`tab ${active === 'login' ? 'active' : ''}`} onClick={() => setActive('login')}>Login</button>
          <button className={`tab ${active === 'signup' ? 'active' : ''}`} onClick={() => setActive('signup')}>Sign Up</button>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          {active === 'login' ? (
            <Login onAuthed={onAuthed} />
          ) : (
            <Signup onAuthed={onAuthed} />
          )}
        </div>
      </div>
    </div>
  );
}


