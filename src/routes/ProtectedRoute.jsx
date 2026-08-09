import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <div>Loading ServeHub account...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '#/login';
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (typeof window !== 'undefined') window.location.href = '#/dashboard/overview';
    return null;
  }

  return children;
};

export default ProtectedRoute;
