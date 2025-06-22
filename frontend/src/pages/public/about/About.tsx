import { HeroSection } from "./HeroSection";
import { RationaleSection } from "./RationaleSection";
import { ObjectivesSection } from "./ObjectiveSection";
import { ScopeSection } from "./ScopeSection";
import { SignificanceSection } from "./SignificanceSection";
import { TeamSection } from "./TeamSection";
import { CallToAction } from "./CallToAction";



// Main About Page Component
const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 bg-gradient-to-b from-blue-50/20 to-teal-50/20">
      <HeroSection />
      <RationaleSection />
      <ObjectivesSection />
      <ScopeSection />
      <SignificanceSection />
      <TeamSection />
      <CallToAction />
    </div>
  );
};

export default About;