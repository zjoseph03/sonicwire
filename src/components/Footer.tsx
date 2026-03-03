import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-foreground tracking-tight font-mono">SonicWire</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Precision wire harness manufacturing with industrial automation and rapid turnaround.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 uppercase text-xs tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/quote-request" className="text-muted-foreground hover:text-primary transition-colors">
                  Get Quote
                </Link>
              </li>
              <li>
                <a href="#waitlist" className="text-muted-foreground hover:text-primary transition-colors">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a href="mailto:outreach@sonicwire.ca" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 uppercase text-xs tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SonicWire. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Made with precision in Canada</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
