import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AITutor from "./pages/AITutor";
import NotFound from "./pages/NotFound";

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/ai-tutor" element={<AITutor />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="performance" element={<AdminPerformance />} />
              <Route path="salary" element={<AdminSalary />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="youtube" element={<AdminYoutube />} />
              <Route path="branches" element={<AdminBranches />} />
              <Route path="settings" element={<AdminSettings />} />
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
