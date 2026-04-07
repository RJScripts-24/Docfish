import { ArrowRight, ExternalLink, Fish } from 'lucide-react';
import { Link } from 'react-router';

/* ── 1. Folded Page — classic document with dog-ear corner ─────── */
function FoldedPage({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6C8 3 10 1 13 1H55L82 28V104C82 107 80 109 77 109H13C10 109 8 107 8 104V6Z"
        fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      <path d="M55 1V24C55 27 57 28 60 28H82" stroke="#d0d5dd" strokeWidth="1.5" fill="white"/>
      <line x1="20" y1="44" x2="68" y2="44" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="54" x2="56" y2="54" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="64" x2="62" y2="64" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="74" x2="48" y2="74" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="84" x2="58" y2="84" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── 2. Spreadsheet — grid document with columns ───────────────── */
function Spreadsheet({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="84" height="104" rx="5" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      {/* Header row */}
      <rect x="3" y="3" width="84" height="18" rx="5" fill="#f2f4f7"/>
      <rect x="3" y="16" width="84" height="5" fill="#f2f4f7"/>
      {/* Grid lines */}
      <line x1="32" y1="21" x2="32" y2="100" stroke="#e4e7ec" strokeWidth="1"/>
      <line x1="60" y1="21" x2="60" y2="100" stroke="#e4e7ec" strokeWidth="1"/>
      <line x1="8" y1="38" x2="82" y2="38" stroke="#e4e7ec" strokeWidth="1"/>
      <line x1="8" y1="54" x2="82" y2="54" stroke="#e4e7ec" strokeWidth="1"/>
      <line x1="8" y1="70" x2="82" y2="70" stroke="#e4e7ec" strokeWidth="1"/>
      <line x1="8" y1="86" x2="82" y2="86" stroke="#e4e7ec" strokeWidth="1"/>
      {/* Cell content hints */}
      <line x1="10" y1="30" x2="26" y2="30" stroke="#d0d5dd" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="30" x2="54" y2="30" stroke="#d0d5dd" strokeWidth="2" strokeLinecap="round"/>
      <line x1="66" y1="30" x2="78" y2="30" stroke="#d0d5dd" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="46" x2="24" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="46" x2="52" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="66" y1="46" x2="76" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── 3. Invoice — receipt style with total bar ─────────────────── */
function Invoice({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 80 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="74" height="104" rx="4" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      {/* Logo placeholder */}
      <circle cx="20" cy="18" r="8" fill="#f2f4f7"/>
      <line x1="34" y1="14" x2="60" y2="14" stroke="#d0d5dd" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="34" y1="22" x2="52" y2="22" stroke="#e4e7ec" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Divider */}
      <line x1="12" y1="34" x2="68" y2="34" stroke="#e9ecef" strokeWidth="1"/>
      {/* Line items */}
      <line x1="12" y1="46" x2="44" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="56" y1="46" x2="68" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="56" x2="40" y2="56" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="56" y1="56" x2="68" y2="56" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="66" x2="48" y2="66" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="56" y1="66" x2="68" y2="66" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      {/* Total bar */}
      <line x1="12" y1="80" x2="68" y2="80" stroke="#d0d5dd" strokeWidth="1"/>
      <rect x="42" y="86" width="26" height="10" rx="3" fill="#f2f4f7"/>
    </svg>
  );
}

/* ── 4. Clipboard — document on a clipboard ────────────────────── */
function Clipboard({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 80 106" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clip */}
      <rect x="26" y="0" width="28" height="14" rx="4" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      <circle cx="40" cy="7" r="3" fill="#e9ecef"/>
      {/* Board */}
      <rect x="4" y="8" width="72" height="96" rx="5" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      {/* Checklist */}
      <rect x="14" y="28" width="8" height="8" rx="2" stroke="#e4e7ec" strokeWidth="1.5" fill="none"/>
      <line x1="28" y1="32" x2="56" y2="32" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <rect x="14" y="44" width="8" height="8" rx="2" stroke="#e4e7ec" strokeWidth="1.5" fill="none"/>
      <line x1="28" y1="48" x2="52" y2="48" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <rect x="14" y="60" width="8" height="8" rx="2" stroke="#e4e7ec" strokeWidth="1.5" fill="none"/>
      <line x1="28" y1="64" x2="48" y2="64" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      {/* Bottom bar */}
      <rect x="14" y="80" width="52" height="10" rx="3" fill="#f2f4f7"/>
    </svg>
  );
}

/* ── 5. Stacked Pages — multiple documents fanned ──────────────── */
function StackedPages({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back page */}
      <rect x="10" y="10" width="60" height="80" rx="4" fill="white" stroke="#e4e7ec" strokeWidth="1"/>
      {/* Middle page */}
      <rect x="5" y="5" width="60" height="80" rx="4" fill="white" stroke="#e4e7ec" strokeWidth="1.2"/>
      {/* Front page */}
      <rect x="0" y="0" width="60" height="80" rx="4" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      <line x1="10" y1="16" x2="46" y2="16" stroke="#e4e7ec" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="10" y1="26" x2="40" y2="26" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="36" x2="44" y2="36" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="46" x2="36" y2="46" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="56" x2="42" y2="56" stroke="#e4e7ec" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── 6. Form Document — with input fields ──────────────────────── */
function FormDoc({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="84" height="104" rx="5" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      {/* Title */}
      <line x1="22" y1="16" x2="68" y2="16" stroke="#d0d5dd" strokeWidth="3" strokeLinecap="round"/>
      {/* Field 1 */}
      <line x1="14" y1="34" x2="36" y2="34" stroke="#e4e7ec" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="14" y="38" width="62" height="12" rx="3" stroke="#e4e7ec" strokeWidth="1" fill="none"/>
      {/* Field 2 */}
      <line x1="14" y1="60" x2="40" y2="60" stroke="#e4e7ec" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="14" y="64" width="62" height="12" rx="3" stroke="#e4e7ec" strokeWidth="1" fill="none"/>
      {/* Button */}
      <rect x="44" y="86" width="32" height="12" rx="4" fill="#f2f4f7"/>
    </svg>
  );
}

/* ── 7. Chart Document — with a tiny bar chart ─────────────────── */
function ChartDoc({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="66" height="86" rx="4" fill="white" stroke="#d0d5dd" strokeWidth="1.5"/>
      {/* Title */}
      <line x1="12" y1="14" x2="44" y2="14" stroke="#d0d5dd" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="36" y2="22" stroke="#e4e7ec" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Mini bar chart */}
      <rect x="12" y="50" width="8" height="24" rx="2" fill="#f2f4f7"/>
      <rect x="24" y="40" width="8" height="34" rx="2" fill="#eef0f4"/>
      <rect x="36" y="46" width="8" height="28" rx="2" fill="#f2f4f7"/>
      <rect x="48" y="36" width="8" height="38" rx="2" fill="#eef0f4"/>
      {/* Baseline */}
      <line x1="10" y1="74" x2="58" y2="74" stroke="#e4e7ec" strokeWidth="1"/>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="df-hero" id="hero">
      {/* Floating document elements — exact same positions as original clouds */}
      <FoldedPage   className="df-hero-float df-float-1" />
      <StackedPages className="df-hero-float df-float-2" />
      <Invoice      className="df-hero-float df-float-3" />
      <Spreadsheet  className="df-hero-float df-float-4" />
      <ChartDoc     className="df-hero-float df-float-5" />
      <Clipboard    className="df-hero-float df-float-6" />
      <FormDoc      className="df-hero-float df-float-7" />

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
