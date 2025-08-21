import beaconApi from "@api/beaconApi";
import ENDPOINTS from "@api/EndPoints";
import { commonParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import {
    Category,
    CategoryParamsDReq,
    CategoryParamsIReq,
    CategoryParamsReq,
    CategoryParamsUReq,
} from "@/interfaces/category";

export const CategoryService = {
    getCategoryList: (params: CategoryParamsReq) => {
        return beaconApi.post<CategoryParamsReq, Response<Category[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CATEGORY_S", params)
        );
    },

    insertCategoryList: (params: CategoryParamsIReq) => {
        return beaconApi.post<CategoryParamsIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CATEGORY_I", params)
        );
    },

    updateCategoryList: (params: CategoryParamsUReq) => {
        return beaconApi.post<CategoryParamsUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CATEGORY_U", params)
        );
    },

    deleteCategoryList: (params: CategoryParamsDReq) => {
        return beaconApi.post<CategoryParamsDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CATEGORY_D", params)
        );
    },
};
