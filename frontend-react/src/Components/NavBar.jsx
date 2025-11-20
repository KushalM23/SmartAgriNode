import CardNav from './CardNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import "./NavBar.css"

export default function NavBar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [hoverLogout, setHoverLogout] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
          <SignedIn>
            <div className="user-menu">
              <button
                type="button"
                className={`user-button ${hoverLogout ? 'danger' : ''}`}
                onClick={handleLogout}
                onMouseEnter={() => setHoverLogout(true)}
                onMouseLeave={() => setHoverLogout(false)}
                title={hoverLogout ? 'Click to logout' : `Logged in as ${user?.username || user?.firstName || 'User'}`}
              >
                {hoverLogout ? 'Logout' : (user?.username || user?.firstName || 'User')}
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <button
              type="button"
              className="card-nav-cta-button"
              onClick={() => navigate('/sign-in')}
            >
              Sign In
            </button>
          </SignedOut>
        </>
      }
    />
  )
}