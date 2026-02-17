import { motion } from "framer-motion";

const timelineData = [
  { label: "Design & Quote", sonicwire: "[X time]", traditional: "[X time]" },
  { label: "Production", sonicwire: "[X time]", traditional: "[X time]" },
  { label: "Shipment", sonicwire: "[X time]", traditional: "[X time]" },
  { label: "Total Delivery", sonicwire: "[X time]", traditional: "[X time]" },
];

const ComparisonTable = () => {
  return (
    <section className="py-24 bg-background">
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-secondary/50 border-b border-border">
              <div className="px-6 py-4 text-sm font-semibold text-muted-foreground">Timeline</div>
              <div className="px-6 py-4 text-sm font-semibold text-primary text-center flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                  </svg>
                </div>
                SonicWire
              </div>
              <div className="px-6 py-4 text-sm font-semibold text-muted-foreground text-center">Traditional</div>
            </div>

            {timelineData.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 ${index !== timelineData.length - 1 ? "border-b border-border" : ""} ${index === timelineData.length - 1 ? "bg-primary/5" : ""}`}
              >
                <div className="px-6 py-4 text-sm font-medium text-foreground">{row.label}</div>
                <div className="px-6 py-4 text-sm font-bold text-primary text-center">{row.sonicwire}</div>
                <div className="px-6 py-4 text-sm text-muted-foreground text-center">{row.traditional}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
