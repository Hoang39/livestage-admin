import { ReactNode } from "react";

import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import koKR from "antd/locale/ko_KR";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/vi";
import "dayjs/locale/ko";
import { useTranslation } from "react-i18next";

type LocaleProviderProps = {
    children: ReactNode;
};

export default function LocaleProvider({ children }: LocaleProviderProps) {
    const { i18n } = useTranslation();

    dayjs.locale(i18n.language);

    return (
        <ConfigProvider
            locale={
                i18n.language == "en"
                    ? enUS
                    : i18n.language == "vi"
                    ? viVN
                    : koKR
            }
        >
            {children}
        </ConfigProvider>
    );
}
