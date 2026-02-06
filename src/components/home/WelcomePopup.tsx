import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface Notice {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
}

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    // Check if popup was already shown in this session
    const hasSeenPopup = sessionStorage.getItem("welcomePopupSeen");
    if (!hasSeenPopup) {
      fetchActiveNotice();
    }
  }, []);

  const fetchActiveNotice = async () => {
    try {
      const { data, error } = await supabase
        .from("popup_notices")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching notice:", error);
        // Show default popup if no notice found
        setTimeout(() => setIsOpen(true), 1500);
        return;
      }

      if (data) {
        setNotice(data);
      }
      setTimeout(() => setIsOpen(true), 1500);
    } catch (error) {
      console.error("Error:", error);
      setTimeout(() => setIsOpen(true), 1500);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("welcomePopupSeen", "true");
  };

  const handleAction = () => {
    handleClose();
    if (notice?.button_link) {
      if (notice.button_link.startsWith("http")) {
        window.open(notice.button_link, "_blank");
      } else if (notice.button_link.startsWith("#")) {
        const element = document.getElementById(notice.button_link.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        window.location.href = notice.button_link;
      }
    } else {
      const batchesSection = document.getElementById("batches");
      if (batchesSection) {
        batchesSection.scrollIntoView({ behavior: "smooth" });
      }
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
              {notice?.image_url ? (
                <img
                  src={notice.image_url}
                  alt={notice.title}
                  className="h-32 w-auto object-contain mb-4 rounded-lg"
                />
              ) : (
                <img src={logo} alt="Aspect Vision" className="h-24 w-auto mb-4" />
              )}
              <h2 className="font-heading text-2xl font-bold text-center text-foreground">
                {notice ? notice.title : (
                  <>ASPECT <span className="text-primary">VISION</span></>
                )}
              </h2>
              {!notice && (
                <p className="text-sm text-muted-foreground mt-1">
                  When Vision Gets True Aspect
                </p>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 text-center">
              {notice ? (
                <>
                  <p className="text-muted-foreground text-sm mb-6 whitespace-pre-wrap">
                    {notice.content}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    🎓 New Batches Starting Soon!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Transform your career with industry-ready skills. Join our expert-led courses in Web Development, Data Science, Digital Marketing & more.
                  </p>

                  {/* Highlights */}
                  <div className="flex justify-center gap-4 mb-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-primary text-lg">300+</div>
                      <div className="text-muted-foreground text-xs">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary text-lg">98%</div>
                      <div className="text-muted-foreground text-xs">Selection</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary text-lg">25+</div>
                      <div className="text-muted-foreground text-xs">Courses</div>
                    </div>
                  </div>
                </>
              )}

              {/* CTA Button */}
              <Button onClick={handleAction} size="lg" className="w-full group">
                {notice?.button_text || "Enroll Now"}
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
