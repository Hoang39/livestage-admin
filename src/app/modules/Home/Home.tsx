import { defaultPath } from "@configs/routeConfig";
import { Navigate } from "react-router";

export const Home: React.FC = () => {
    return <Navigate to={defaultPath} />;
};
