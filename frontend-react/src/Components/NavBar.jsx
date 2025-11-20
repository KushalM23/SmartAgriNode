import CardNav from './CardNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';

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
            <div className="relative">
              <button
                type="button"
                className={`bg-white border border-[#eee] px-3 py-2 rounded-lg cursor-pointer text-[#E01709] font-semibold transition-all duration-200 min-w-[80px] text-center h-[38px] text-sm flex items-center justify-center tracking-tighter ${hoverLogout ? '!bg-[#E01709] !text-white !border-[#E01709]' : ''}`}
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
              className="bg-white border border-[#eee] px-3 py-2 rounded-lg cursor-pointer text-[#E01709] font-semibold transition-all duration-200 min-w-[80px] text-center hover:bg-[#fef2f2]"
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