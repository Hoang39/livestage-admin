import { defaultPath } from "@configs/routeConfig";
import { Outlet, Navigate } from "react-router-dom";
import { authStorage } from "../services/authStorage";

const AuthRoutes = () => {
    const isLogin = authStorage.isLogin();

    return !isLogin ? <Outlet /> : <Navigate to={defaultPath} />;
};

export { AuthRoutes };
