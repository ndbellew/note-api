import { Navigate } from "react-router-dom";
console.log("ProtectedRoutes LOADED");
const ProtectedRoutes = ({
  isAuthenticated,
  isAdmin,
  requireAdmin = false,
  csrfToken,
  ...rest
}) => {
  console.log("ProtectedRoute rest:", rest);
  console.log("ProtectedRoute CSRF Token:", rest.csrfToken);
  console.log("ProtectedRoute CSRFToken:", csrfToken);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div>
      PROTECTED ROUTE HIT
      <pre>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  );
};

export default ProtectedRoutes;
