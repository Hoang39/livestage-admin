const AUTH_KEY = "auth_key";
const USER_INFO = "user_info";

export const authStorage = {
    setUserInfo: (userInfo: any) => {
        localStorage.setItem(USER_INFO, JSON.stringify(userInfo));
    },
    getUserInfo: () => {
        const userInfo = localStorage.getItem(USER_INFO);
        return userInfo ? JSON.parse(userInfo) : null;
    },

    setAuthKey(authKey: string): void {
        localStorage.setItem(AUTH_KEY, authKey);
    },
    getAuthKey(): string | null {
        return localStorage.getItem(AUTH_KEY);
    },
    clearAll(): void {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_INFO);
    },
    isLogin(): boolean {
        return !!localStorage.getItem(AUTH_KEY);
    },
};
