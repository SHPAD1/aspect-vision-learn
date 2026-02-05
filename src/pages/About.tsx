 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Target, Eye, Award, Users, BookOpen, Trophy } from "lucide-react";
 
 export default function About() {
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       <main className="pt-24 pb-16">
         <div className="container mx-auto px-4 lg:px-8">
           {/* Header */}
           <div className="text-center mb-16">
             <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
               About Us
             </span>
             <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
               Aspect Vision
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               When Vision Gets True Aspect - Empowering students to achieve their dreams through quality education
             </p>
           </div>
 
           {/* Mission & Vision */}
           <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
             <div className="bg-card rounded-2xl border border-border p-8">
               <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                 <Target className="w-7 h-7 text-primary" />
               </div>
               <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Our Mission</h2>
               <p className="text-muted-foreground leading-relaxed">
                 To provide accessible, high-quality competitive exam preparation that transforms 
                 students' careers through expert guidance, comprehensive study materials, and 
                 personalized mentorship.
               </p>
             </div>
             
             <div className="bg-card rounded-2xl border border-border p-8">
               <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                 <Eye className="w-7 h-7 text-accent" />
               </div>
               <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Our Vision</h2>
               <p className="text-muted-foreground leading-relaxed">
                 To become India's most trusted name in entrance exam coaching, known for 
                 producing successful candidates in SSC, Banking, Railway, and Defence examinations.
               </p>
             </div>
           </div>
 
           {/* Stats */}
           <div className="bg-primary/5 rounded-3xl p-8 lg:p-12 mb-16">
             <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
               Our Achievements
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="text-center">
                 <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                   <Users className="w-8 h-8 text-primary" />
                 </div>
                 <span className="block font-heading text-3xl font-bold text-foreground">300+</span>
                 <span className="text-sm text-muted-foreground">Students Trained</span>
               </div>
               <div className="text-center">
                 <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                   <BookOpen className="w-8 h-8 text-primary" />
                 </div>
                 <span className="block font-heading text-3xl font-bold text-foreground">25+</span>
                 <span className="text-sm text-muted-foreground">Expert Courses</span>
               </div>
               <div className="text-center">
                 <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                   <Trophy className="w-8 h-8 text-primary" />
                 </div>
                 <span className="block font-heading text-3xl font-bold text-foreground">98%</span>
                 <span className="text-sm text-muted-foreground">Selection Rate</span>
               </div>
               <div className="text-center">
                 <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                   <Award className="w-8 h-8 text-primary" />
                 </div>
                 <span className="block font-heading text-3xl font-bold text-foreground">50+</span>
                 <span className="text-sm text-muted-foreground">Expert Faculty</span>
               </div>
             </div>
           </div>
 
           {/* Why Choose Us */}
           <div className="max-w-4xl mx-auto">
             <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
               Why Students Choose Us
             </h2>
             
             <div className="space-y-6">
               <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
                 <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                   <span className="text-green-600 font-bold">1</span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-foreground mb-2">Experienced Faculty</h3>
                   <p className="text-muted-foreground text-sm">
                     Learn from teachers with 10+ years of experience in competitive exam coaching 
                     who understand the exam patterns and student needs.
                   </p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
                 <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                   <span className="text-blue-600 font-bold">2</span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-foreground mb-2">Comprehensive Study Material</h3>
                   <p className="text-muted-foreground text-sm">
                     Get access to meticulously prepared study materials, previous year papers, 
                     and regular mock tests to ensure thorough preparation.
                   </p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
                 <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                   <span className="text-purple-600 font-bold">3</span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-foreground mb-2">Personalized Attention</h3>
                   <p className="text-muted-foreground text-sm">
                     Small batch sizes ensure that every student gets individual attention 
                     and doubt clearing sessions for better understanding.
                   </p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
                 <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                   <span className="text-orange-600 font-bold">4</span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-foreground mb-2">Proven Track Record</h3>
                   <p className="text-muted-foreground text-sm">
                     With 98% selection rate and hundreds of successful candidates, 
                     our results speak for themselves.
                   </p>
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