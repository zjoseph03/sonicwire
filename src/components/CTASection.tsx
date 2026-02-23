import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section id="cta" className="py-24 hero-bg hero-grid relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Send us your design files and get your harnesses in as little as [X] days.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            *Express orders dependent on part availability
          </p>

          <a
            href="/quote-request"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-none font-bold text-lg hover:opacity-90 transition-all btn-shadow mb-6"
          >
            Get Instant Quote
            <ArrowRight className="w-5 h-5" />
          </a>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm">Want to email us instead?</span>
            <a href="mailto:zachjoseph@hotmail.com" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              <Mail className="w-4 h-4" />
              outreach@sonicwire.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
