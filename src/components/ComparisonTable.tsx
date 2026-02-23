import { motion } from "framer-motion";
import { Clock, Zap, Package, Shield, Check, X } from "lucide-react";

const specs = [
  { icon: Zap, label: "Quote Response", value: "< 2 Hours" },
  { icon: Clock, label: "Production Time", value: "7-14 Days" },
  { icon: Package, label: "Min Order Qty", value: "1 Unit" },
  { icon: Shield, label: "Quality Standard", value: "IPC/WHMA-A-620" },
];

const comparison = [
  { feature: "Instant Online Quotes", sonicwire: true, traditional: false },
  { feature: "No Minimum Order Quantity", sonicwire: true, traditional: false },
  { feature: "7-14 Day Lead Times", sonicwire: true, traditional: false },
  { feature: "24/7 Order Tracking", sonicwire: true, traditional: false },
  { feature: "Transparent Pricing", sonicwire: true, traditional: false },
];

const ComparisonTable = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Built for Modern Manufacturing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Engineered for speed, precision, and scalability from prototype to production.
          </p>
        </motion.div>

        {/* Key Specs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {specs.map((spec, index) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="metric-card p-6 rounded-lg text-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <spec.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {spec.label}
              </h3>
              
              <div className="text-2xl font-bold text-foreground font-mono">
                {spec.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="industrial-card rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border-b border-border">
              <div className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                Capability
              </div>
              <div className="text-sm font-mono font-semibold text-primary uppercase tracking-wider text-center">
                SonicWire
              </div>
              <div className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Traditional
              </div>
            </div>

            {/* Rows */}
            {comparison.map((row, index) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">
                  {row.feature}
                </div>
                <div className="flex justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div className="flex justify-center">
                  <X className="w-5 h-5 text-muted-foreground/40" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
