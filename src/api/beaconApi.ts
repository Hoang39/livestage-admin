import { authStorage } from "@services/authStorage";
import { loginPath } from "@configs/routeConfig";
import axios, { AxiosError } from "axios";
import { redirect } from "react-router-dom";
import { getDataFromPayload } from "@/utils/handleResponse";

// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//     _retry?: boolean;
// }

// DEBUG
const isDebug = import.meta.env.MODE !== "production";
const APP_ID = __APP_ID__;
const DEV_UUID = __DEV_UUID__;

const ApiClient = axios.create({
    // timeout: 5000,
    baseURL: __BEACON_API_URL__,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;  charset=UTF-8",
        appId: APP_ID,
        devUuid: DEV_UUID,
    },
});

// let isRefreshing = false; // Flag to keep track of the token refresh status
// let failedQueue: any = []; // An array to keep track of the failed requests

// Function to refresh token
// const processQueue = (error: any, token: string | null = null) => {
//     failedQueue.forEach((prom: any) => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve(token);
//         }
//     });
//     failedQueue = [];
// };

// Add a request interceptor
ApiClient.interceptors.request.use(
    function (config) {
        if (isDebug) {
            // can output log here
        }

        // Do something before the request is sent
        const authKey = authStorage.getAuthKey(); // Retrieve auth token from localStorage

        config.headers.authKey = authKey || "AUTH_KEY";

        return config;
    },
    function (error) {
        // Handle the error
        return Promise.reject(error);
    }
);

// Add a response interceptor
ApiClient.interceptors.response.use(
    async function (response) {
        // Do something with the response data
        if (isDebug) {
            // can output log here
            // console.log('Response:', response);
        }

        if (response.data?.status === 401) {
            // Redirect to login page
            redirect(loginPath);
        }

        return getDataFromPayload(response);
    },
    async function (error: AxiosError) {
        // Handle the response error
        // if (isDebug) {
        // }

        // const originalRequest = error.config as CustomAxiosRequestConfig;

        // if (error.response?.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true; // Add this to prevent infinite loop

        //     if (!isRefreshing) {
        //         isRefreshing = true;

        //         try {
        //             const refreshToken = localStorage.getItem("refresh-token");
        //             if (!refreshToken) {
        //                 throw new Error("No refresh token available");
        //             }

        //             // Call the refresh token API
        //             const response = await userService.userRefreshToken({
        //                 refresh: refreshToken,
        //             });

        //             if (!response.err) {
        //                 const newAccessToken = response.data.access;
        //                 const newRefreshToken = response.data.refresh;

        //                 // Update the token in local storage
        //                 localStorage.setItem("access-token", newAccessToken);
        //                 localStorage.setItem("refresh-token", newRefreshToken);

        //                 // Process the failed requests
        //                 processQueue(null, newAccessToken);
        //             } else {
        //                 // Logout the user
        //                 throw new Error(response.msg?.message || "Unknown error");
        //             }
        //         } catch (refreshError) {
        //             localStorage.removeItem("access-token");
        //             Cookies.remove("refresh-token");
        //             redirect("/login");

        //             // processQueue(refreshError, null);
        //             // return Promise.reject(refreshError);
        //         } finally {
        //             isRefreshing = false;
        //         }
        //     }

        //     // Return the promise for the original request
        //     return new Promise((resolve, reject) => {
        //         failedQueue.push({
        //             resolve: (token: string) => {
        //                 if (originalRequest.headers) {
        //                     originalRequest.headers.Authorization = `Bearer ${token}`;
        //                 }
        //                 resolve(ApiClient(originalRequest));
        //             },
        //             reject: (err: any) => reject(err),
        //         });
        //     });
        // }

        return Promise.reject(error);
    }
);

export default ApiClient;
