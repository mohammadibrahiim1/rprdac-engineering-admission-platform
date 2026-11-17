import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== "admin")
    return <Navigate to="/access-denied" replace />;

  return children;
};

export default AdminRoute;
