import { Dropdown, GetProps, Layout, MenuProps, Space, Avatar } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useCallback, useMemo } from "react";
import { authStorage } from "@/app/services/authStorage";
import { useNavigate } from "react-router";
import { loginPath } from "@configs/routeConfig";
import { useTranslation } from "react-i18next";
import { BusinessControl } from "../common/BusinessControll";

const { Header: HeaderAnt } = Layout;

type HeaderProps = GetProps<typeof HeaderAnt>;

export const Header = ({ style = {}, ...props }: HeaderProps) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const handleLogout = useCallback(() => {
        authStorage.clearAll();
        navigate(loginPath);
    }, [navigate]);

    const handleLanguageChange = useCallback(
        (language: string) => {
            i18n.changeLanguage(language);
        },
        [i18n]
    );

    const itemsLanguage: MenuProps["items"] = useMemo(
        () => [
            {
                key: "en",
                label: "English",
            },
            {
                key: "ko",
                label: "한국어",
            },
            {
                key: "vi",
                label: "Tiếng Việt",
            },
        ],
        []
    );

    const items: MenuProps["items"] = useMemo(
        () => [
            {
                key: "1",
                label: "My Account",
                disabled: true,
            },
            {
                type: "divider",
            },
            {
                key: "2",
                label: "Logout",
                icon: <LogoutOutlined />,
                onClick: handleLogout,
            },
        ],
        [handleLogout]
    );

    return (
        <HeaderAnt
            style={{
                ...style,
                display: "flex",
                justifyContent: "space-between",
                padding: "0 16px",
            }}
            {...props}
        >
            <BusinessControl />

            <Space>
                <Dropdown
                    menu={{
                        items: itemsLanguage,
                        selectedKeys: [i18n.language],
                        onClick: (info) => handleLanguageChange(info.key),
                    }}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space align="center">{i18n.language}</Space>
                    </a>
                </Dropdown>

                <Dropdown menu={{ items }}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <Avatar
                                size={24}
                                style={{ backgroundColor: "#87d068" }}
                                icon={<UserOutlined />}
                            />
                            Username
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </HeaderAnt>
    );
};
