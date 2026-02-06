import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Building2, MapPin, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CorporateTraining() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Building2 className="w-4 h-4 inline mr-1" />
              Corporate Training
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Corporate Training Programs
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customized training solutions for organizations to upskill their workforce
            </p>
          </div>

          {/* Noida Coming Soon */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl border border-primary/20 p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4 animate-pulse">
                Coming Soon
              </span>
              
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                Corporate Training Center - Noida
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
                We are excited to announce our upcoming Corporate Training Center in Noida! 
                Get ready for world-class training facilities, expert instructors, and 
                comprehensive programs tailored for corporate needs.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-xl border border-border p-4">
                  <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Modern Facilities</p>
                  <p className="text-xs text-muted-foreground">State-of-the-art infrastructure</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Flexible Schedule</p>
                  <p className="text-xs text-muted-foreground">Programs to fit your timeline</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Sector 63, Noida</p>
                  <p className="text-xs text-muted-foreground">Prime location with easy access</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Interested in Corporate Training?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register your interest and we'll notify you as soon as we launch
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="mailto:aspectvisionofficial@gmail.com">
                    <Button className="w-full sm:w-auto">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Us
                    </Button>
                  </a>
                  <a href="tel:+919472070758">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
