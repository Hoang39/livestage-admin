import React, { useState, useMemo } from "react";

import type { MenuProps } from "antd";
import { Layout, Menu, Image } from "antd";
import { routeConfig } from "@configs/routeConfig";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import logo from "@/assets/logo.png";

const { Sider } = Layout;

const sideBarStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    left: 0,
    height: "100vh",
    overflowY: "auto",
};

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

export const Sidebar = () => {
    const { t } = useTranslation("Route");

    //routing handler
    let navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [collapsed, setCollapsed] = useState(false);

    const menuItems = useMemo(
        () =>
            routeConfig.map((item) =>
                getItem(
                    t(item.title),
                    item.path,
                    item.icon,
                    item.items?.map((i) =>
                        getItem(t(i.title), `${item.path}/${i.path}`)
                    )
                )
            ),
        [t]
    );

    const selectedKey = useMemo(() => {
        for (const route of routeConfig) {
            if (route.items) {
                for (const subRoute of route.items) {
                    const fullPath = `/${route.path}/${subRoute.path}`;
                    if (fullPath === currentPath) {
                        return `${route.path}/${subRoute.path}`;
                    }
                }
            }
        }
        return currentPath;
    }, [currentPath]);

    return (
        <Sider
            width={300}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={sideBarStyle}
        >
            <div
                style={{
                    width: "100%",
                    padding: "12px 24px",
                    background: "#002140",
                    position: "fixed",
                    top: 0,
                    zIndex: 99,
                }}
            >
                <Image src={logo} alt="" />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                items={menuItems}
                selectedKeys={[selectedKey]}
                onClick={(info) => {
                    navigate(info.key);
                }}
                style={{ paddingTop: "54px" }}
            />
        </Sider>
    );
};
