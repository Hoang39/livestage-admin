import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        define: {
            __APP_NAME__: JSON.stringify(env.APP_NAME),
            __APP_ID__: JSON.stringify(env.APP_ID),
            __APP_VERSION__: JSON.stringify(env.APP_VERSION),
            __DEV_UUID__: JSON.stringify(env.DEV_UUID),
            __NO_IMAGE_URL__: JSON.stringify(env.NO_IMAGE_URL),
            __API_KEY__: JSON.stringify(env.API_KEY),
            __RESOURCE_URL__: JSON.stringify(env.RESOURCE_URL),
            __LIVE_RESOURCE_URL__: JSON.stringify(env.LIVE_RESOURCE_URL),
            __SOCKET_URL__: JSON.stringify(env.SOCKET_URL),
            __BEACON_API_URL__: JSON.stringify(env.BEACON_API_URL),
            __LIVE_API_URL__: JSON.stringify(env.LIVE_API_URL),
            __PHOTO_PATH__: JSON.stringify(env.PHOTO_PATH),
            __PHOTO_LIVE_PATH__: JSON.stringify(env.PHOTO_LIVE_PATH),
            __PHOTO_LIVE_CHAT_PATH__: JSON.stringify(env.PHOTO_LIVE_CHAT_PATH),
            __PHOTO_CHAT_PATH__: JSON.stringify(env.PHOTO_CHAT_PATH),
            __VIEW_VIDEO_URL__: JSON.stringify(env.VIEW_VIDEO_URL),
            __VOD_LINK_RESOURCE__: JSON.stringify(env.VOD_LINK_RESOURCE),
        },
        resolve: {
            alias: [
                { find: "@", replacement: path.resolve(__dirname, "src") },
                {
                    find: "@app",
                    replacement: path.resolve(__dirname, "src/app"),
                },
                {
                    find: "@providers",
                    replacement: path.resolve(__dirname, "src/app/providers"),
                },
                {
                    find: "@modules",
                    replacement: path.resolve(__dirname, "src/app/modules"),
                },
                {
                    find: "@services",
                    replacement: path.resolve(__dirname, "src/app/services"),
                },
                {
                    find: "@styles",
                    replacement: path.resolve(__dirname, "src/styles"),
                },
                {
                    find: "@store",
                    replacement: path.resolve(__dirname, "src/store"),
                },
                {
                    find: "@components",
                    replacement: path.resolve(__dirname, "src/components"),
                },
                {
                    find: "@utils",
                    replacement: path.resolve(__dirname, "src/utils"),
                },
                {
                    find: "@libs",
                    replacement: path.resolve(__dirname, "src/libs"),
                },
                {
                    find: "@locales",
                    replacement: path.resolve(__dirname, "src/locales"),
                },
                {
                    find: "@assets",
                    replacement: path.resolve(__dirname, "src/assets"),
                },
                {
                    find: "@configs",
                    replacement: path.resolve(__dirname, "src/configs"),
                },
                {
                    find: "@api",
                    replacement: path.resolve(__dirname, "src/api"),
                },
                {
                    find: "@interfaces",
                    replacement: path.resolve(__dirname, "src/interfaces"),
                },
            ],
        },
        server: {
            host: "0.0.0.0",
        },
    };
});
