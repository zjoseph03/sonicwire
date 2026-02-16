import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ComparisonTable from "@/components/ComparisonTable";
import Testimonial from "@/components/Testimonial";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ComparisonTable />
      <Testimonial />
      <Features />
      <CTASection />
    </div>
  );
};

export default Index;
