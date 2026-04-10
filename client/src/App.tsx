import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { trpc, createTrpcClient } from "./lib/trpc";
import Login from "./pages/Login";
import RepDashboard from "./pages/RepDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JoinAgent from "./pages/JoinAgent";
import AgentVerifyPortal from "./pages/AgentVerifyPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const trpcClient = createTrpcClient();

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login"         element={<Login />} />
            <Route path="/dashboard"     element={<RepDashboard />} />
            <Route path="/admin"         element={<AdminDashboard />} />
            <Route path="/join-agent"    element={<JoinAgent />} />
            <Route path="/agent-verify"  element={<AgentVerifyPortal />} />
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
