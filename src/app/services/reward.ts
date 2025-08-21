import ENDPOINTS from "@/api/EndPoints";
import liveApi from "@/api/liveApi";
import { liveParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import {
    Heart,
    HeartIReq,
    HeartReq,
    HeartUReq,
    Mission,
    MissionConfig,
    MissionConfigReq,
    MissionIReq,
    MissionReq,
    MissionUReq,
    Prize,
    PrizeReq,
    Promotion,
    PromotionIReq,
    PromotionPrizeUReq,
    PromotionReq,
    PromotionUReq,
} from "@/interfaces/reward";

export const RewardService = {
    fetchHeartList: (params: HeartReq) => {
        return liveApi.post<HeartReq, Response<Heart[]>>(
            ENDPOINTS.FETCH_HEART_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.HEART_PACKAGE_LIST_S",
                PARAMETER: params,
            })
        );
    },

    insertHeart: (params: HeartIReq) => {
        return liveApi.post<HeartIReq, any>(
            ENDPOINTS.INSERT_HEART,
            liveParams({
                REQUEST_ID: "IDOL.HEART_PACKAGE_I",
                PARAMETER: params,
            })
        );
    },

    updateHeart: (params: HeartUReq) => {
        return liveApi.post<HeartUReq, any>(
            ENDPOINTS.UPDATE_HEART,
            liveParams({
                REQUEST_ID: "IDOL.HEART_PACKAGE_U",
                PARAMETER: params,
            })
        );
    },

    fetchMissionConfig: (params: MissionConfigReq) => {
        return liveApi.post<MissionConfigReq, Response<MissionConfig[]>>(
            ENDPOINTS.FETCH_MISSION_CONFIG,
            liveParams({
                REQUEST_ID: "S|IDOL.MISSION_CONFIG_S",
                PARAMETER: params,
            })
        );
    },

    fetchMissionList: (params: MissionReq) => {
        return liveApi.post<MissionReq, Response<Mission[]>>(
            ENDPOINTS.FETCH_MISSION_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.MISSIONLIST_S",
                PARAMETER: params,
            })
        );
    },

    insertMission: (params: MissionIReq) => {
        return liveApi.post<MissionIReq, any>(
            ENDPOINTS.INSERT_MISSION,
            liveParams({
                REQUEST_ID: "S|IDOL.MISSION_I",
                PARAMETER: params,
            })
        );
    },

    updateMission: (params: MissionUReq) => {
        return liveApi.post<MissionUReq, any>(
            ENDPOINTS.UPDATE_MISSION,
            liveParams({
                REQUEST_ID: "S|IDOL.MISSION_U",
                PARAMETER: params,
            })
        );
    },

    fetchPromotionList: (params: PromotionReq) => {
        return liveApi.post<PromotionReq, Response<Promotion[]>>(
            ENDPOINTS.FETCH_PROMOTION_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_PROMOTION_LIST_S",
                PARAMETER: params,
            })
        );
    },

    insertPromotion: (params: PromotionIReq) => {
        return liveApi.post<PromotionIReq, any>(
            ENDPOINTS.INSERT_PROMOTION,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_PROMOTION_I",
                PARAMETER: params,
            })
        );
    },

    updatePromotion: (params: PromotionUReq) => {
        return liveApi.post<PromotionUReq, any>(
            ENDPOINTS.UPDATE_PROMOTION,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_PROMOTION_U",
                PARAMETER: params,
            })
        );
    },

    fetchPrizeList: (params: PrizeReq) => {
        return liveApi.post<PrizeReq, Response<Prize[]>>(
            ENDPOINTS.FETCH_PRIZE_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_PROMOTION_I",
                PARAMETER: params,
            })
        );
    },

    updatePromotionPrize: (params: PromotionPrizeUReq) => {
        return liveApi.post<PromotionPrizeUReq, any>(
            ENDPOINTS.UPDATE_PROMOTION_PRIZE,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_PRIZE_I",
                PARAMETER: params,
            })
        );
    },
};
