import React from "react";
import { Routes } from "./routing/Routes";
import { AppStoreProvider } from "@providers/AppStoreProvider";
import { ThemeProvider } from "@providers/ThemeProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import LocaleProvider from "./providers/LocaleProvider";

const App: React.FC = () => (
    <AppStoreProvider>
        <ThemeProvider>
            <LocaleProvider>
                <NotificationProvider>
                    <Routes />
                </NotificationProvider>
            </LocaleProvider>
        </ThemeProvider>
    </AppStoreProvider>
);

export default App;
