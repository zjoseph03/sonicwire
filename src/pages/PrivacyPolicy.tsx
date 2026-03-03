import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: March 2, 2026
            </p>

            <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SonicWire ("we," "our," or "us") is committed to protecting your privacy and intellectual 
                  property. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you use our wire harness manufacturing services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                      <li>Email addresses (for quotes, waitlist, and order communications)</li>
                      <li>Contact information (name, company name, phone number when provided)</li>
                      <li>Billing and shipping addresses (for order fulfillment)</li>
                      <li>Payment information (processed securely through third-party payment processors)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Technical Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                      <li>Schematic files and design documents (PDF uploads)</li>
                      <li>Wire harness specifications, dimensions, and technical requirements</li>
                      <li>Production preferences and customization details</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Usage Data</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                      <li>IP addresses (for security and analytics purposes)</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent on our website</li>
                      <li>Referral sources</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Order Fulfillment:</strong> To manufacture wire harnesses 
                    according to your specifications and deliver them to you
                  </li>
                  <li>
                    <strong className="text-foreground">Communication:</strong> To send quotes, order confirmations, 
                    production updates, and respond to inquiries
                  </li>
                  <li>
                    <strong className="text-foreground">Service Improvement:</strong> To analyze usage patterns 
                    and improve our website and manufacturing processes
                  </li>
                  <li>
                    <strong className="text-foreground">Waitlist Management:</strong> To notify you when our 
                    services become available or when we launch new features
                  </li>
                  <li>
                    <strong className="text-foreground">Security:</strong> To protect against fraud, unauthorized 
                    access, and other security threats
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Intellectual Property Protection</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Your Designs Are Yours:</strong> All schematics, designs, 
                    and technical documentation you submit remain your exclusive intellectual property. We claim 
                    no ownership or rights to your designs.
                  </p>
                  <p>
                    <strong className="text-foreground">Confidentiality:</strong> Your designs are treated as 
                    confidential trade secrets. We do not share, sell, or disclose your intellectual property to 
                    any third parties except:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Our manufacturing team (bound by strict confidentiality agreements)</li>
                    <li>Suppliers necessary to source specific components (only minimum required information)</li>
                    <li>When required by law or legal process</li>
                  </ul>
                  <p>
                    <strong className="text-foreground">Data Retention:</strong> Design files are retained only 
                    as long as necessary to fulfill your order and provide support. You may request deletion of 
                    your files at any time after order completion.
                  </p>
                  <p>
                    <strong className="text-foreground">Encryption:</strong> All uploaded files are encrypted 
                    during transmission (TLS/SSL) and at rest using industry-standard encryption protocols.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Email Privacy</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">No Selling or Sharing:</strong> We will never sell, rent, 
                    or share your email address with third parties for marketing purposes.
                  </p>
                  <p>
                    <strong className="text-foreground">Communication Types:</strong> We will only send you:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Quote responses and order confirmations</li>
                    <li>Production and shipping updates</li>
                    <li>Waitlist notifications (if you signed up)</li>
                    <li>Service announcements directly related to your orders</li>
                  </ul>
                  <p>
                    <strong className="text-foreground">Unsubscribe:</strong> You can unsubscribe from marketing 
                    emails at any time by clicking the unsubscribe link or contacting us directly. Note that we 
                    will still send transactional emails related to active orders.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Data Storage and Security</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    We use Supabase (hosted on secure cloud infrastructure) to store email addresses and order 
                    information. All data is:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-6">
                    <li>Encrypted at rest and in transit</li>
                    <li>Stored in secure, access-controlled data centers</li>
                    <li>Protected by firewalls and intrusion detection systems</li>
                    <li>Backed up regularly to prevent data loss</li>
                    <li>Accessible only to authorized SonicWire personnel</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Third-Party Services</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>We use the following third-party services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    <li>
                      <strong className="text-foreground">Supabase:</strong> Database hosting and authentication
                    </li>
                    <li>
                      <strong className="text-foreground">Google Analytics:</strong> Website analytics (anonymized)
                    </li>
                    <li>
                      <strong className="text-foreground">Microsoft Clarity:</strong> User experience analytics
                    </li>
                    <li>
                      <strong className="text-foreground">Payment Processors:</strong> Secure payment processing 
                      (we do not store credit card information)
                    </li>
                  </ul>
                  <p>
                    These services have their own privacy policies and security measures. We only share the 
                    minimum information necessary for these services to function.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Object to processing of your personal information</li>
                  <li>Request a copy of your data in a portable format</li>
                  <li>Withdraw consent for data processing at any time</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  To exercise these rights, contact us at{" "}
                  <a href="mailto:outreach@sonicwire.ca" className="text-primary hover:underline">
                    outreach@sonicwire.ca
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to improve your experience and analyze website 
                  usage. You can control cookies through your browser settings. Note that disabling cookies may 
                  affect website functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure 
                  appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed to individuals under 18 years of age. We do not knowingly collect 
                  personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">12. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes 
                  by posting a notice on our website or sending an email. The "Last Updated" date at the top 
                  indicates when the policy was last revised.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p>Email: <a href="mailto:outreach@sonicwire.ca" className="text-primary hover:underline">outreach@sonicwire.ca</a></p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
