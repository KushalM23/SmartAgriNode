import CardNav from './CardNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import "./NavBar.css"

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverLogout, setHoverLogout] = useState(false);
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
      buttonBgColor="#E01709"
      buttonTextColor="#fff"
      ease="power3.out"
      rightSlot={
        user ? (
          <div className="user-menu">
            <button
              type="button"
              className={`user-button ${hoverLogout ? 'danger' : ''}`}
              onClick={onLogout}
              onMouseEnter={() => setHoverLogout(true)}
              onMouseLeave={() => setHoverLogout(false)}
              title={hoverLogout ? 'Click to logout' : `Logged in as ${user.username}`}
            >
              {hoverLogout ? 'Logout' : user.username}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="card-nav-cta-button"
            onClick={() => navigate('/auth')}
          >
            Account
          </button>
        )
      }
    />
  )
}