import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './App.css';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './components/pages/DashboardPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { SpreadsheetPage } from './components/pages/SpreadsheetPage';
import { AuthPage } from './components/pages/AuthPage';
import { useAppDispatch } from './store/hooks';
import { checkAuthStatus } from './store/slices/authSlice';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      { path: 'documents/:documentId', element: <SpreadsheetPage /> },
    ],
  },
  {
    path: '/login',
    element: <AuthPage/>
  },
  { path: '*', element: <NotFoundPage /> },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() =>{
    dispatch(checkAuthStatus());
  }, [dispatch]);
  
  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;