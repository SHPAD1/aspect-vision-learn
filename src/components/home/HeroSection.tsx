import { ArrowRight, Play, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { icon: Users, value: "10,000+", label: "Students Trained" },
  { icon: BookOpen, value: "50+", label: "Expert Courses" },
  { icon: Award, value: "95%", label: "Placement Rate" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-pattern" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="container mx-auto px-4 lg:px-8 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            New Batches Starting February 2025
          </div>
          
          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Transform Your Career with{" "}
            <span className="relative">
              <span className="relative z-10">Industry-Ready</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/40 -z-10 rounded" />
            </span>{" "}
            Skills
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Join thousands of successful students who transformed their careers through our expert-led courses in 
            Web Development, Data Science, Digital Marketing & more.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/#batches">
              <Button variant="hero" size="xl" className="group">
                Explore Batches
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
              >
                <stat.icon className="w-6 h-6 text-accent mb-2" />
                <span className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-primary-foreground/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}