import liveApi from "@api/liveApi";
import { Response } from "@/interfaces/common";
import { liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Template } from "@/interfaces/template";

const TemplateService = {
    fetchAllAppTemplate: (params: any) => {
        return liveApi.post<unknown, Response<Template[]>>(
            ENDPOINTS.GET_TEMPLATE_LIST,
            liveParams(params)
        );
    },

    insertAllAppTemplate: (params: Partial<Template>) => {
        return liveApi.post<Partial<Template>, any>(
            ENDPOINTS.INSERT_TEMPLATE_LIST,
            liveParams(params)
        );
    },

    updateAllAppTemplate: (params: Partial<Template>) => {
        return liveApi.post<Partial<Template>, any>(
            ENDPOINTS.UPDATE_TEMPLATE_LIST,
            liveParams(params)
        );
    },

    deleteAllAppTemplate: (params: Partial<Template>) => {
        return liveApi.post<Partial<Template>, any>(
            ENDPOINTS.DELETE_TEMPLATE_LIST,
            liveParams(params)
        );
    },
};

export { TemplateService };
