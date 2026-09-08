import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  element: Component,
  isAuthenticated,
  isAdmin,
  requireAdmin = false,
  ...rest
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
