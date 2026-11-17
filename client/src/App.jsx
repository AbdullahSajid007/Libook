import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { BooksPage } from './pages/admin/BooksPage';
import { MembersPage } from './pages/admin/MembersPage';
import { LoansPage } from './pages/admin/LoansPage';
import { OverduePage } from './pages/admin/OverduePage';
import { CataloguePage } from './pages/member/CataloguePage';
import { MemberHistoryPage } from './pages/member/MemberHistoryPage';

// Route Guards
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If member attempts admin route, redirect to catalogue (FR-04)
    return <Navigate to="/catalogue" replace />;
  }

  return children;
}

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/catalogue" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes inside Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <BooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/loans"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <LoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/overdue"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <OverduePage />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Member & Admin Shared Routes */}
            <Route
              path="/catalogue"
              element={
                <ProtectedRoute>
                  <CataloguePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/history"
              element={
                <ProtectedRoute>
                  <MemberHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
