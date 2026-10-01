import { Navigate } from "react-router-dom";
import { PATH } from "../utils/pagePath";
import { useAuthenticate } from "../hooks/global/useAuthenticate";

const PublicRoute = (props) => {
    const isAuthenticated = useAuthenticate(); 
    if (isAuthenticated) {
        return <Navigate to={PATH.DASHBOARD} replace />;
    }

    return props.children;
};

export default PublicRoute;