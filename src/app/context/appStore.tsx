import { createContext } from "react";

import { createAppStore } from "@store/appStore";

export type AppStoreApi = ReturnType<typeof createAppStore>;

export const AppStoreContext = createContext<AppStoreApi | undefined>(
    undefined
);
