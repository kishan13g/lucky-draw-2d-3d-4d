import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallerProfile, useIsAdmin } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import BlockedPage from "./pages/BlockedPage";
import LoginPage from "./pages/LoginPage";
import SetupNamePage from "./pages/SetupNamePage";
import UserProfilePage from "./pages/UserProfilePage";

const queryClient = new QueryClient();

function AppRouter() {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  // Show spinner while identity initializes
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in -> show login
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // Loading role/profile
  if (adminLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Profile load ho raha hai...
          </p>
        </div>
      </div>
    );
  }

  // No profile yet -> setup name
  if (!profile || !profile.name) {
    return <SetupNamePage />;
  }

  // Blocked
  if (profile.isBlocked) {
    return <BlockedPage />;
  }

  // Admin -> admin dashboard (which includes lottery admin inline)
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Regular user
  return <UserProfilePage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
