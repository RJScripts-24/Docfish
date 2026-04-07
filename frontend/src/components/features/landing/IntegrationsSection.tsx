export function IntegrationsSection() {
  const integrations = [
    { icon: '📗', label: 'QuickBooks' },
    { icon: '📘', label: 'Xero' },
    { icon: '⚙️', label: 'SAP' },
    { icon: '🏢', label: 'Oracle' },
    { icon: '📕', label: 'Zoho Books' },
    { icon: '📒', label: 'Freshbooks' },
    { icon: '📂', label: 'Google Drive' },
    { icon: '📦', label: 'Dropbox' },
    { icon: '☁️', label: 'S3' },
    { icon: '⚡', label: 'Zapier' },
    { icon: '💬', label: 'Slack' },
    { icon: '🔔', label: 'Webhook' },
  ];

  return (
    <section className="df-integrations" id="integrations">
      <div className="df-integrations-header">
        <div className="df-pill-badge dark">
          <span className="sparkle">✦</span>
          <span>Easy Integration</span>
        </div>
        <h3>Connect Docfish to Any Tool You Use</h3>
        <p>
          Plug into your existing stack. Works with every major accounting, 
          ERP, storage, and workflow platform.
        </p>
        <a href="#" className="df-integrations-link">See All Integrations →</a>
      </div>

      <div className="df-integrations-grid">
        {integrations.map((item, i) => (
          <div className="df-integration-tile" key={i}>
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
