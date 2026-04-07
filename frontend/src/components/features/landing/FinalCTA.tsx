import { Calendar } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="df-final-cta" id="demo">
      {/* Geometric decorations */}
      <div className="df-geo-shape diamond-1" />
      <div className="df-geo-shape diamond-2" />
      <div className="df-geo-shape diamond-3" />
      <div className="df-geo-shape circle-1" />

      <div className="df-final-cta-content">
        <h2>Schedule your demo today.</h2>
        <p>See what Docfish can do for your invoice pipeline.</p>
        <a href="#demo" className="df-btn-primary">
          <Calendar size={16} />
          Book Demo
        </a>
      </div>
    </section>
  );
}
