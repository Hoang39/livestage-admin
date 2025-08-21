import Cookies from "js-cookie";

export const getDataFromPayload = function (payload: any) {
    if (!payload) return null;

    if (200 == payload.status) {
        let idx = 0;

        if (payload.data.ROWS && payload.data.ROWS[idx]) {
            let row = payload.data.ROWS[idx];

            if (row && 200 == row.RESULT_CODE) {
                return payload.data.ROWS.length > 1 ? payload.data.ROWS : row;
            } else {
                throw new Error(row.RESULT_MSG);
            }
        } else {
            let row = payload.data;
            if (row && 200 == row.RESULT_CODE) {
                return row;
            } else {
                throw new Error(row.RESULT_MSG);
            }
        }
    }
    return null;
};
export const getDataFromPayloadRestful = function (payload: any) {
    if (!payload) return null;

    if ("200" == payload.RESULT_CODE) {
        return payload.RESULT_DATA;
    } else {
        alert(
            "An error occurred during query. (" +
                payload.RESULT_CODE +
                ":" +
                payload.RESULT_MSG +
                ")"
        );
    }
    return null;
};

export const translateContent = (content: string) => {
    try {
        const parsedKey = JSON.parse(content);
        if (typeof parsedKey === "object" && parsedKey !== null) {
            const lang = Cookies.get("cipLang") || "en_US";

            if (!content || !lang) {
                return "";
            }

            const contentObj = JSON.parse(content);
            if (contentObj[lang] == undefined) {
                return content || "[Content Error]";
            }
            return contentObj[lang];
        }
    } catch {
        /* empty */
    }

    const parts = content.split("::");
    return parts.length > 1 ? parts.slice(1).join("::") : content;
};

export const translateContentByLocale = (content: string, lang: string) => {
    try {
        const parsedKey = JSON.parse(content);
        if (typeof parsedKey === "object" && parsedKey !== null) {
            if (!content || !lang) {
                return "";
            }

            const contentObj = JSON.parse(content);
            if (contentObj[lang] == undefined) {
                return content || "[Content Error]";
            }
            return contentObj[lang];
        }
    } catch {
        /* empty */
    }

    const parts = content.split("::");
    return parts.length > 1 ? parts.slice(1).join("::") : content;
};
