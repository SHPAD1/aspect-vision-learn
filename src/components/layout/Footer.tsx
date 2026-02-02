import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin, Instagram, Linkedin, Youtube, Facebook } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Our Team", href: "/team" },
    { label: "Blog", href: "/blog" },
  ],
  programs: [
    { label: "All Batches", href: "/batches" },
    { label: "Enroll Course", href: "/#batches" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Corporate Training", href: "/corporate" },
  ],
  support: [
    { label: "Contact Support", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-heading text-xl font-bold text-sidebar-foreground">
                Aspect<span className="text-primary">Vision</span>
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed mb-6 max-w-sm">
              Empowering students with industry-relevant skills through expert-led courses. 
              Transform your career with Aspect Vision.
            </p>
            <div className="space-y-3">
              <a href="mailto:hello@aspectvision.com" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                hello@aspectvision.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
              <div className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Mumbai, Bangalore, Delhi</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-semibold text-sidebar-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Links */}
          <div>
            <h4 className="font-heading font-semibold text-sidebar-foreground mb-4">Programs</h4>
            <ul className="space-y-2">
              {footerLinks.programs.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-heading font-semibold text-sidebar-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-sidebar-foreground/60">
            © {new Date().getFullYear()} Aspect Vision. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-sidebar-accent text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent/80 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}