 import { useState, useEffect } from "react";
 import { useOutletContext } from "react-router-dom";
 import {
   Building2,
   MapPin,
   Phone,
   Mail,
   Edit2,
   Save,
   Loader2,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 
 interface BranchInfo {
   id: string;
   name: string;
   code: string;
   city: string;
 }
 
 interface BranchDetails {
   id: string;
   name: string;
   code: string;
   city: string;
   state: string | null;
   address: string | null;
   phone: string | null;
   email: string | null;
 }
 
 const BranchProfile = () => {
   const { branchInfo } = useOutletContext<{ branchInfo: BranchInfo | null }>();
   const [branch, setBranch] = useState<BranchDetails | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState({
     phone: "",
     email: "",
     address: "",
   });
   const { toast } = useToast();
 
   useEffect(() => {
     const fetchBranch = async () => {
       if (!branchInfo?.id) return;
 
       const { data, error } = await supabase
         .from("branches")
         .select("*")
         .eq("id", branchInfo.id)
         .single();
 
       if (error) {
         console.error("Error fetching branch:", error);
         return;
       }
 
       setBranch(data);
       setFormData({
         phone: data.phone || "",
         email: data.email || "",
         address: data.address || "",
       });
       setLoading(false);
     };
 
     fetchBranch();
   }, [branchInfo]);
 
   const handleSave = async () => {
     if (!branch) return;
     setSaving(true);
 
     try {
       const { error } = await supabase
         .from("branches")
         .update({
           phone: formData.phone || null,
           email: formData.email || null,
           address: formData.address || null,
         })
         .eq("id", branch.id);
 
       if (error) throw error;
 
       toast({
         title: "Success",
         description: "Branch profile updated successfully",
       });
       setIsEditing(false);
       setBranch({ ...branch, ...formData });
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Failed to update profile",
         variant: "destructive",
       });
     } finally {
       setSaving(false);
     }
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
           <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
             <Building2 className="w-6 h-6 text-primary" />
             Branch Profile
           </h2>
           <p className="text-muted-foreground">
             View and manage your branch information
           </p>
         </div>
         {!isEditing ? (
           <Button onClick={() => setIsEditing(true)}>
             <Edit2 className="w-4 h-4 mr-2" />
             Edit Profile
           </Button>
         ) : (
           <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsEditing(false)}>
               Cancel
             </Button>
             <Button onClick={handleSave} disabled={saving}>
               {saving ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Save
                 </>
               )}
             </Button>
           </div>
         )}
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Branch Info Card */}
         <div className="card-elevated p-6 space-y-6">
           <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Building2 className="w-10 h-10 text-primary" />
             </div>
             <div>
               <h3 className="font-heading text-xl font-bold">{branch?.name}</h3>
               <p className="text-muted-foreground">Code: {branch?.code}</p>
             </div>
           </div>
 
           <div className="space-y-4">
             <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
               <MapPin className="w-5 h-5 text-primary" />
               <div>
                 <p className="text-xs text-muted-foreground">Location</p>
                 <p className="font-medium">{branch?.city}, {branch?.state || "India"}</p>
               </div>
             </div>
           </div>
         </div>
 
         {/* Contact Info Card */}
         <div className="card-elevated p-6 space-y-4">
           <h3 className="font-heading text-lg font-semibold">Contact Information</h3>
 
           <div className="space-y-4">
             <div>
               <Label className="flex items-center gap-2">
                 <Phone className="w-4 h-4" />
                 Phone Number
               </Label>
               {isEditing ? (
                 <Input
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   placeholder="+91 9876543210"
                 />
               ) : (
                 <p className="text-foreground mt-1">{branch?.phone || "Not set"}</p>
               )}
             </div>
 
             <div>
               <Label className="flex items-center gap-2">
                 <Mail className="w-4 h-4" />
                 Email Address
               </Label>
               {isEditing ? (
                 <Input
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   placeholder="branch@aspectvision.in"
                 />
               ) : (
                 <p className="text-foreground mt-1">{branch?.email || "Not set"}</p>
               )}
             </div>
 
             <div>
               <Label className="flex items-center gap-2">
                 <MapPin className="w-4 h-4" />
                 Full Address
               </Label>
               {isEditing ? (
                 <Textarea
                   value={formData.address}
                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                   placeholder="Enter full address..."
                   rows={3}
                 />
               ) : (
                 <p className="text-foreground mt-1">{branch?.address || "Not set"}</p>
               )}
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export default BranchProfile;