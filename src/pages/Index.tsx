import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BatchesSection } from "@/components/home/BatchesSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { WelcomePopup } from "@/components/home/WelcomePopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WelcomePopup />
      <main>
        <HeroSection />
        <BatchesSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
