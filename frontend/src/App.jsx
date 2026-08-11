import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import TaskList from './pages/TaskList';
import AiHubPage from './pages/AiHubPage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';
import OAuthCallback from './pages/OAuthCallback';

// New Digital Library Platform Pages
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';
import SearchPage from './pages/SearchPage';
import MyLibraryPage from './pages/MyLibraryPage';
import CollectionsPage from './pages/CollectionsPage';
import AdminDashboard from './pages/AdminDashboard';

import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* ===== OAuth Callback ===== */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* ===== Dedicated Reader Page (Full screen, custom toolbar) ===== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/read/:id" element={<ReaderPage />} />
          </Route>

          {/* ===== Admin routes ===== */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tasks" element={<TaskList />} />
            </Route>
          </Route>

          {/* ===== Authenticated user routes ===== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-library" element={<MyLibraryPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/ai-hub" element={<AiHubPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* ===== Public routes ===== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Fallback redirects */}
          <Route path="*" element={<Navigate to="/library" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
