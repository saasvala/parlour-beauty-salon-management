import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Super Admin
import SuperAdminDashboard from "./pages/super-admin/Dashboard";

// Salon Owner / Dashboard
import SalonOwnerDashboard from "./pages/dashboard/Dashboard";
import AppointmentsPage from "./pages/dashboard/Appointments";
import CustomersPage from "./pages/dashboard/Customers";
import StaffPage from "./pages/dashboard/Staff";
import ServicesPage from "./pages/dashboard/Services";
import BillingPage from "./pages/dashboard/Billing";
import ReportsPage from "./pages/dashboard/Reports";
import SettingsPage from "./pages/dashboard/Settings";
import ExpensesPage from "./pages/dashboard/Expenses";
import PackagesPage from "./pages/dashboard/Packages";
import InventoryPage from "./pages/dashboard/Inventory";

// Receptionist
import ReceptionistDashboard from "./pages/receptionist/Dashboard";

// Staff / Beautician
import StaffDashboard from "./pages/staff/Dashboard";

// Customer
import CustomerDashboard from "./pages/customer/Dashboard";
import BookAppointment from "./pages/customer/BookAppointment";
import CustomerBookings from "./pages/customer/Bookings";

// Dev tools
import RlsTester from "./pages/dev/RlsTester";

const queryClient = new QueryClient();

const ownerRoles: ('salon_owner' | 'branch_manager')[] = ['salon_owner', 'branch_manager'];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<Auth />} />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/*" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />

            {/* Salon Owner / Admin Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ownerRoles}><SalonOwnerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/appointments" element={<ProtectedRoute allowedRoles={ownerRoles}><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/customers" element={<ProtectedRoute allowedRoles={ownerRoles}><CustomersPage /></ProtectedRoute>} />
            <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={ownerRoles}><StaffPage /></ProtectedRoute>} />
            <Route path="/dashboard/services" element={<ProtectedRoute allowedRoles={ownerRoles}><ServicesPage /></ProtectedRoute>} />
            <Route path="/dashboard/billing" element={<ProtectedRoute allowedRoles={ownerRoles}><BillingPage /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={ownerRoles}><ReportsPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={ownerRoles}><SettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/expenses" element={<ProtectedRoute allowedRoles={ownerRoles}><ExpensesPage /></ProtectedRoute>} />
            <Route path="/dashboard/packages" element={<ProtectedRoute allowedRoles={ownerRoles}><PackagesPage /></ProtectedRoute>} />
            <Route path="/dashboard/inventory" element={<ProtectedRoute allowedRoles={ownerRoles}><InventoryPage /></ProtectedRoute>} />

            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistDashboard /></ProtectedRoute>} />
            <Route path="/receptionist/*" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistDashboard /></ProtectedRoute>} />

            {/* Staff / Beautician Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/*" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffDashboard /></ProtectedRoute>} />

            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/book" element={<ProtectedRoute allowedRoles={['customer']}><BookAppointment /></ProtectedRoute>} />
            <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerBookings /></ProtectedRoute>} />
            <Route path="/customer/*" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />

            {/* Legacy admin route redirect */}
            <Route path="/admin" element={<Auth />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
