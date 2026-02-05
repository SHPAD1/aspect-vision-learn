 import { Users, BookOpen, Trophy, GraduationCap } from "lucide-react";
 
 const stats = [
   { icon: Users, value: "300+", label: "Students Trained" },
   { icon: BookOpen, value: "25+", label: "Expert Courses" },
   { icon: Trophy, value: "98%", label: "Selection Rate" },
   { icon: GraduationCap, value: "50+", label: "Expert Faculty" },
 ];
 
 export function StatsSection() {
   return (
     <section className="py-12 bg-secondary/30">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
           {stats.map((stat, index) => (
             <div
               key={stat.label}
               className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
               style={{ animationDelay: `${index * 0.1}s` }}
             >
               <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                 <stat.icon className="w-7 h-7 text-primary" />
               </div>
               <span className="font-heading text-3xl md:text-4xl font-bold text-foreground block mb-1">
                 {stat.value}
               </span>
               <span className="text-sm text-muted-foreground">{stat.label}</span>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }