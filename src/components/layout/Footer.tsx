import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Youtube, Facebook, Globe } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "https://careerlink-suite.vercel.app/", external: true },
    { label: "Our Team", href: "/team" },
    { label: "Blog", href: "/blog" },
  ],
  programs: [
    { label: "All Batches", href: "/batches" },
    { label: "Enroll Course", href: "/#batches" },
    { label: "Success Stories", href: "/blog?tab=success_story" },
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
  { icon: Instagram, href: "https://www.instagram.com/aspectvisionofficial?igsh=MXJlaGY2dTVxMjMzMQ==", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/aspect-vision/", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/@AspectVision", label: "YouTube" },
  { icon: Facebook, href: "https://www.facebook.com/share/1GGPuy97hi/", label: "Facebook" },
];

const offices = [
  {
    type: "Corporate Office",
    address: "G75, Sector 63, Noida - 201309",
    city: "Noida, UP",
  },
  {
    type: "Regional Office",
    address: "Road No. 21, Rajeev Nagar, Patna - 800024",
    city: "Patna, Bihar",
  },
];

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Aspect Vision" className="h-14 w-auto" />
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed mb-6 max-w-sm">
              When Vision Gets True Aspect. Empowering students with industry-relevant skills through expert-led courses. 
              Transform your career with Aspect Vision.
            </p>
            <div className="space-y-3">
              <a href="mailto:aspectvisionoffical@gmail.com" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                aspectvisionoffical@gmail.com
              </a>
              <a href="tel:+919472070758" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 9472070758
              </a>
              <a href="https://www.aspectvision.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Globe className="w-4 h-4 flex-shrink-0" />
                www.aspectvision.in
              </a>
            </div>
            
            {/* Office Locations */}
            <div className="mt-6 space-y-4">
              {offices.map((office) => (
                <div key={office.type} className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-sidebar-foreground">{office.type}:</span>
                    <br />
                    {office.address}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading font-semibold text-sidebar-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  {(link as any).external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
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
