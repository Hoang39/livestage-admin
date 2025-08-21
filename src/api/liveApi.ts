import { loginPath } from "@configs/routeConfig";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { redirect } from "react-router-dom";
import { getDataFromPayload } from "@/utils/handleResponse";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// DEBUG
const isDebug = import.meta.env.MODE !== "production";

const ApiClient = axios.create({
    // timeout: 5000,
    baseURL: __LIVE_API_URL__,
    headers: {
        apiKey: __API_KEY__,
    },
});

const transformFormUrlEncoded = (data: any): string => {
    const str: string[] = [];
    for (const p in data) {
        if (Object.prototype.hasOwnProperty.call(data, p)) {
            str.push(`${encodeURIComponent(p)}=${encodeURIComponent(data[p])}`);
        }
    }
    return str.join("&");
};

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
    function (config: CustomAxiosRequestConfig) {
        if (isDebug) {
            console.log("Request:", config);
        }

        // Apply form-urlencoded transformation if specified
        if (config.data) {
            config.data = transformFormUrlEncoded(config.data);
        }

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

        return response?.data ? getDataFromPayload(response) : null;
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
