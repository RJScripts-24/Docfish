interface FeatureRow {
  image: string;
  imageAlt: string;
  heading: string;
  body: string;
  reverse?: boolean;
}

interface FeatureSectionProps {
  id: string;
  badge: string;
  heading: string;
  subtext: string;
  rows: FeatureRow[];
  bgClass?: string;
}

export function FeatureSection({ id, badge, heading, subtext, rows, bgClass = '' }: FeatureSectionProps) {
  return (
    <section className={`df-feature-section ${bgClass}`} id={id}>
      <div className="df-feature-header">
        <div className="df-pill-badge">
          <span className="sparkle">✦</span>
          <span>{badge}</span>
        </div>
        <h2 className="df-section-heading">{heading}</h2>
        <p className="df-section-subtext">{subtext}</p>
      </div>

      <div className="df-feature-rows">
        {rows.map((row, i) => (
          <div className={`df-feature-row ${row.reverse ? 'reverse' : ''}`} key={i}>
            <div className="df-feature-img">
              <img src={row.image} alt={row.imageAlt} loading="lazy" />
            </div>
            <div className="df-feature-copy">
              <h3>{row.heading}</h3>
              <p>{row.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
