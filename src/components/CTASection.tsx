import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  const handleQuoteClick = () => {
    // Track in Clarity
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', 'quote_button_cta');
    }
    // Track in GA4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quote_button_click', {
        button_location: 'cta'
      });
    }
  };

  return (
    <section id="cta" className="py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="technical-grid absolute inset-0 opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <span className="pulse-dot" />
            <span className="text-sm font-mono font-medium text-primary uppercase tracking-wider">Ready to Deploy</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Start Your Production Run
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Upload your schematics, receive instant timeline estimates, and get production-ready 
            wire harnesses delivered to your facility in 7-14 days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="/quote-request"
              onClick={handleQuoteClick}
              className="btn-primary inline-flex items-center gap-3 text-lg group"
            >
              <span>Get Instant Quote</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="mailto:outreach@sonicwire.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
              <Mail className="w-5 h-5" />
              <span>outreach@sonicwire.com</span>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
            Typically responds in under 2 hours during business hours
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
