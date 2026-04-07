import { Calendar, ExternalLink, Fish } from 'lucide-react';

function Cloud({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50C10 50 2 42 2 32C2 24 8 17 16 15C16 7 24 0 34 0C42 0 49 5 51 12C53 11 55 10 58 10C66 10 72 16 72 24C72 24 72 24 72 25C74 24 77 23 80 23C90 23 98 31 98 41C98 46 96 50 92 50H20Z" 
        fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="df-hero" id="hero">
      {/* Decorative clouds */}
      <Cloud className="df-cloud df-cloud-1" />
      <Cloud className="df-cloud df-cloud-2" />
      <Cloud className="df-cloud df-cloud-3" />
      <Cloud className="df-cloud df-cloud-4" />
      <Cloud className="df-cloud df-cloud-5" />
      <Cloud className="df-cloud df-cloud-6" />
      <Cloud className="df-cloud df-cloud-7" />

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
          <a href="#demo" className="df-btn-primary">
            <Calendar size={16} />
            Book Demo
          </a>
          <a href="#api-docs" className="df-btn-secondary">
            View API Docs <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="df-hero-screenshot">
        <img 
          src="/images/docfish-dashboard.png" 
          alt="Docfish dashboard showing invoice upload and extracted fields" 
          loading="eager"
        />
      </div>
    </section>
  );
}
