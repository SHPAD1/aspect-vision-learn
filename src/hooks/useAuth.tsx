import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoading: boolean;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isBranchAdmin: boolean;
  isTeacher: boolean;
  isSales: boolean;
  isSupport: boolean;
  isStudent: boolean;
  signOut: () => Promise<void>;
  getPrimaryRole: () => AppRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role priority for determining primary dashboard
const rolePriority: AppRole[] = ["admin", "branch_admin", "teacher", "sales", "support", "student"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setRolesLoading(true);
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setLoading(false);
          setRolesLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRolesLoading(true);
        fetchUserRoles(session.user.id);
      } else {
        setLoading(false);
        setRolesLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;
      
      setRoles(data?.map((r) => r.role) || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
      setRolesLoading(false);
    }
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const getPrimaryRole = (): AppRole | null => {
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    rolesLoading,
    roles,
    hasRole,
    isAdmin: hasRole("admin"),
    isBranchAdmin: hasRole("branch_admin"),
    isTeacher: hasRole("teacher"),
    isSales: hasRole("sales"),
    isSupport: hasRole("support"),
    isStudent: hasRole("student"),
    signOut,
    getPrimaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
