import { ArrowRight, ExternalLink, Fish } from 'lucide-react';
import { Link } from 'react-router';

function Cloud1({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50C10 50 2 42 2 32C2 24 8 17 16 15C16 7 24 0 34 0C42 0 49 5 51 12C53 11 55 10 58 10C66 10 72 16 72 24C72 24 72 24 72 25C74 24 77 23 80 23C90 23 98 31 98 41C98 46 96 50 92 50H20Z" 
        fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
}

function Cloud2({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 35 50 C 20 50 15 42 15 33 C 15 24 23 18 32 18 C 36 9 45 4 56 4 C 68 4 77 11 81 20 C 84 19 88 18 92 18 C 103 18 111 26 111 36 C 111 44 105 50 96 50 L 35 50 Z" 
        fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
}

function Cloud3({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 25 48 C 12 48 5 40 5 32 C 5 24 15 17 26 17 C 30 10 39 6 49 6 C 58 6 66 10 70 16 C 73 14 77 13 82 13 C 94 13 103 21 103 31 C 103 40 95 48 84 48 L 25 48 Z" 
        fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="df-hero" id="hero">
      {/* Decorative clouds */}
      <Cloud1 className="df-cloud df-cloud-1" />
      <Cloud2 className="df-cloud df-cloud-2" />
      <Cloud3 className="df-cloud df-cloud-3" />
      <Cloud1 className="df-cloud df-cloud-4" />
      <Cloud2 className="df-cloud df-cloud-5" />
      <Cloud3 className="df-cloud df-cloud-6" />
      <Cloud1 className="df-cloud df-cloud-7" />

      <div className="df-hero-content">
        <div className="df-pill-badge">
          <Fish size={16} />
          <span>The Document Intelligence Layer for AI</span>
        </div>

        <h1>Your invoices are a mess.<br />Docfish reads them all.</h1>

        <p className="df-section-subtext">
          Docfish ingests any invoice PDF, extracts structured fields using AI, 
          validates the data, and serves everything through clean APIs and a 
          dashboard. Most tools break on messy docs. Docfish doesn't.
        </p>

        <div className="df-hero-buttons">
          <Link to="/auth" className="df-btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
          <a href="#api-docs" className="df-btn-secondary">
            View API Docs <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="df-hero-screenshot">
        <img 
          src="/images/invoice-list.png" 
          alt="Docfish dashboard showing invoice list and stats" 
          loading="eager"
        />
      </div>
    </section>
  );
}
