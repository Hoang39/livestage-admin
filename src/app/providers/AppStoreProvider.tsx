import { type ReactNode, useRef } from "react";

import { createAppStore, initAppStore } from "@store/appStore";
import { AppStoreApi, AppStoreContext } from "../context/appStore";

export interface AppStoreProviderProps {
    children: ReactNode;
}

export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
    const storeRef = useRef<AppStoreApi>();

    if (!storeRef.current) {
        storeRef.current = createAppStore(initAppStore());
    }

    return (
        <AppStoreContext.Provider value={storeRef.current}>
            {children}
        </AppStoreContext.Provider>
    );
};
