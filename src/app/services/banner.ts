import liveApi from "@api/liveApi";
import {
    Banner,
    BannerDReq,
    BannerIReq,
    BannerReq,
    BannerUFileReq,
    BannerUReq,
} from "@/interfaces/banner";
import { Response } from "@/interfaces/common";
import { liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";

const BannerService = {
    fetchBanners: (params: BannerReq) => {
        return liveApi.post<BannerReq, Response<Banner[]>>(
            ENDPOINTS.GET_BANNER_LIST,
            liveParams(params)
        );
    },

    insertBanners: (params: BannerIReq) => {
        return liveApi.post<BannerIReq, any>(
            ENDPOINTS.INSERT_BANNER_LIST,
            liveParams(params)
        );
    },

    updateBanners: (params: BannerUReq) => {
        return liveApi.post<BannerUReq, any>(
            ENDPOINTS.UPDATE_BANNER_LIST,
            liveParams(params)
        );
    },

    updateBannerFile: (params: BannerUFileReq) => {
        return liveApi.post<BannerUFileReq, any>(
            ENDPOINTS.UPDATE_BANNER_FILE,
            liveParams(params)
        );
    },

    deleteBanners: (params: BannerDReq) => {
        return liveApi.post<BannerDReq, any>(
            ENDPOINTS.DELETE_BANNER_LIST,
            liveParams(params)
        );
    },
};

export { BannerService };
