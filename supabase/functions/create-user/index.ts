import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppRole = "admin" | "branch_admin" | "teacher" | "sales" | "support" | "student";

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  role: AppRole | string;
  branch_id?: string;
  department?: string;
  designation?: string;
  salary?: number;
}

const employeeRoles: AppRole[] = ["branch_admin", "teacher", "sales", "support"];
const branchAdminCreatableRoles: AppRole[] = ["teacher", "sales", "support"];
const allowedRoles: AppRole[] = ["admin", "branch_admin", "teacher", "sales", "support", "student"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: callerRoleRows, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id);

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "Unable to verify user permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const callerRoles = new Set((callerRoleRows || []).map((row) => row.role as AppRole));
    const isAdmin = callerRoles.has("admin");
    const isBranchAdmin = callerRoles.has("branch_admin");

    if (!isAdmin && !isBranchAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins and branch admins can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let callerBranchId: string | null = null;
    if (!isAdmin && isBranchAdmin) {
      const { data: callerEmployee, error: callerEmployeeError } = await adminClient
        .from("employees")
        .select("branch_id")
        .eq("user_id", callingUser.id)
        .not("branch_id", "is", null)
        .maybeSingle();

      if (callerEmployeeError || !callerEmployee?.branch_id) {
        return new Response(
          JSON.stringify({ error: "Branch admin must be mapped to an active branch" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      callerBranchId = callerEmployee.branch_id;
    }

    const body: CreateUserRequest = await req.json();
    const { email, password, full_name, phone, city, role, branch_id, department, designation, salary } = body;

    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: "Email, password, full_name, and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedRole = String(role).trim() as AppRole;
    if (!allowedRoles.includes(normalizedRole)) {
      return new Response(
        JSON.stringify({ error: "Invalid role provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let effectiveBranchId = branch_id?.trim() || null;

    if (!isAdmin && isBranchAdmin) {
      if (!branchAdminCreatableRoles.includes(normalizedRole)) {
        return new Response(
          JSON.stringify({ error: "Branch admin can only create teacher, sales, or support users" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (effectiveBranchId && effectiveBranchId !== callerBranchId) {
        return new Response(
          JSON.stringify({ error: "Branch admin can only create users within their own branch" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      effectiveBranchId = callerBranchId;
    }

    if (employeeRoles.includes(normalizedRole) && !effectiveBranchId) {
      return new Response(
        JSON.stringify({ error: "Branch is required for this role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
      },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const newUserId = authData.user.id;

    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: newUserId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      city: city?.trim() || null,
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: "Failed to create profile: " + profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: roleInsertError } = await adminClient.from("user_roles").insert({
      user_id: newUserId,
      role: normalizedRole,
    });

    if (roleInsertError) {
      await adminClient.from("profiles").delete().eq("user_id", newUserId);
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: "Failed to assign role: " + roleInsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (employeeRoles.includes(normalizedRole) && effectiveBranchId) {
      const employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
      const { error: employeeError } = await adminClient.from("employees").insert({
        user_id: newUserId,
        employee_id: employeeId,
        branch_id: effectiveBranchId,
        department: department || normalizedRole,
        designation: designation?.trim() || null,
        salary: salary || null,
      });

      if (employeeError) {
        console.error("Employee creation error:", employeeError);
      }
    }

    if (normalizedRole === "student") {
      const studentId = `STU-${Date.now().toString(36).toUpperCase()}`;
      const { error: studentError } = await adminClient.from("students").insert({
        user_id: newUserId,
        student_id: studentId,
        branch_id: effectiveBranchId,
      });

      if (studentError) {
        console.error("Student creation error:", studentError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        user_id: newUserId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
