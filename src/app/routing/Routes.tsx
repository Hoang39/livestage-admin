import { FC } from "react";
import { Route, Routes as Router } from "react-router-dom";
import { Home } from "@modules/Home";
import { Login } from "@modules/Login";
import { routeConfig } from "@configs/routeConfig";
import { AuthRoutes } from "./AuthRoutes";
import { PrivateRoutes } from "./PrivateRoutes";

const Routes: FC = () => {
    return (
        <Router>
            <Route index element={<Home />} />

            <Route element={<PrivateRoutes />}>
                {routeConfig.map((route, index) => {
                    if (!route.items && route.element) {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={<route.element />}
                            />
                        );
                    }

                    return (
                        <Route key={index} path={route.path}>
                            {route.items?.map((subRoute) => {
                                if (subRoute.element) {
                                    return (
                                        <Route
                                            key={subRoute.key}
                                            path={subRoute.path}
                                            element={
                                                <subRoute.element
                                                    {...subRoute.props}
                                                />
                                            }
                                        />
                                    );
                                }
                                return null;
                            })}
                        </Route>
                    );
                })}
            </Route>

            <Route path="auth" element={<AuthRoutes />}>
                <Route path="login" element={<Login />} />
            </Route>
            <Route path="/error" element={<div>Error page</div>} />
            <Route path="*" element={<div>Not found</div>} />
        </Router>
    );
};

export { Routes };
