import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

// Components
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Breadcrumbs from "@/components/Breadcrumbs";
import { ModeToggle } from "@/components/mode-toggle";
import AdminRoute from "@/components/AdminRoute";

// Public Pages
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

// User Pages
import UserDashboard from '@/pages/UserDashboard';

// Admin Pages
import Home from "@/pages/Home";
import DoctorsIndex from "@/pages/doctors/Index";
import DoctorShow from "@/pages/doctors/Show";
import PatientsIndex from "@/pages/patients/Index";
import PatientShow from "@/pages/patients/Show";
import AppointmentsIndex from "@/pages/appointments/Index";
import AppointmentShow from "@/pages/appointments/Show";
import PrescriptionsIndex from "@/pages/prescriptions/Index";
import PrescriptionShow from "@/pages/prescriptions/Show";
import DiagnosesIndex from "@/pages/diagnoses/Index";
import DiagnosisShow from "@/pages/diagnoses/Show";
import CalendarView from "@/pages/CalendarView";

// --- Route Guards ---

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/welcome" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  // If logged in, redirect based on role
  if (user) {
      if (user.role === 'admin') return <Navigate to="/" replace />;
      return <Navigate to="/user-dashboard" replace />;
  }
  return children;
};

// --- Admin Layout (Sidebar + Header) ---
const AdminLayout = () => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
             <ModeToggle />
             <span className="hidden md:inline font-medium">Admin Portal v2.0</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 bg-muted/40 min-h-[calc(100vh-4rem)]">
            <Breadcrumbs />
            <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BreadcrumbProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/welcome" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            
            {/* LOGGED IN ROUTES */}
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                
                {/* 1. REGULAR USER DASHBOARD (No Sidebar) */}
                <Route path="/user-dashboard" element={<UserDashboard />} />

                {/* 2. ADMIN ROUTES (Protected by AdminRoute + Layout) */}
                <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/doctors" element={<DoctorsIndex />} />
                        <Route path="/doctors/:id" element={<DoctorShow />} />
                        <Route path="/patients" element={<PatientsIndex />} />
                        <Route path="/patients/:id" element={<PatientShow />} />
                        <Route path="/appointments" element={<AppointmentsIndex />} />
                        <Route path="/appointments/:id" element={<AppointmentShow />} />
                        <Route path="/calendar" element={<CalendarView />} />
                        <Route path="/prescriptions" element={<PrescriptionsIndex />} />
                        <Route path="/prescriptions/:id" element={<PrescriptionShow />} />
                        <Route path="/diagnoses" element={<DiagnosesIndex />} />
                        <Route path="/diagnoses/:id" element={<DiagnosisShow />} />
                    </Route>
                </Route>

            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="bottom-right" richColors />
        </BreadcrumbProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}