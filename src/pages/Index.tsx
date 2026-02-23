import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProcessFlow from "@/components/ProcessFlow";
import ComparisonTable from "@/components/ComparisonTable";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProcessFlow />
      <Features />
      <ComparisonTable />
      <CTASection />
    </div>
  );
};

export default Index;
