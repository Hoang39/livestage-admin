import i18n from "i18next";
// Bindings for React: allow components to
// re-render when language changes.
import { initReactI18next } from "react-i18next";

import vi from "@locales/vi.json";
import en from "@locales/en.json";
import ko from "@locales/ko.json";

export const convertKey = {
    en: "en_US",
    vi: "vi_VN",
    ko: "ko_KR",
};

export const getConvertKey = (key: string) => {
    return convertKey[key as "en" | "vi" | "ko"] || "en_US";
};

i18n
    // Add React bindings as a plugin.
    .use(initReactI18next)
    // Initialize the i18next instance.
    .init({
        // Config options

        // Specifies the default language (locale) used
        // when a user visits our site for the first time.
        // We use English here, but feel free to use
        // whichever locale you want.
        lng: "en",

        // Fallback locale used when a translation is
        // missing in the active locale. Again, use your
        // preferred locale here.
        fallbackLng: "en",

        // Enables useful output in the browser’s
        // dev console.
        debug: false,

        // Normally, we want `escapeValue: true` as it
        // ensures that i18next escapes any code in
        // translation messages, safeguarding against
        // XSS (cross-site scripting) attacks. However,
        // React does this escaping itself, so we turn
        // it off in i18next.
        interpolation: {
            escapeValue: false,
        },

        // Translation messages. Add any languages
        // you want here.
        resources: {
            // English
            en,
            // Vietnamese
            vi,
            // Korean
            ko,
        },
    });

export default i18n;
