
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    user = {};
  }

  // Temporary diagnostic messages
  if (!token) {
    return (
      <div style={{ padding: '30px', color: 'red' }}>
        <h2>Token Missing!</h2>
        <p>Please login again.</p>
      </div>
    );
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <div style={{ padding: '30px', color: 'red' }}>
        <h2>Role Mismatch!</h2>
        <p>Required Role: {allowedRole}</p>
        <p>Your Current Role: {user.role || 'Not Found'}</p>
      </div>
    );
  }
console.log("PROTECTED ROUTE CHECK:", {
  tokenExists: !!token,
  userRole: user.role,
  allowedRole: allowedRole,
  currentPath: window.location.pathname,
  roleMatched: user.role === allowedRole
});
  return children;
};

export default ProtectedRoute;
