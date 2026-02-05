 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 interface CreateUserRequest {
   email: string;
   password: string;
   full_name: string;
   phone?: string;
   city?: string;
   role: string;
   branch_id?: string;
   department?: string;
   designation?: string;
   salary?: number;
 }
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Verify the requesting user is an admin
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: "Authorization header required" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create clients
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
 
     // Verify calling user is admin using their token
     const userClient = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
     if (userError || !callingUser) {
       return new Response(
         JSON.stringify({ error: "Invalid authentication" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Check if calling user is admin using service role client
     const adminClient = createClient(supabaseUrl, supabaseServiceKey);
     
     const { data: roleData, error: roleError } = await adminClient
       .from("user_roles")
       .select("role")
       .eq("user_id", callingUser.id)
       .eq("role", "admin")
       .single();
 
     if (roleError || !roleData) {
       return new Response(
         JSON.stringify({ error: "Only admins can create users" }),
         { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Parse request body
     const body: CreateUserRequest = await req.json();
     const { email, password, full_name, phone, city, role, branch_id, department, designation, salary } = body;
 
     // Validate required fields
     if (!email || !password || !full_name || !role) {
       return new Response(
         JSON.stringify({ error: "Email, password, full_name, and role are required" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Validate employee roles require branch
     const employeeRoles = ["branch_admin", "teacher", "sales", "support"];
     if (employeeRoles.includes(role) && !branch_id) {
       return new Response(
         JSON.stringify({ error: "Branch is required for this role" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create auth user using admin client (service role)
     const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
       email: email.trim().toLowerCase(),
       password,
       email_confirm: true, // Auto-confirm for admin-created users
       user_metadata: {
         full_name: full_name.trim(),
       },
     });
 
     if (authError) {
       console.error("Auth creation error:", authError);
       return new Response(
         JSON.stringify({ error: authError.message }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const newUserId = authData.user.id;
 
     // Create profile
     const { error: profileError } = await adminClient.from("profiles").insert({
       user_id: newUserId,
       full_name: full_name.trim(),
       email: email.trim().toLowerCase(),
       phone: phone?.trim() || null,
       city: city?.trim() || null,
     });
 
     if (profileError) {
       console.error("Profile creation error:", profileError);
       // Cleanup: delete the auth user if profile fails
       await adminClient.auth.admin.deleteUser(newUserId);
       return new Response(
         JSON.stringify({ error: "Failed to create profile: " + profileError.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Assign role
     const { error: roleInsertError } = await adminClient.from("user_roles").insert({
       user_id: newUserId,
       role: role,
     });
 
     if (roleInsertError) {
       console.error("Role assignment error:", roleInsertError);
       // Cleanup
       await adminClient.from("profiles").delete().eq("user_id", newUserId);
       await adminClient.auth.admin.deleteUser(newUserId);
       return new Response(
         JSON.stringify({ error: "Failed to assign role: " + roleInsertError.message }),
         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create employee record for employee roles
     if (employeeRoles.includes(role) && branch_id) {
       const employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
       const { error: employeeError } = await adminClient.from("employees").insert({
         user_id: newUserId,
         employee_id: employeeId,
         branch_id: branch_id,
         department: department || role,
         designation: designation?.trim() || null,
         salary: salary || null,
       });
 
       if (employeeError) {
         console.error("Employee creation error:", employeeError);
         // Don't fail completely, user is created
       }
     }
 
     // Create student record for student role
     if (role === "student") {
       const studentId = `STU-${Date.now().toString(36).toUpperCase()}`;
       const { error: studentError } = await adminClient.from("students").insert({
         user_id: newUserId,
         student_id: studentId,
         branch_id: branch_id || null,
       });
 
       if (studentError) {
         console.error("Student creation error:", studentError);
         // Don't fail completely, user is created
       }
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         message: "User created successfully",
         user_id: newUserId,
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Unexpected error:", error);
     return new Response(
       JSON.stringify({ error: error.message || "Internal server error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });