import { useTranslation } from "react-i18next";
interface LocaleProps {
    page?: string;
}

export const useLocale = (props?: LocaleProps) => {
    const { t } = useTranslation("Validation");

    const page = props?.page ? props.page : "";
    const { t: tPage } = useTranslation(page);

    const translateRequiredMessage = (path: string) =>
        t("required", { path: tPage(path) });

    const translateInvalidMessage = (path: string) =>
        t("invalid", { path: tPage(path) });

    const translateLimitMessage = (path: string, min: number, max: number) =>
        t("limit", { path: tPage(path) || path, min, max });

    const translateMinMessage = (path: string, min: number) =>
        t("min", { path: tPage(path) || path, min });

    const translateDifferentMessage = (
        path: string,
        path2: string,
        type: string
    ) =>
        t("different", {
            path: tPage(path) || path,
            path2: tPage(path2) || path2,
            type,
        });

    const translateRegexMessage = (path: string) =>
        t("regex", { path: tPage(path) || path });

    const translateEmailMessage = (path: string) =>
        t("email", { path: tPage(path) || path });

    const translateConfirmPasswordMessage = (path: string) =>
        t("confirmPassword", { path: tPage(path) || path });

    return {
        translateRequiredMessage,
        translateInvalidMessage,
        translateLimitMessage,
        translateMinMessage,
        translateDifferentMessage,
        translateRegexMessage,
        translateEmailMessage,
        translateConfirmPasswordMessage,
    };
};
