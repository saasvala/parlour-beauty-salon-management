import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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

// Receptionist
import ReceptionistDashboard from "./pages/receptionist/Dashboard";

// Staff / Beautician
import StaffDashboard from "./pages/staff/Dashboard";

// Customer
import CustomerDashboard from "./pages/customer/Dashboard";
import BookAppointment from "./pages/customer/BookAppointment";
import CustomerBookings from "./pages/customer/Bookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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

            {/* Super Admin Routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Salon Owner / Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <SalonOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/appointments"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/customers"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/services"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/billing"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/reports"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute allowedRoles={['salon_owner', 'branch_manager']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Receptionist Routes */}
            <Route
              path="/receptionist"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/*"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff / Beautician Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/book"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy admin route redirect */}
            <Route path="/admin" element={<Auth />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
