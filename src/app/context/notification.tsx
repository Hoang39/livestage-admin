import { createContext, useContext } from "react";

import { NotificationConfig } from "antd/es/notification/interface";

export type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContextType {
    openNotification: (
        type: NotificationType,
        message: string,
        description?: string,
        config?: NotificationConfig
    ) => void;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotificationContext must be used within a NotificationProvider"
        );
    }
    return context;
};
