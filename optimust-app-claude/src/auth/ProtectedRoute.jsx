import { Navigate } from "react-router-dom";
import { PATH } from "../utils/pagePath";
import { useAuthenticate } from "../hooks/global/useAuthenticate";

const ProtectedRoute = (props) => {
    const isAuthenticated = useAuthenticate();
    if (!isAuthenticated) {
        return <Navigate to={PATH.LOGIN} replace />;
    }

    return props.children;
};

export default ProtectedRoute;