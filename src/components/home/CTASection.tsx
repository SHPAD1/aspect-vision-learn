import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-pattern opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>
          
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Start Your{" "}
            <span className="relative inline-block">
              Learning Journey?
              <span className="absolute -bottom-1 left-0 right-0 h-2 bg-accent/40 rounded" />
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join our upcoming batches and get 20% early bird discount. 
            Limited seats available - enroll now!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/#batches">
              <Button variant="hero" size="xl" className="group">
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="xl">
                Talk to Counselor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}