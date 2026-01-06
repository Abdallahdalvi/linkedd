import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(requireAdmin);

  useEffect(() => {
    if (!requireAdmin || !user) {
      setIsAuthorized(true);
      setCheckingRole(false);
      return;
    }

    const checkAdminRole = async () => {
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAuthorized(false);
      } else {
        setIsAuthorized(data === true);
      }
      setCheckingRole(false);
    };

    checkAdminRole();
  }, [user, requireAdmin]);
  
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
            <Route path="/:username" element={<PublicProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
