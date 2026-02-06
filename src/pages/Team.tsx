import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  photo_url: string | null;
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTeam(data || []);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Team
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Meet Our Experts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our dedicated team of experienced educators and professionals committed to your success
            </p>
          </div>

          {/* Team Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[350px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="w-24 h-24 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {member.designation}
                    </p>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Team members will be displayed here soon.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
