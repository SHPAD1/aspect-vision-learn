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
 import { FileText, HelpCircle, Clock, CheckCircle } from "lucide-react";
 
 export default function AdmissionAssistance() {
   const [loading, setLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [formData, setFormData] = useState({
     name: "",
     email: "",
     phone: "",
     city: "",
     examApplying: "",
     assistanceType: "",
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
         notes: `Exam: ${formData.examApplying}\nAssistance Type: ${formData.assistanceType}\nMessage: ${formData.message}`,
         source: "admission_assistance",
         status: "new",
       });
 
       if (error) throw error;
 
       setSubmitted(true);
       toast.success("Your request has been submitted! Our team will contact you soon.");
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
                 Request Submitted!
               </h1>
               <p className="text-muted-foreground mb-8">
                 Your admission assistance request has been received. 
                 Our team will guide you through the process within 24 hours.
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
             <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
               Application Support
             </span>
             <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
               Admission Assistance
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               Get help with exam form filling, document verification, and application process
             </p>
           </div>
 
           <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
             {/* Services */}
             <div className="space-y-6">
               <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                 How We Help
               </h2>
               
               <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                     <FileText className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Form Filling Assistance</h3>
                     <p className="text-sm text-muted-foreground">
                       Our experts help you fill exam application forms correctly to avoid rejections
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                     <HelpCircle className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Document Verification</h3>
                     <p className="text-sm text-muted-foreground">
                       Get your documents checked and verified before submission
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                   <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                     <Clock className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-foreground mb-1">Deadline Reminders</h3>
                     <p className="text-sm text-muted-foreground">
                       Never miss important dates with our exam notification alerts
                     </p>
                   </div>
                 </div>
               </div>
               
               <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                 <p className="text-sm text-foreground">
                   <strong>100% Free Service</strong> for all enrolled students. 
                   Non-enrolled students can also avail this service at minimal charges.
                 </p>
               </div>
             </div>
 
             {/* Form */}
             <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
               <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                 Request Assistance
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
                     <Label htmlFor="exam">Exam Applying For</Label>
                     <Select
                       value={formData.examApplying}
                       onValueChange={(value) => setFormData({ ...formData, examApplying: value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select exam" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="ssc_cgl">SSC CGL</SelectItem>
                         <SelectItem value="ssc_chsl">SSC CHSL</SelectItem>
                         <SelectItem value="ssc_mts">SSC MTS</SelectItem>
                         <SelectItem value="ibps_po">IBPS PO</SelectItem>
                         <SelectItem value="ibps_clerk">IBPS Clerk</SelectItem>
                         <SelectItem value="rrb_ntpc">RRB NTPC</SelectItem>
                         <SelectItem value="rrb_group_d">RRB Group D</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="assistance">Assistance Type</Label>
                     <Select
                       value={formData.assistanceType}
                       onValueChange={(value) => setFormData({ ...formData, assistanceType: value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="form_filling">Form Filling</SelectItem>
                         <SelectItem value="document_check">Document Verification</SelectItem>
                         <SelectItem value="photo_signature">Photo/Signature Help</SelectItem>
                         <SelectItem value="payment_help">Payment Assistance</SelectItem>
                         <SelectItem value="complete">Complete Assistance</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="message">Additional Details</Label>
                   <Textarea
                     id="message"
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     placeholder="Any specific requirements or questions..."
                     rows={3}
                   />
                 </div>
                 
                 <Button type="submit" className="w-full" size="lg" disabled={loading}>
                   {loading ? "Submitting..." : "Request Assistance"}
                 </Button>
                 
                 <p className="text-xs text-muted-foreground text-center">
                   Our team will contact you within 24 hours
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