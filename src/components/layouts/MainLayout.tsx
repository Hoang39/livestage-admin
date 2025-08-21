import { Layout, theme } from "antd";
import { Breadcrumb } from "./Breadcrumb";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const { Content, Footer } = Layout;

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar />
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        backgroundColor: colorBgContainer,
                    }}
                />
                <Content style={{ margin: "0 32px", overflow: "auto" }}>
                    <Breadcrumb />
                    <div
                        style={{
                            minHeight: 360,
                            // background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: "center" }}></Footer>
            </Layout>
        </Layout>
    );
};
