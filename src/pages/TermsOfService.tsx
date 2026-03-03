import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: March 2, 2026
            </p>

            <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using SonicWire's services, including uploading schematics, requesting quotes, 
                  or placing orders, you agree to be bound by these Terms of Service. If you do not agree to these 
                  terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Intellectual Property Protection</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Your IP Rights:</strong> All schematics, designs, specifications, 
                    and technical documentation you submit to SonicWire remain your exclusive intellectual property. 
                    We claim no ownership rights to your designs.
                  </p>
                  <p>
                    <strong className="text-foreground">Confidentiality:</strong> We treat all submitted designs as 
                    confidential information. Your schematics will not be shared, sold, or disclosed to any third 
                    parties except as necessary to fulfill your manufacturing order.
                  </p>
                  <p>
                    <strong className="text-foreground">Limited License:</strong> By submitting designs, you grant 
                    SonicWire a limited, non-exclusive license to use your designs solely for the purpose of 
                    manufacturing wire harnesses according to your specifications.
                  </p>
                  <p>
                    <strong className="text-foreground">Data Security:</strong> All uploaded files are encrypted 
                    in transit and at rest. We maintain industry-standard security measures to protect your 
                    intellectual property.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Manufacturing Services</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Quotes:</strong> Timeline and pricing estimates provided 
                    through our platform are preliminary. Final quotes will be confirmed via email after our team 
                    reviews your complete specifications.
                  </p>
                  <p>
                    <strong className="text-foreground">Specifications:</strong> You are responsible for ensuring 
                    that all specifications, wire gauges, lengths, and pinout mappings provided are accurate. 
                    SonicWire will manufacture according to the specifications you provide.
                  </p>
                  <p>
                    <strong className="text-foreground">Quality Standards:</strong> All wire harnesses are 
                    manufactured to IPC/WHMA-A-620 standards unless otherwise specified. Products undergo 
                    continuity testing before shipment.
                  </p>
                  <p>
                    <strong className="text-foreground">Lead Times:</strong> Estimated production times of 7-14 
                    business days are typical but not guaranteed. Actual lead times may vary based on complexity 
                    and current production capacity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Payment terms will be specified in your final quote. Generally, payment is required before 
                  production begins. We accept major credit cards and bank transfers for approved accounts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Warranty and Returns</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Manufacturing Defects:</strong> We warrant that all 
                    products will be free from manufacturing defects for 90 days from delivery. This covers 
                    defects in materials and workmanship.
                  </p>
                  <p>
                    <strong className="text-foreground">Exclusions:</strong> This warranty does not cover damage 
                    from misuse, improper installation, modifications, or normal wear and tear.
                  </p>
                  <p>
                    <strong className="text-foreground">Design Accuracy:</strong> SonicWire is not responsible 
                    for products manufactured according to incorrect specifications provided by the customer.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SonicWire's liability is limited to the purchase price of the defective products. We are not 
                  liable for consequential, incidental, or indirect damages arising from the use of our products 
                  or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Cancellation and Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Orders may be cancelled or modified before production begins. Once production has started, 
                  cancellations may be subject to fees for work completed. Contact us immediately if you need 
                  to make changes to your order.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service are governed by the laws of Canada. Any disputes shall be resolved 
                  in the courts of the jurisdiction where SonicWire operates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately 
                  upon posting. Continued use of our services constitutes acceptance of modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:outreach@sonicwire.ca" className="text-primary hover:underline">
                    outreach@sonicwire.ca
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsOfService;
