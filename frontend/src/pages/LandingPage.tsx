import { LandingNavbar } from '../components/features/landing/Navbar';
import { HeroSection } from '../components/features/landing/HeroSection';
import { ProblemSection } from '../components/features/landing/ProblemSection';
import { FeatureSection } from '../components/features/landing/FeatureSection';
import { FinalCTA } from '../components/features/landing/FinalCTA';
import { Footer } from '../components/features/landing/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      
      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 3+4 — Problem + Solution */}
      <ProblemSection />

      {/* Section 5 — Extraction Engine */}
      <FeatureSection
        id="extraction-engine"
        badge="Extraction Engine"
        heading="AI extraction that builds itself smarter"
        subtext="Stop manually coding field parsers. Every invoice Docfish processes trains the system to handle the next layout — so accuracy compounds over time, not your tech debt."
        rows={[
          {
            image: '/images/extraction-upload.png',
            imageAlt: 'PDF upload and extracted JSON fields',
            heading: 'Upload once, extract always',
            body: 'Drag-and-drop single or bulk PDFs. Docfish queues, parses, and returns structured JSON in seconds — even for rotated or inconsistent layouts.',
          },
          {
            image: '/images/prompt-versioning.png',
            imageAlt: 'Prompt versioning panel with diff view',
            heading: 'Prompt versioning baked in',
            body: 'Test and deploy different LLM prompt versions without rewriting your pipeline. Compare extraction accuracy across prompt iterations and roll back instantly.',
            reverse: true,
          },
          {
            image: '/images/validation-report.png',
            imageAlt: 'Validation report with confidence scores',
            heading: 'Catch every bad extraction',
            body: "Automatic validation flags when line item sums don't match totals, fields are missing, or dates are in the wrong format. Every result comes with a confidence score.",
          },
        ]}
      />

      {/* Section 6 — Review Dashboard */}
      <FeatureSection
        id="review-dashboard"
        badge="Review Dashboard"
        heading="No more tribal knowledge in spreadsheets"
        subtext="Stop letting invoice corrections live in someone's email thread. Every extracted field is reviewable, editable, and auditable from one place."
        bgClass="lavender-bg"
        rows={[
          {
            image: '/images/invoice-list.png',
            imageAlt: 'Invoice list view with status and confidence',
            heading: 'Full invoice history at a glance',
            body: 'See every processed invoice, its extraction status, confidence score, and validation errors — filterable by vendor, date, or status.',
          },
          {
            image: '/images/invoice-detail.png',
            imageAlt: 'Invoice detail with editable fields',
            heading: 'Correct and reprocess in one click',
            body: 'Spot a wrong field? Edit it inline, submit a correction, or trigger a full reprocess — all without touching code.',
            reverse: true,
          },
        ]}
      />

      {/* Section 7 — REST APIs & Monitoring */}
      <FeatureSection
        id="rest-api"
        badge="REST APIs & Monitoring"
        heading="Plug Docfish into anything you build"
        subtext="Deploy complex extraction pipelines that don't just parse — they validate, score, and expose data through clean APIs across any integration point."
        rows={[
          {
            image: '/images/api-endpoints.png',
            imageAlt: 'REST API endpoints documentation',
            heading: 'Four endpoints. Full control.',
            body: 'Upload, list, retrieve, and reprocess invoices through a clean REST API. Integrate Docfish into your ERP, accounting software, or data pipeline in minutes.',
          },
          {
            image: '/images/monitoring-dashboard.png',
            imageAlt: 'Monitoring metrics dashboard',
            heading: "Know your pipeline's health in real time",
            body: 'Track processing time, extraction success rates, confidence score distributions, and error trends — all from a live metrics dashboard.',
            reverse: true,
          },
        ]}
      />

      {/* Section 11 — Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
