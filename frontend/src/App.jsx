import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';

import { Lock, Home as HomeIcon } from 'lucide-react';

// -------------------------
// ADMIN PROTECTED ROUTE
// -------------------------
const AdminRoute = ({ children }) => {
  const { user, token } = useApp();

  // Not logged in
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-4">

          <div className="p-3 bg-red-500/10 text-red-400 rounded-full inline-block">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white">
            Access Denied
          </h2>

          <p className="text-sm text-gray-400">
            You don’t have admin permissions to access this page.
          </p>

          <div className="flex justify-center gap-3 pt-3">

            <a
              href="/auth"
              className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-sm hover:bg-gray-800"
            >
              Sign In
            </a>

            <a
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 flex items-center gap-1"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </a>

          </div>

        </div>
      </div>
    );
  }

  return children;
};

// -------------------------
// ROUTES
// -------------------------
function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// -------------------------
// MAIN APP
// -------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}