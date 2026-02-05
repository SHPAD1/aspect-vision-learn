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
 import { Mail, Phone, MapPin, Clock, CheckCircle, Send } from "lucide-react";
 
 export default function Contact() {
   const [loading, setLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [formData, setFormData] = useState({
     name: "",
     email: "",
     phone: "",
     category: "",
     subject: "",
     message: "",
   });
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
 
     try {
       // Create a support ticket (for non-logged in users, we'll use a placeholder user_id)
       // For non-logged in users, we create an enrollment lead with contact inquiry source
       const { error } = await supabase.from("enrollment_leads").insert({
         student_name: formData.name,
         email: formData.email,
         phone: formData.phone || "Not provided",
         notes: `Category: ${formData.category}\nSubject: ${formData.subject}\n\n${formData.message}`,
         source: "contact_form",
         status: "new",
       });
 
       if (error) throw error;
 
       setSubmitted(true);
       toast.success("Your message has been sent! Our support team will respond soon.");
     } catch (error) {
       console.error("Error submitting form:", error);
       toast.error("Failed to submit. Please try again or contact us directly.");
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
                 Message Sent!
               </h1>
               <p className="text-muted-foreground mb-8">
                 Thank you for reaching out. Our support team will review your message 
                 and respond within 24-48 hours.
               </p>
               <Button onClick={() => setSubmitted(false)}>
                 Send Another Message
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
               Get in Touch
             </span>
             <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
               Contact Us
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
             </p>
           </div>
 
           <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {/* Contact Info */}
             <div className="lg:col-span-1 space-y-6">
               <div className="bg-card rounded-2xl border border-border p-6">
                 <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                   Contact Information
                 </h2>
                 
                 <div className="space-y-4">
                   <a href="mailto:aspectvisionoffical@gmail.com" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <Mail className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-foreground text-sm">Email</p>
                       <p className="text-sm text-muted-foreground">aspectvisionoffical@gmail.com</p>
                     </div>
                   </a>
                   
                   <a href="tel:+919472070758" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <Phone className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-foreground text-sm">Phone</p>
                       <p className="text-sm text-muted-foreground">+91 9472070758</p>
                     </div>
                   </a>
                   
                   <div className="flex items-start gap-4 p-3 rounded-lg">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <MapPin className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-foreground text-sm">Corporate Office</p>
                       <p className="text-sm text-muted-foreground">G75, Sector 63, Noida - 201309</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-4 p-3 rounded-lg">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                       <Clock className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium text-foreground text-sm">Working Hours</p>
                       <p className="text-sm text-muted-foreground">Mon - Sat: 9:00 AM - 7:00 PM</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Regional Office */}
               <div className="bg-secondary/30 rounded-2xl border border-border p-6">
                 <h3 className="font-semibold text-foreground mb-3">Regional Office</h3>
                 <p className="text-sm text-muted-foreground">
                   Road No. 21, Rajeev Nagar<br />
                   Patna - 800024, Bihar
                 </p>
               </div>
             </div>
 
             {/* Contact Form */}
             <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 lg:p-8">
               <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                 Send us a Message
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
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="phone">Phone Number</Label>
                     <Input
                       id="phone"
                       type="tel"
                       value={formData.phone}
                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                       placeholder="+91 XXXXX XXXXX"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="category">Category *</Label>
                     <Select
                       value={formData.category}
                       onValueChange={(value) => setFormData({ ...formData, category: value })}
                       required
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="course_inquiry">Course Inquiry</SelectItem>
                         <SelectItem value="payment_issue">Payment Issue</SelectItem>
                         <SelectItem value="technical_support">Technical Support</SelectItem>
                         <SelectItem value="feedback">Feedback</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="subject">Subject *</Label>
                   <Input
                     id="subject"
                     value={formData.subject}
                     onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                     placeholder="Brief subject of your message"
                     required
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="message">Message *</Label>
                   <Textarea
                     id="message"
                     value={formData.message}
                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                     placeholder="Describe your query in detail..."
                     rows={5}
                     required
                   />
                 </div>
                 
                 <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                   {loading ? (
                     "Sending..."
                   ) : (
                     <>
                       <Send className="w-4 h-4 mr-2" />
                       Send Message
                     </>
                   )}
                 </Button>
               </form>
             </div>
           </div>
         </div>
       </main>
       <Footer />
     </div>
   );
 }