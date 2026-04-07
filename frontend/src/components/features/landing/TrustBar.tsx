export function TrustBar() {
  const logos = [
    'Stripe', 'QuickBooks', 'Xero', 'Notion', 'SAP',
    'Oracle', 'Zoho', 'Freshbooks', 'Stripe', 'QuickBooks',
    'Xero', 'Notion', 'SAP', 'Oracle', 'Zoho', 'Freshbooks'
  ];

  return (
    <section className="df-trust" id="trust">
      <p className="df-trust-heading">Trusted by finance and ops teams at</p>
      <div className="df-marquee">
        <div className="df-marquee-track">
          {logos.map((name, i) => (
            <span key={i}>{name}</span>
          ))}
        </div>
        <div className="df-marquee-track" aria-hidden="true">
          {logos.map((name, i) => (
            <span key={`dup-${i}`}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
