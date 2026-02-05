 import { useState } from "react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { GraduationCap, Target, Users, CheckCircle } from "lucide-react";
 
 export default function CareerCounseling() {
   const [loading, setLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [formData, setFormData] = useState({
     name: "",
     email: "",
     phone: "",
     city: "",
     currentEducation: "",
     interestedExam: "",
     message: "",
   });
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
 
     try {
       const { error } = await supabase.from("enrollment_leads").insert({
         student_name: formData.name,
         email: formData.email,
         phone: formData.phone,
         city: formData.city,
         notes: `Education: ${formData.currentEducation}\nInterested Exam: ${formData.interestedExam}\nMessage: ${formData.message}`,
         source: "career_counseling",
         status: "new",
       });
 
       if (error) throw error;
 
       setSubmitted(true);
       toast.success("Your request has been submitted! Our counselor will contact you soon.");
     } catch (error) {
       console.error("Error submitting form:", error);
       toast.error("Failed to submit. Please try again.");
     } finally {
       setLoading(false);
     }
   };
 
   if (submitted) {
     return (
       <div className="min-h-screen bg-background">
         <Navbar />
         <main className="pt-24 pb-16">
           <div className="container mx-auto px-4 lg:px-8">
             <div className="max-w-xl mx-auto text-center py-16">
               <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                 <CheckCircle className="w-10 h-10 text-green-600" />
               </div>
               <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
                 Thank You!
               </h1>
               <p className="text-muted-foreground mb-8">
                 Your career counseling request has been submitted successfully. 
                 Our expert counselor will contact you within 24 hours.
               </p>
               <Button onClick={() => window.location.href = "/"}>
                 Back to Home
               </Button>
             </div>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       <main className="pt-24 pb-16">
         <div className="container mx-auto px-4 lg:px-8">
           {/* Header */}
           <div className="text-center mb-12">
             <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
               Free Counseling
             </span>
             <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
               Career Counseling
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               Get personalized guidance from our experts to choose the right career path and exam preparation strategy
             </p>
           </div>
 
           <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
             {/* Benefits */}
             <div className="space-y-6">
               <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                 Why Career Counseling?
               </h2>
               
               <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <Target className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Right Exam Selection</h3>
                     <p className="text-sm text-muted-foreground">
                       Get expert guidance to choose the exam that best fits your profile and goals
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <GraduationCap className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Personalized Study Plan</h3>
                     <p className="text-sm text-muted-foreground">
                       Receive a customized preparation strategy based on your strengths and weaknesses
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <Users className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Expert Mentorship</h3>
                     <p className="text-sm text-muted-foreground">
                       Connect with experienced mentors who have helped 300+ students succeed
                     </p>
                   </div>
                 </div>
               </div>
             </div>
 
             {/* Form */}
             <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
               <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                 Request Free Counseling
               </h2>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="name">Full Name *</Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       placeholder="Your full name"
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="phone">Phone Number *</Label>
                     <Input
                       id="phone"
                       type="tel"
                       value={formData.phone}
                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                       placeholder="+91 XXXXX XXXXX"
                       required
                     />
                   </div>
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="email">Email Address *</Label>
                     <Input
                       id="email"
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       placeholder="your@email.com"
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="city">City</Label>
                     <Input
                       id="city"
                       value={formData.city}
                       onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                       placeholder="Your city"
                     />
                   </div>
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="education">Current Education</Label>
                     <Select
                       value={formData.currentEducation}
                       onValueChange={(value) => setFormData({ ...formData, currentEducation: value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select education" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="10th">10th Pass</SelectItem>
                         <SelectItem value="12th">12th Pass</SelectItem>
                         <SelectItem value="graduate">Graduate</SelectItem>
                         <SelectItem value="postgraduate">Post Graduate</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="exam">Interested Exam</Label>
                     <Select
                       value={formData.interestedExam}
                       onValueChange={(value) => setFormData({ ...formData, interestedExam: value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select exam" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="ssc">SSC Exams</SelectItem>
                         <SelectItem value="banking">Banking Exams</SelectItem>
                         <SelectItem value="railway">Railway Exams</SelectItem>
                         <SelectItem value="defence">Defence Exams</SelectItem>
                         <SelectItem value="state">State Level Exams</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="message">Message (Optional)</Label>
                   <Textarea
                     id="message"
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     placeholder="Any specific queries or concerns..."
                     rows={3}
                   />
                 </div>
                 
                 <Button type="submit" className="w-full" size="lg" disabled={loading}>
                   {loading ? "Submitting..." : "Request Free Counseling"}
                 </Button>
                 
                 <p className="text-xs text-muted-foreground text-center">
                   By submitting, you agree to receive calls from our counselors
                 </p>
               </form>
             </div>
           </div>
         </div>
       </main>
       <Footer />
     </div>
   );
 }