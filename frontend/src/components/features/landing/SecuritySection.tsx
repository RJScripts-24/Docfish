import { Lock } from 'lucide-react';

export function SecuritySection() {
  const badges = [
    { icon: '🔒', label: 'SOC 2 Type II Ready' },
    { icon: '🛡️', label: 'GDPR Compliant' },
    { icon: '🗄️', label: 'US/EU/IN Data Residency' },
    { icon: '👤', label: 'Role-Based Access Control' },
    { icon: '🔐', label: 'End-to-End Encryption' },
    { icon: '🔍', label: 'Regular Security Audits' },
  ];

  return (
    <section className="df-security" id="security">
      <div className="df-security-header">
        <div className="df-pill-badge">
          <span className="sparkle">✦</span>
          <span>Secure and Stable</span>
        </div>
        <h3>Enterprise-Grade Security Built to Scale</h3>
        <p>
          We ensure data security and compliance — 
          your invoice data never leaves your control.
        </p>
        <a href="#" className="df-security-link">
          <Lock size={14} />
          Visit Our Trust Center →
        </a>
      </div>

      <div className="df-security-grid">
        {badges.map((badge, i) => (
          <div className="df-security-tile" key={i}>
            <span className="icon">{badge.icon}</span>
            <span className="label">{badge.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
