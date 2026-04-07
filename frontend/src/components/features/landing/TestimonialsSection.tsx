export function TestimonialsSection() {
  const testimonials = [
    {
      company: 'FinanceOps Co.',
      quote: 'We used to spend 3 hours a day manually entering invoice data. Docfish brought that down to minutes.',
      name: 'Sarah K.',
      role: 'Head of Finance',
      initial: 'S',
      stats: ['+85% Time saved', '+99% Field accuracy'],
    },
    {
      company: 'ProcureBase',
      quote: 'The validation layer alone saved us from two costly accounting errors in the first week.',
      name: 'Raj M.',
      role: 'CTO',
      initial: 'R',
      stats: ['+92% Extraction confidence', '−70% Manual corrections'],
    },
    {
      company: 'InvoiceFlow',
      quote: "The API is dead simple. We had it integrated into our ERP in under a day.",
      name: 'Priya L.',
      role: 'Senior Engineer',
      initial: 'P',
      stats: ['+40% Pipeline throughput', '4hrs → Integration time'],
    },
  ];

  return (
    <section className="df-testimonials" id="customers">
      <div className="df-testimonials-header">
        <div className="df-pill-badge">
          <span className="sparkle">✦</span>
          <span>Docfish Works</span>
        </div>
        <h2 className="df-section-heading" style={{ marginTop: 24 }}>
          The new way to process invoices.
        </h2>
      </div>

      <div className="df-testimonials-grid">
        {testimonials.map((t, i) => (
          <div className="df-testimonial-card" key={i}>
            <div className="df-testimonial-logo">{t.company}</div>
            <p className="df-testimonial-quote">"{t.quote}"</p>
            
            <div className="df-testimonial-author">
              <div className="df-testimonial-avatar">{t.initial}</div>
              <div>
                <div className="df-testimonial-name">{t.name}</div>
                <div className="df-testimonial-role">{t.role}</div>
              </div>
            </div>

            <div className="df-testimonial-stats">
              {t.stats.map((stat, j) => (
                <span className="df-testimonial-stat" key={j}>{stat}</span>
              ))}
            </div>

            <a href="#" className="df-testimonial-link">Read Case Study →</a>
          </div>
        ))}
      </div>

      <div className="df-testimonials-cta">
        <a href="#demo" className="df-btn-primary">Get Free Walkthrough</a>
      </div>
    </section>
  );
}
