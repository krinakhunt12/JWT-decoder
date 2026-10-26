import ThreeBackground from "./home/ThreeBackground";
import HeroSection from "./home/HeroSection";
import TokenExplorerSection from "./home/TokenExplorerSection";
import AlgorithmMatrixSection from "./home/AlgorithmMatrixSection";
import FeatureGridSection from "./home/FeatureGridSection";
import VulnerabilityShowcaseSection from "./home/VulnerabilityShowcaseSection";
import ClaimsGlossarySection from "./home/ClaimsGlossarySection";
import WorkflowSection from "./home/WorkflowSection";
import CodeSnippetsSection from "./home/CodeSnippetsSection";
import ComparisonSection from "./home/ComparisonSection";
import FaqSection from "./home/FaqSection";
import CtaBannerSection from "./home/CtaBannerSection";

export default function Home({ loadSampleAndNavigate }) {
  return (
    <div className="relative w-full space-y-20 py-2 overflow-hidden">
      {/* Ambient Light-Purple Three.js 3D Background */}
      <ThreeBackground />

      {/* ─── 1. Hero Showcase ─── */}
      <HeroSection loadSampleAndNavigate={loadSampleAndNavigate} />

      {/* ─── 2. Interactive JWT Segment Explorer ─── */}
      <TokenExplorerSection />

      {/* ─── 3. Algorithm Cryptographic Matrix ─── */}
      <AlgorithmMatrixSection />

      {/* ─── 4. Core Security Capabilities Grid ─── */}
      <FeatureGridSection />

      {/* ─── 5. Top 5 Vulnerability Countermeasures ─── */}
      <VulnerabilityShowcaseSection />

      {/* ─── 6. RFC 7519 Registered Claims Dictionary ─── */}
      <ClaimsGlossarySection />

      {/* ─── 7. Four-Step Verification Pipeline ─── */}
      <WorkflowSection />

      {/* ─── 8. Developer Integration Code Boilerplate ─── */}
      <CodeSnippetsSection />

      {/* ─── 9. Platform Security Comparison Table ─── */}
      <ComparisonSection />

      {/* ─── 10. Technical FAQ Accordion ─── */}
      <FaqSection />

      {/* ─── 11. Launch CTA Banner ─── */}
      <CtaBannerSection />
    </div>
  );
}