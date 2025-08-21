import { useContext } from "react";

import { type AppStore } from "@store/appStore";
import { useStore } from "zustand";
import { AppStoreContext } from "@/app/context/appStore";

export const useAppStore = <T>(selector: (store: AppStore) => T) => {
    const appStoreContext = useContext(AppStoreContext);

    if (!appStoreContext) {
        throw new Error("useAppStore must be used within a AppStoreProvider");
    }

    return useStore(appStoreContext, selector);
};
