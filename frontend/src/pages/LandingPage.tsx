import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/features/landing/Hero';
import { Problem } from '../components/features/landing/Problem';
import { Solution } from '../components/features/landing/Solution';
import { Features } from '../components/features/landing/Features';
import { HowItWorks } from '../components/features/landing/HowItWorks';
import { CTA } from '../components/features/landing/CTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}
