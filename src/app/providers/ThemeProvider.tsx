import { ReactNode } from "react";

import { ConfigProvider } from "antd";

// import { useAppStore } from "@providers/AppStoreProvider";
import { themeConfig } from "@configs/theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // const { role } = useAppStore((state) => state);

    return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};
