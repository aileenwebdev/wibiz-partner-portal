import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RepDashboard from "./pages/RepDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JoinAgent from "./pages/JoinAgent";
import AgentVerifyPortal from "./pages/AgentVerifyPortal";

// No trpc.Provider needed — using vanilla client + React Query directly.

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/dashboard"    element={<RepDashboard />} />
          <Route path="/admin"        element={<AdminDashboard />} />
          <Route path="/join-agent"   element={<JoinAgent />} />
          <Route path="/agent-verify" element={<AgentVerifyPortal />} />
          <Route path="/"             element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
