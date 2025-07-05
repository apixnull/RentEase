import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FAQSection";
import FeaturesSection from "./sections/FeaturesSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import TestimonialsSection from "./sections/TestimonialsSection";

const Landing = () => {
return (
    <div className="bg-gray-50 overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <FAQSection />
    </div>
  );
}

export default Landing