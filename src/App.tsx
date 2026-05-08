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
import SuperAdminSalons from "./pages/super-admin/Salons";
import SuperAdminSubscriptions from "./pages/super-admin/Subscriptions";
import SuperAdminUsers from "./pages/super-admin/Users";
import SuperAdminServices from "./pages/super-admin/Services";
import SuperAdminAnalytics from "./pages/super-admin/Analytics";
import SuperAdminSettings from "./pages/super-admin/Settings";

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
import BranchesPage from "./pages/dashboard/Branches";
import ReviewsPage from "./pages/dashboard/Reviews";
import NotificationsPage from "./pages/Notifications";

// Receptionist
import ReceptionistDashboard from "./pages/receptionist/Dashboard";
import ReceptionistAppointments from "./pages/receptionist/Appointments";
import ReceptionistCustomers from "./pages/receptionist/Customers";
import ReceptionistBilling from "./pages/receptionist/Billing";
import ReceptionistWalkin from "./pages/receptionist/Walkin";
import ReceptionistSummary from "./pages/receptionist/Summary";

// Staff / Beautician
import StaffDashboard from "./pages/staff/Dashboard";
import StaffAppointmentsPage from "./pages/staff/Appointments";
import StaffAttendancePage from "./pages/staff/Attendance";
import StaffCommissionPage from "./pages/staff/Commission";
import StaffSchedulePage from "./pages/staff/Schedule";

// Customer
import CustomerDashboard from "./pages/customer/Dashboard";
import BookAppointment from "./pages/customer/BookAppointment";
import CustomerBookings from "./pages/customer/Bookings";
import CustomerPackages from "./pages/customer/Packages";
import CustomerInvoices from "./pages/customer/Invoices";
import CustomerReviews from "./pages/customer/Reviews";

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
            <Route path="/super-admin/salons" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminSalons /></ProtectedRoute>} />
            <Route path="/super-admin/subscriptions" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminSubscriptions /></ProtectedRoute>} />
            <Route path="/super-admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminUsers /></ProtectedRoute>} />
            <Route path="/super-admin/services" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminServices /></ProtectedRoute>} />
            <Route path="/super-admin/analytics" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminAnalytics /></ProtectedRoute>} />
            <Route path="/super-admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminSettings /></ProtectedRoute>} />

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
            <Route path="/dashboard/branches" element={<ProtectedRoute allowedRoles={ownerRoles}><BranchesPage /></ProtectedRoute>} />
            <Route path="/dashboard/reviews" element={<ProtectedRoute allowedRoles={ownerRoles}><ReviewsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistDashboard /></ProtectedRoute>} />
            <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistAppointments /></ProtectedRoute>} />
            <Route path="/receptionist/walkin" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistWalkin /></ProtectedRoute>} />
            <Route path="/receptionist/customers" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistCustomers /></ProtectedRoute>} />
            <Route path="/receptionist/billing" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistBilling /></ProtectedRoute>} />
            <Route path="/receptionist/summary" element={<ProtectedRoute allowedRoles={['receptionist', 'salon_owner', 'branch_manager']}><ReceptionistSummary /></ProtectedRoute>} />

            {/* Staff / Beautician Routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffAppointmentsPage /></ProtectedRoute>} />
            <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffAttendancePage /></ProtectedRoute>} />
            <Route path="/staff/commission" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffCommissionPage /></ProtectedRoute>} />
            <Route path="/staff/schedule" element={<ProtectedRoute allowedRoles={['beautician', 'salon_owner', 'branch_manager']}><StaffSchedulePage /></ProtectedRoute>} />

            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/book" element={<ProtectedRoute allowedRoles={['customer']}><BookAppointment /></ProtectedRoute>} />
            <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerBookings /></ProtectedRoute>} />
            <Route path="/customer/packages" element={<ProtectedRoute allowedRoles={['customer']}><CustomerPackages /></ProtectedRoute>} />
            <Route path="/customer/invoices" element={<ProtectedRoute allowedRoles={['customer']}><CustomerInvoices /></ProtectedRoute>} />
            <Route path="/customer/reviews" element={<ProtectedRoute allowedRoles={['customer']}><CustomerReviews /></ProtectedRoute>} />

            {/* Legacy admin route redirect */}
            <Route path="/admin" element={<Auth />} />

            {/* Dev Tools */}
            <Route path="/dev/rls-test" element={<RlsTester />} />

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
