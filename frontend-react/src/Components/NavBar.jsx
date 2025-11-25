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
                    crossOrigin="anonymous"
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