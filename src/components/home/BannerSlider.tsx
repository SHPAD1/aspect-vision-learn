 import { useState, useEffect } from "react";
 import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Link } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 
 interface Banner {
   id: string;
   title: string;
   subtitle: string | null;
   image_url: string | null;
   button_text: string;
   button_link: string;
 }
 
 export function BannerSlider() {
   const [banners, setBanners] = useState<Banner[]>([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchBanners();
   }, []);
 
   useEffect(() => {
     if (banners.length <= 1) return;
     const timer = setInterval(() => {
       setCurrentIndex((prev) => (prev + 1) % banners.length);
     }, 5000);
     return () => clearInterval(timer);
   }, [banners.length]);
 
   const fetchBanners = async () => {
     try {
       const { data, error } = await supabase
         .from("banners")
         .select("*")
         .eq("is_active", true)
         .order("display_order", { ascending: true });
 
       if (error) throw error;
       setBanners(data || []);
     } catch (error) {
       console.error("Error fetching banners:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const goToPrevious = () => {
     setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
   };
 
   const goToNext = () => {
     setCurrentIndex((prev) => (prev + 1) % banners.length);
   };
 
   if (loading) {
     return (
       <div className="h-[500px] lg:h-[600px] bg-gradient-to-r from-primary to-primary/80 animate-pulse flex items-center justify-center">
         <div className="text-primary-foreground/50">Loading...</div>
       </div>
     );
   }
 
   if (banners.length === 0) {
     return (
       <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
         <div className="absolute inset-0 hero-gradient" />
         <div className="absolute inset-0 hero-pattern" />
         <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
           <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
             Welcome to Aspect Vision
           </h1>
           <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
             Your gateway to success in competitive exams
           </p>
           <Link to="/#batches">
             <Button variant="hero" size="xl">
               Explore Batches
               <ArrowRight className="w-5 h-5" />
             </Button>
           </Link>
         </div>
       </section>
     );
   }
 
   const currentBanner = banners[currentIndex];
 
   return (
     <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
       {/* Background */}
       <div className="absolute inset-0 hero-gradient" />
       <div className="absolute inset-0 hero-pattern" />
       
       {/* Floating Elements */}
       <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl animate-float" />
       <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
       
       {/* Banner Content */}
       <div className="container mx-auto px-4 lg:px-8 relative z-10">
         <div className="max-w-4xl mx-auto text-center">
           {/* Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-8 animate-fade-in">
             <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
             Entrance Exam Preparation
           </div>
           
           {/* Title */}
           <h1 
             key={currentBanner.id + "-title"}
             className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up"
           >
             {currentBanner.title}
           </h1>
           
           {/* Subtitle */}
           {currentBanner.subtitle && (
             <p 
               key={currentBanner.id + "-subtitle"}
               className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up"
               style={{ animationDelay: "0.1s" }}
             >
               {currentBanner.subtitle}
             </p>
           )}
           
           {/* CTA Button */}
           <div className="flex items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
             <Link to={currentBanner.button_link}>
               <Button variant="hero" size="xl" className="group">
                 {currentBanner.button_text}
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Button>
             </Link>
           </div>
         </div>
       </div>
       
       {/* Navigation Arrows */}
       {banners.length > 1 && (
         <>
           <button
             onClick={goToPrevious}
             className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors z-20"
             aria-label="Previous banner"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
           <button
             onClick={goToNext}
             className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors z-20"
             aria-label="Next banner"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
         </>
       )}
       
       {/* Dots Indicator */}
       {banners.length > 1 && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
           {banners.map((_, index) => (
             <button
               key={index}
               onClick={() => setCurrentIndex(index)}
               className={`w-3 h-3 rounded-full transition-all ${
                 index === currentIndex
                   ? "bg-primary-foreground w-8"
                   : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
               }`}
               aria-label={`Go to banner ${index + 1}`}
             />
           ))}
         </div>
       )}
       
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