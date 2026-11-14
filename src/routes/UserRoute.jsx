import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useParams } from 'react-router-dom';

const UserRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { role } = useParams();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user.userType !== role) return <Navigate to="/access-denied" replace />;

  return children;
};

export default UserRoute;
