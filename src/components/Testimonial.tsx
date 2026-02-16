import { motion } from "framer-motion";

const Testimonial = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border p-10 shadow-sm text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-sm font-semibold text-foreground">Roundabout Technologies</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">AI-Powered Traffic Lights</span>
            </div>

            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
              "Loombotic really helped us out. 7 day lead times are a real unlock for us. Really easy to work with and great support even on low volume orders."
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                CB
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Collin Barnwell</p>
                <p className="text-sm text-muted-foreground">CEO, Roundabout Technologies</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonial;
