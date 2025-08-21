import { useTranslation } from "react-i18next";
import { getConvertKey } from "@libs/i18n/config";

export const useTranslate = () => {
    const { i18n } = useTranslation();
    const language = i18n.language;

    const renderContent = (content: string) => {
        let currentLanguage = getConvertKey(language);

        if (!content || !currentLanguage) {
            return "";
        }
        try {
            let contentObj = JSON.parse(content);
            if (contentObj[currentLanguage] === undefined) {
                return content || "[Content Error]";
            }
            return contentObj[currentLanguage];
        } catch (error) {
            return content || "[Content Error]";
        }
    };

    return { renderContent };
};
