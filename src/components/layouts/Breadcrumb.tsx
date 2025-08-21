import { Breadcrumb as BreadcrumbAnt } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { useLocation } from "react-router";
import { RouteConfig, routeConfig } from "@/configs/routeConfig";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
    title: React.ReactNode;
    path?: string;
}

interface RouteMapItem {
    title: string;
    path: string;
    parentPath?: string;
}

const buildRouteMap = (routes: RouteConfig[]): Map<string, RouteMapItem> => {
    const routeMap = new Map<string, RouteMapItem>();

    const traverseRoutes = (route: RouteConfig, parentPath: string = "") => {
        const currentPath = parentPath
            ? `${parentPath}/${route.path}`
            : route.path;

        if (route.items) {
            routeMap.set(currentPath, {
                title: route.title,
                path: currentPath,
                parentPath: parentPath || undefined,
            });
            route.items.forEach((subRoute) => {
                traverseRoutes(subRoute, currentPath);
            });
        } else {
            routeMap.set(currentPath, {
                title: route.title,
                path: currentPath,
                parentPath: parentPath || undefined,
            });
        }
    };

    routes.forEach((route) => traverseRoutes(route));
    return routeMap;
};

const routeMap = buildRouteMap(routeConfig);

export const Breadcrumb = () => {
    const { t } = useTranslation("Route");
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    const items = useMemo(() => {
        const breadcrumbItems: BreadcrumbItem[] = [
            {
                title: (
                    <Link to="/">
                        <HomeOutlined />
                    </Link>
                ),
                path: "/",
            },
        ];

        let currentPath = "";
        for (const segment of pathnames) {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;
            const route = routeMap.get(currentPath);

            if (route) {
                breadcrumbItems.push({
                    title: <Link to={route.path}>{t(route.title)}</Link>,
                    path: route.path,
                });
            } else {
                breadcrumbItems.push({
                    title: segment,
                });
            }
        }

        return breadcrumbItems;
    }, [pathnames, t]);

    return <BreadcrumbAnt style={{ margin: "16px 0" }} items={items} />;
};
