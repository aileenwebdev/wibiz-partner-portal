import { useState, Component, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RepDashboard from "./pages/RepDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JoinAgent from "./pages/JoinAgent";
import AgentVerifyPortal from "./pages/AgentVerifyPortal";

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-screen text-center p-8">
          <div>
            <p className="text-sm font-medium text-red-600 mb-2">Something went wrong</p>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap">{(this.state.error as Error).message}</pre>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs text-orange-600 underline">
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login"        element={<Login />} />
            <Route path="/dashboard"    element={<RepDashboard />} />
            <Route path="/admin"        element={<AdminDashboard />} />
            <Route path="/join-agent"   element={<JoinAgent />} />
            <Route path="/agent-verify" element={<AgentVerifyPortal />} />
            <Route path="/"             element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
