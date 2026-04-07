import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function FinalCTA() {
  return (
    <section className="df-final-cta" id="demo">
      {/* Geometric decorations */}
      <div className="df-geo-shape diamond-1" />
      <div className="df-geo-shape diamond-2" />
      <div className="df-geo-shape diamond-3" />
      <div className="df-geo-shape circle-1" />

      <div className="df-final-cta-content">
        <h2>Start extracting today.</h2>
        <p>Docfish is ready to handle your invoice pipeline.</p>
        <Link to="/auth" className="df-btn-primary">
          Get Started
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
