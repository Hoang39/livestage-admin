import { MainLayout } from "@components/layouts/MainLayout";
import { Outlet, Navigate } from "react-router-dom";
import { authStorage } from "@services/authStorage";
import { loginPath } from "@configs/routeConfig";

export const PrivateRoutes = () => {
    const isLogin = authStorage.isLogin();
    // const { fetchCompanies } = useAppStore((state) => state);

    // if (isLogin) {
    //     fetchCompanies();
    // }

    return isLogin ? (
        <MainLayout>
            <Outlet />
        </MainLayout>
    ) : (
        <Navigate to={loginPath} />
    );
};
