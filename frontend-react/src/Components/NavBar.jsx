import CardNav from './CardNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import "./NavBar.css"

export default function NavBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const items = [
    {
      label: "Dashboard",
      /* Change bgColor to update the card background color */
      bgColor: "#E01709",
      /* Change textColor to update the card text color */
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/dashboard')
    },
    {
      label: "Crop Recommendation",
      /* Change bgColor to update the card background color */
      bgColor: "#E01709",
      /* Change textColor to update the card text color */
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/crop-recommendation')
    },
    {
      label: "Weed Detection",
      /* Change bgColor to update the card background color */
      bgColor: "#E01709",
      /* Change textColor to update the card text color */
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/weed-detection')
    }
  ];

  return (
    <CardNav
      items={items}
      /* Change baseColor to update the navbar background color for light/dark mode */
      baseColor={theme === 'dark' ? '#1a1a1a' : '#fff'}
      /* Change menuColor to update the hamburger menu color */
      menuColor="#E01709"
      ease="power3.out"
      rightSlot={
        <div className="nav-right-slot" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          {user ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-button"
                onClick={() => navigate('/account')}
                title="Go to Account"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {user.user_metadata?.avatar_url || user.avatar_url ? (
                  <img
                    src={user.user_metadata?.avatar_url || user.avatar_url}
                    alt="Avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E01709' }}
                  />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E01709', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="card-nav-cta-button"
              onClick={() => navigate('/sign-in')}
            >
              Sign In
            </button>
          )}
        </div>
      }
    />
  )
}