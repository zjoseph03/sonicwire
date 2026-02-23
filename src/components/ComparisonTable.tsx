import { motion } from "framer-motion";
import { Clock, Zap, TrendingUp, CheckCircle } from "lucide-react";

const specs = [
  { 
    icon: Zap, 
    label: "Quote Response", 
    value: "[X hours]", 
    highlight: true,
    description: "Lightning-fast quotes"
  },
  { 
    icon: Clock, 
    label: "Production Time", 
    value: "[X days]", 
    highlight: false,
    description: "Rapid turnaround"
  },
  { 
    icon: TrendingUp, 
    label: "Min Order Qty", 
    value: "[X units]", 
    highlight: true,
    description: "Low minimums"
  },
  { 
    icon: CheckCircle, 
    label: "Quality Standard", 
    value: "ISO 9001", 
    highlight: false,
    description: "Certified excellence"
  },
  { 
    icon: Zap, 
    label: "Design Support", 
    value: "24/7", 
    highlight: true,
    description: "Always available"
  },
  { 
    icon: TrendingUp, 
    label: "Scalability", 
    value: "[X to X+]", 
    highlight: false,
    description: "Grows with you"
  },
];

const ComparisonTable = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Fast-Moving Hardware Teams
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            [Your company description and value proposition goes here]
          </p>
        </motion.div>

        {/* Bento Box Grid Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {specs.map((spec, index) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`glass-card glass-card-hover rounded-none p-6 relative overflow-hidden ${
                index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
              } ${
                index === 2 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-none ${spec.highlight ? 'bg-electric-blue' : 'bg-primary'}`}>
                    <spec.icon className="w-5 h-5 text-white" />
                  </div>
                  {spec.highlight && (
                    <div className="pulse-dot" />
                  )}
                </div>
                
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {spec.label}
                </h3>
                
                <div className={`text-3xl font-bold mb-2 ${spec.highlight ? 'text-electric-blue' : 'text-foreground'}`}>
                  {spec.value}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {spec.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Traditional vs SonicWire comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-4"
        >
          {/* Traditional */}
          <div className="border-2 border-border rounded-none p-6 bg-background/50">
            <h3 className="text-xl font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              Traditional Manufacturing
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✕</span>
                <span>[X time] quote response</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✕</span>
                <span>High minimum orders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✕</span>
                <span>Limited flexibility</span>
              </li>
            </ul>
          </div>

          {/* SonicWire */}
          <div className="glass-card border-glow-blue rounded-none p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 pulse-dot" />
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-electric-blue" />
              SonicWire Solution
            </h3>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-electric-blue mt-1">✓</span>
                <span>[X time] instant quotes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-electric-blue mt-1">✓</span>
                <span>Flexible order sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-electric-blue mt-1">✓</span>
                <span>Complete agility</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
