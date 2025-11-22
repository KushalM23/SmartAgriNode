import CardNav from './CardNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import "./NavBar.css"

export default function NavBar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = [
    {
      label: "Dashboard",
      bgColor: "#E01709",
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/dashboard')
    },
    {
      label: "Crop Recommendation",
      bgColor: "#E01709",
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/crop-recommendation')
    },
    {
      label: "Weed Detection",
      bgColor: "#E01709",
      textColor: "#fff",
      links: [],
      onClick: () => navigate('/weed-detection')
    }
  ];

  return (
    <CardNav
      items={items}
      baseColor="#fff"
      menuColor="#E01709"
      ease="power3.out"
      rightSlot={
        <>
          {user ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-button"
                onClick={() => navigate('/account')}
                title="Go to Account"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : null}
                {user.user_metadata?.username || user.email.split('@')[0]}
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
        </>
      }
    />
  )
}