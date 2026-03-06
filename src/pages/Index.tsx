import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProcessFlow from "@/components/ProcessFlow";
import ComparisonTable from "@/components/ComparisonTable";
import Features from "@/components/Features";
import WaitlistSection from "@/components/WaitlistSection";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import Footer from "@/components/Footer";
import SerialTerminal from "@/components/SerialTerminal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ComingSoonBanner />
      <Navbar />
      <SerialTerminal />
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
