"use client";

import React from "react";

import { notification } from "antd";
import { NotificationConfig } from "antd/es/notification/interface";
import { NotificationContext, NotificationType } from "../context/notification";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (
        type: NotificationType,
        message: string,
        description?: string,
        config?: NotificationConfig
    ) => {
        api[type]({
            message,
            description,
            placement: "topRight",
            ...config,
        });
    };

    return (
        <NotificationContext.Provider value={{ openNotification }}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};
