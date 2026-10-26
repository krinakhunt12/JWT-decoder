import ThreeBackground from "./home/ThreeBackground";
import HeroSection from "./home/HeroSection";
import TokenExplorerSection from "./home/TokenExplorerSection";
import FeatureGridSection from "./home/FeatureGridSection";
import WorkflowSection from "./home/WorkflowSection";
import ComparisonSection from "./home/ComparisonSection";
import FaqSection from "./home/FaqSection";
import CtaBannerSection from "./home/CtaBannerSection";

export default function Home({ loadSampleAndNavigate }) {
  return (
    <div className="relative w-full space-y-16 py-2 overflow-hidden">
      {/* Unique 3D Cryptographic Interactive Three.js Background Animation */}
      <ThreeBackground />

      {/* ─── 1. Hero Section ─── */}
      <HeroSection loadSampleAndNavigate={loadSampleAndNavigate} />

      {/* ─── 2. Interactive Segment Explorer ─── */}
      <TokenExplorerSection />

      {/* ─── 3. Feature Capabilities Showcase ─── */}
      <FeatureGridSection />

      {/* ─── 4. Four-Step Verification Workflow ─── */}
      <WorkflowSection />

      {/* ─── 5. Privacy & Cryptographic Comparison Table ─── */}
      <ComparisonSection />

      {/* ─── 6. Frequently Asked Questions ─── */}
      <FaqSection />

      {/* ─── 7. Final Call to Action ─── */}
      <CtaBannerSection />
    </div>
  );
}