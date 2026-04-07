import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, Menu, X, Fish, ArrowRight } from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`df-navbar ${scrolled ? 'scrolled' : ''}`} id="landing-navbar">
        <a href="#" className="df-nav-logo">
          <Fish size={26} strokeWidth={2.5} />
          <span>Docfish</span>
        </a>

        <ul className="df-nav-links">
          <li><a href="#why">Why Docfish</a></li>
          <li><a href="#product">Product ▾</a></li>
          <li><a href="#customers">Customers</a></li>
          <li><a href="#resources">Resources ▾</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>

        <div className="df-nav-right">
          <Link to="/auth" className="df-nav-signin">Sign in</Link>
          <Link to="/auth" className="df-btn-primary df-nav-cta">
            Get Started
            <ArrowRight size={14} />
          </Link>
        </div>

        <button
          className="df-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      <div className={`df-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <button
          className="df-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
        <a href="#why" onClick={() => setMobileOpen(false)}>Why Docfish</a>
        <a href="#product" onClick={() => setMobileOpen(false)}>Product</a>
        <a href="#customers" onClick={() => setMobileOpen(false)}>Customers</a>
        <a href="#resources" onClick={() => setMobileOpen(false)}>Resources</a>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
        <Link to="/auth" onClick={() => setMobileOpen(false)} className="df-btn-primary" style={{ marginTop: 16, textAlign: 'center', justifyContent: 'center' }}>
          Get Started
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
