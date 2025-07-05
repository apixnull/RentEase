import { HeroSection } from "./sections/HeroSection";
import { RationaleSection } from "./sections/RationaleSection";
import { ObjectivesSection } from "./sections/ObjectiveSection";
import { ScopeSection } from "./sections/ScopeSection";
import { SignificanceSection } from "./sections/SignificanceSection";
import { TeamSection } from "./sections/TeamSection";
import { CallToAction } from "./sections/CallToAction";



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