import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const YouTubeProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", city: "" });

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name, email: data.email, phone: data.phone || "", city: data.city || "" });
      });
    }
  }, [user]);

  const handleSave = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone, city: profile.city }).eq("user_id", user!.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile Updated" });
  };

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Full Name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={profile.email} disabled /></div>
        <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
        <div><Label>City</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
};

export default YouTubeProfile;
