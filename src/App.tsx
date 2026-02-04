import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AITutor from "./pages/AITutor";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentOverview from "./pages/student/StudentOverview";
import StudentProfile from "./pages/student/StudentProfile";
import StudentCourses from "./pages/student/StudentCourses";
import StudentPayments from "./pages/student/StudentPayments";
import StudentReports from "./pages/student/StudentReports";
import StudentIDCard from "./pages/student/StudentIDCard";
import CourseBrowser from "./pages/student/CourseBrowser";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminSalary from "./pages/admin/AdminSalary";
import AdminYoutube from "./pages/admin/AdminYoutube";
import AdminBatches from "./pages/admin/AdminBatches";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminRequests from "./pages/admin/AdminRequests";
// Sales pages
import SalesDashboard from "./pages/sales/SalesDashboard";
import SalesOverview from "./pages/sales/SalesOverview";
import SalesProfile from "./pages/sales/SalesProfile";
import SalesLeads from "./pages/sales/SalesLeads";
import SalesEntry from "./pages/sales/SalesEntry";
import SalesFollowups from "./pages/sales/SalesFollowups";
import SalesKPI from "./pages/sales/SalesKPI";
import SalesReport from "./pages/sales/SalesReport";

// Support pages
import SupportDashboard from "./pages/support/SupportDashboard";
import SupportOverview from "./pages/support/SupportOverview";
import SupportProfile from "./pages/support/SupportProfile";
import SupportTickets from "./pages/support/SupportTickets";
import SupportResolved from "./pages/support/SupportResolved";
import SupportPerformance from "./pages/support/SupportPerformance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            
            {/* Student Dashboard */}
            <Route path="/dashboard" element={<StudentDashboard />}>
              <Route index element={<StudentOverview />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="browse" element={<CourseBrowser />} />
              <Route path="payments" element={<StudentPayments />} />
              <Route path="reports" element={<StudentReports />} />
              <Route path="id-card" element={<StudentIDCard />} />
            </Route>
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="batches" element={<AdminBatches />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="performance" element={<AdminPerformance />} />
              <Route path="salary" element={<AdminSalary />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="youtube" element={<AdminYoutube />} />
              <Route path="branches" element={<AdminBranches />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Sales Dashboard */}
            <Route path="/sales" element={<SalesDashboard />}>
              <Route index element={<SalesOverview />} />
              <Route path="profile" element={<SalesProfile />} />
              <Route path="leads" element={<SalesLeads />} />
              <Route path="entry" element={<SalesEntry />} />
              <Route path="followups" element={<SalesFollowups />} />
              <Route path="kpi" element={<SalesKPI />} />
              <Route path="report" element={<SalesReport />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
