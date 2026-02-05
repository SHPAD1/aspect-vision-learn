 import { useState, useEffect } from "react";
 import { Link, useLocation, useNavigate } from "react-router-dom";
 import { Menu, X, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
   { href: "/batches", label: "All Batches" },
   { href: "/career-counseling", label: "Career Counseling" },
   { href: "/admission-assistance", label: "Admission Assistance" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
   const navigate = useNavigate();
 
   // Close mobile menu on route change
   useEffect(() => {
     setIsMobileMenuOpen(false);
   }, [location.pathname]);
 
   const handleDownloadApp = () => {
     // Placeholder for app download
     window.open("https://play.google.com/store", "_blank");
   };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Aspect Vision" className="h-12 w-auto" />
            <span className="font-heading text-xl font-bold text-foreground hidden sm:inline">
              ASPECT <span className="text-primary">VISION</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                   "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={handleDownloadApp}>
               <Download className="w-4 h-4 mr-1" />
               Download App
             </Button>
            <Link to="/auth">
               <Button size="sm">Login / Signup</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                 <Button variant="outline" onClick={handleDownloadApp} className="w-full">
                   <Download className="w-4 h-4 mr-2" />
                   Download App
                 </Button>
                 <Link to="/auth">
                  <Button className="w-full">Login</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
