import liveApi from "@api/liveApi";
import ENDPOINTS from "@/api/EndPoints";

export const TranslateService = {
    translateText: (params: any) => {
        return liveApi.get<any, any>(
            ENDPOINTS.TRANSLATE_TEXT + new URLSearchParams(params).toString()
        );
    },
};
