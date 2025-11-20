import { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useNavigate, useLocation } from 'react-router-dom';

const CardNav = ({
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor,
  rightSlot
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsExpanded(false);
    setIsHamburgerOpen(false);
  }, [location.pathname]);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content');
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 12;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 200;
  };

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  }, [ease, items]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items, createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, createTimeline]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const handleItemClick = (item) => {
    // Always close the menu when an item is clicked
    if (isExpanded) {
      setIsHamburgerOpen(false);
      const tl = tlRef.current;
      if (tl) {
        tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
        tl.reverse();
      }
    }
    // Execute the item's onClick function
    if (item.onClick) {
      item.onClick();
    }
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] box-border md:top-[1.2em] ${className}`}>
      <nav
        ref={navRef}
        className={`block h-[60px] p-0 bg-white rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative overflow-hidden will-change-[height] ${isExpanded ? 'open' : ''}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-between py-[0.35rem] px-[0.45rem] pl-[1.1rem] z-[2] md:px-4 md:justify-between">
          <div
            className={`h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] md:order-2 group ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className={`w-[30px] h-[2px] bg-current transition-all duration-250 ease-out origin-center group-hover:opacity-75 ${isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''}`} />
            <div className={`w-[30px] h-[2px] bg-current transition-all duration-250 ease-out origin-center group-hover:opacity-75 ${isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''}`} />
          </div>

          <div className="flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:order-1" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <h1 className="m-0 text-[#E01709]">SmartAgriNode</h1>
          </div>

          {rightSlot ? (
            rightSlot
          ) : (
            <button
              type="button"
              className="bg-white text-[#E01709] border border-[#eee] rounded-lg px-3 py-2 h-[38px] font-semibold cursor-pointer text-sm flex items-center justify-center tracking-tighter transition-all duration-200 min-w-[80px] text-center md:hidden"
              onClick={() => navigate('/signup')}
            >
              Account
            </button>
          )}
        </div>

        <div className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 flex items-start gap-2 invisible pointer-events-none z-[1] card-nav-content md:flex-col md:items-stretch md:bottom-0 md:justify-start ${isExpanded ? '!visible !pointer-events-auto' : ''}`} aria-hidden={!isExpanded}>
          {items.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="h-[100px] flex-1 min-w-0 rounded-lg relative flex items-center justify-center px-4 py-2 select-none cursor-pointer bg-[#f5f5f5] transition-colors duration-200 m-[10px] hover:bg-[#eeeeee] md:h-auto md:min-h-[60px] md:flex-auto md:max-h-none"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
              onClick={() => handleItemClick(item)}
            >
              <div className="font-medium text-base tracking-tighter text-center text-[#f5f5f5] md:text-lg">{item.label}</div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;