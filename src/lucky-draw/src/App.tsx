import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import Layout from "@/components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000,
    },
  },
});

function AppRouter() {
  const { auth } = useAuth();
  if (!auth) return <LoginPage />;
  return <Layout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        richColors
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0f0f22",
            border: "1px solid #252550",
            color: "#d5d5ff",
            fontFamily: "Orbitron, monospace",
            fontSize: "12px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
