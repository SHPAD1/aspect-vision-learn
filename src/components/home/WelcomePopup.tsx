import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const hasSeenPopup = sessionStorage.getItem("welcomePopupSeen");
    if (!hasSeenPopup) {
      // Small delay before showing popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("welcomePopupSeen", "true");
  };

  const handleEnroll = () => {
    handleClose();
    // Scroll to batches section
    const batchesSection = document.getElementById("batches");
    if (batchesSection) {
      batchesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-1">
          <div className="bg-background rounded-xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo & Image Section */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex flex-col items-center">
              <img src={logo} alt="Aspect Vision" className="h-24 w-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-center text-foreground">
                ASPECT <span className="text-primary">VISION</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                When Vision Gets True Aspect
              </p>
            </div>

            {/* Content Section */}
            <div className="p-6 text-center">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                🎓 New Batches Starting Soon!
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Transform your career with industry-ready skills. Join our expert-led courses in Web Development, Data Science, Digital Marketing & more.
              </p>

              {/* Highlights */}
              <div className="flex justify-center gap-4 mb-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary text-lg">10,000+</div>
                  <div className="text-muted-foreground text-xs">Students</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary text-lg">95%</div>
                  <div className="text-muted-foreground text-xs">Placement</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary text-lg">50+</div>
                  <div className="text-muted-foreground text-xs">Courses</div>
                </div>
              </div>

              {/* CTA Button */}
              <Button onClick={handleEnroll} size="lg" className="w-full group">
                Enroll Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <button
                onClick={handleClose}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
