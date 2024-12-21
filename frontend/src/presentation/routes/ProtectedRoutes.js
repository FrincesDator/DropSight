import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const userRole = localStorage.getItem('userRole');

  if (!loggedInUser || userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
