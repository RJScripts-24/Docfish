export function ProblemSection() {
  const floatingIcons = [
    '📁', '📧', '📊', '💾', '📋', '📄', '🔗', '☁️'
  ];

  return (
    <section className="df-problem" id="problem">
      {/* Floating icon tiles */}
      {floatingIcons.map((icon, i) => (
        <div className="df-floating-icon" key={i}>
          {icon}
        </div>
      ))}

      <div className="df-problem-content">
        <div className="df-pill-badge">
          <span className="sparkle">✦</span>
          <span>The Problem</span>
        </div>

        <h2 className="df-section-heading" style={{ marginTop: 24 }}>
          Invoice chaos is slowing down your finance team and breaking your AI pipelines.
        </h2>
      </div>

      {/* White card that transitions into solution */}
      <div className="df-problem-card" id="solution">
        <SolutionContent />
      </div>
    </section>
  );
}

function SolutionContent() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="df-pill-badge">
        <span className="sparkle">✦</span>
        <span>The Solution</span>
      </div>

      <h2 className="df-section-heading" style={{ marginTop: 24, marginBottom: 16 }}>
        Docfish aligns AI with your invoices
      </h2>

      <p className="df-section-subtext" style={{ marginBottom: 48 }}>
        Turn scattered PDFs, varying layouts, and missing fields into a 
        continuously validated structured data layer — personalized per vendor 
        and delivered across every channel.
      </p>

      <div className="df-solution-cards">
        {/* Card 1 — Lavender */}
        <div className="df-solution-card lavender">
          <div className="df-solution-card-illustration">
            {['📄', '🎬', '⟨/⟩', '🗄️', '💬', '🖼️'].map((icon, i) => (
              <div className="df-icon-tile" key={i}>{icon}</div>
            ))}
          </div>
          <h3>Ingest Anything</h3>
          <p>
            PDFs, scanned images, rotated tables, multi-layout invoices. 
            If it contains invoice data, Docfish parses it.
          </p>
        </div>

        {/* Card 2 — Yellow */}
        <div className="df-solution-card yellow">
          <div className="df-solution-card-illustration" style={{ flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="df-tag-badge">Vendor Type</div>
              <div className="df-tag-badge dark">Enterprise</div>
              <div className="df-tag-badge dark">SMB</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="df-tag-badge">Currency</div>
              <div className="df-tag-badge dark">USD</div>
              <div className="df-tag-badge dark">INR</div>
              <div className="df-tag-badge dark">EUR</div>
            </div>
          </div>
          <h3>Validate & Normalize</h3>
          <p>
            Cross-check line item totals, normalize dates, detect missing 
            fields, and score every extraction with a confidence rating.
          </p>
        </div>

        {/* Card 3 — Mint */}
        <div className="df-solution-card mint">
          <div className="df-solution-card-illustration" style={{ gap: 12 }}>
            {[
              { icon: '🔗', label: 'REST API' },
              { icon: '📊', label: 'Dashboard' },
              { icon: '🔔', label: 'Webhook' },
              { icon: '{ }', label: 'JSON' },
            ].map((item, i) => (
              <div className="df-tag-badge" key={i}>
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <h3>Distribute Everywhere</h3>
          <p>
            Serve extracted data through REST APIs, a live dashboard, 
            webhooks, or direct database queries. One source of truth.
          </p>
        </div>
      </div>
    </div>
  );
}
