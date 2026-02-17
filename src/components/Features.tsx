import { Zap, Layers, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Rapid Production",
    description: "[Description of your rapid production capabilities and benefits]",
  },
  {
    icon: Layers,
    title: "Volume Flexibility",
    description: "[Description of your volume flexibility and range]",
  },
  {
    icon: ShieldCheck,
    title: "Certified Quality",
    description: "[Description of your quality certifications and standards]",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Traditional Harness Manufacturing is Broken.
          </h2>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground mb-4">
            <span>Long quote times. <strong className="text-foreground">Longer lead times.</strong></span>
            <span>Rigid manufacturing. <strong className="text-foreground">Unresponsive suppliers.</strong></span>
          </div>
          <p className="text-primary font-semibold text-lg">We're building the solution.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-8 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
