import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import "./Login.scss";
import { useState } from "react";
import { AuthService } from "@services/auth";
import { authStorage } from "@services/authStorage";
import { defaultPath } from "@configs/routeConfig";
import { useNavigate } from "react-router";
import { useAppStore } from "@/hooks/useAppStore";
import logo from "@/assets/login_bg.jpg";
import account from "@/assets/account.svg";

export const Login = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [form] = Form.useForm();

    const { setUserInfo } = useAppStore((state) => state);

    const onFinish = async (values: unknown) => {
        console.log("🚀 ~ onFinish ~ values:", values);
        setIsLoading(true);

        try {
            const loginRes = await AuthService.login({
                USERID: (values as { username: string }).username,
                PWD: (values as { password: string }).password,
                REMARK: "",
            });

            if (loginRes.RESULT_DATA && loginRes.RESULT_DATA[0]) {
                const resultData = loginRes.RESULT_DATA[0];

                // Save token to local storage
                authStorage.setAuthKey(resultData.AUTH_KEY);

                authStorage.setUserInfo(resultData);

                setUserInfo(resultData);

                navigate(defaultPath);
            }
        } catch (error) {
            console.error("🚀 ~ onFinish ~ error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login" style={{ backgroundImage: `url(${logo})` }}>
            <div className="login-overlay"></div>
            <div className="login-form-container">
                <Form
                    name="normal_login"
                    className="login-form"
                    form={form}
                    initialValues={{
                        remember: true,
                        username: "dev",
                        password: "123",
                    }}
                    onFinish={onFinish}
                >
                    <div className="login-header">
                        <div className="login-logo-container">
                            <img
                                src={account}
                                alt="Account icon"
                                className="login-logo"
                            />
                        </div>
                        <h2 className="login-title">Login Account</h2>
                    </div>

                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Username!",
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <UserOutlined className="site-form-item-icon" />
                            }
                            placeholder="Username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Password!",
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <LockOutlined className="site-form-item-icon" />
                            }
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            loading={isLoading}
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                        >
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
