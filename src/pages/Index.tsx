import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProcessFlow from "@/components/ProcessFlow";
import ComparisonTable from "@/components/ComparisonTable";
import Features from "@/components/Features";
import WaitlistSection from "@/components/WaitlistSection";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ComingSoonBanner />
      <Navbar />
      <Hero />
      <ProcessFlow />
      <Features />
      <ComparisonTable />
      <WaitlistSection />
      <Footer />
    </div>
  );
};

export default Index;
