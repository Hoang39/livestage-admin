import liveApi from "@/api/liveApi";
import { commonArrParams, commonParams, liveParams } from "@/api/params";
import {
    GoodLog,
    GoodsGroupDReq,
    GoodsGroupIReq,
    GoodsGroupListDataRes,
    GoodsGroupParamsReq,
    GoodsGroupUReq,
    GoodsIdParamsReq,
    GoodsImagesInsertParamsReq,
    GoodsInsertParamsReq,
    GoodsListDataRes,
    GoodsLiveParamsReq,
    GoodsLogParamsReq,
    GoodsOptionsAttbDReq,
    GoodsOptionsAttbIReq,
    GoodsOptionsAttbReq,
    GoodsOptionsAttbUReq,
    GoodsOptionsDParamsReq,
    GoodsOptionsIParamsReq,
    GoodsOptionsUParamsReq,
    GoodsUpdateParamsReq,
} from "@/interfaces/goods";
import { Response } from "@/interfaces/common";
import beaconApi from "@api/beaconApi";
import ENDPOINTS from "@api/EndPoints";

export const GoodService = {
    addGood: (params: GoodsInsertParamsReq) => {
        return beaconApi.post<GoodsInsertParamsReq, GoodsListDataRes>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS2_I", params)
        );
    },

    addGoodImages: (params: GoodsImagesInsertParamsReq) => {
        return beaconApi.post<GoodsImagesInsertParamsReq, any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_IMAGES_I", params)
        );
    },

    addGoodLogs: (params: GoodsIdParamsReq) => {
        return beaconApi.post<GoodsIdParamsReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS_LOG_GROUP_I", params)
        );
    },

    getGoodsImage: (params: GoodsIdParamsReq) => {
        return beaconApi.get<GoodsIdParamsReq, any>(
            `files/v1/fetch/${params.COMID}/${params.PLACEID}/${params.GOODSID}`
        );
    },

    fetchGoodsOption: function (params: GoodsIdParamsReq) {
        return beaconApi.post<GoodsIdParamsReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS_OPTION2_S", params)
        );
    },

    insertGoodsOption: function (params: GoodsOptionsIParamsReq[]) {
        return beaconApi.post<GoodsOptionsIParamsReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION2_I", params)
        );
    },

    updateGoodsOption: function (params: GoodsOptionsUParamsReq[]) {
        return beaconApi.post<GoodsOptionsUParamsReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION2_U", params)
        );
    },

    deleteGoodsOption: function (params: GoodsOptionsDParamsReq[]) {
        return beaconApi.post<GoodsOptionsDParamsReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION2_D", params)
        );
    },

    fetchGoodsOptionAttribute: function (params: GoodsOptionsAttbReq) {
        return beaconApi.post<GoodsOptionsAttbReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS_OPTION_ATTRIBUTE_S", params)
        );
    },

    insertGoodsOptionAttribute: function (params: GoodsOptionsAttbIReq[]) {
        return beaconApi.post<GoodsOptionsAttbIReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION_ATTRIBUTE_I", params)
        );
    },

    updateGoodsOptionAttribute: function (params: GoodsOptionsAttbUReq[]) {
        return beaconApi.post<GoodsOptionsAttbUReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION_ATTRIBUTE_U", params)
        );
    },

    deleteGoodsOptionAttribute: function (params: GoodsOptionsAttbDReq[]) {
        return beaconApi.post<GoodsOptionsAttbDReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_OPTION_ATTRIBUTE_D", params)
        );
    },

    fetchVariations: function (params: GoodsIdParamsReq) {
        return beaconApi.post<GoodsIdParamsReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.OPTION_GOODS_S", params)
        );
    },

    updateVariations: function (
        params: {
            OPTIONGOODSID: number;
            STOCKS: number;
        }[]
    ) {
        return beaconApi.post<any, any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.OPTION_GOODS_STOCK_U", params)
        );
    },

    updateGood: (params: GoodsUpdateParamsReq[]) => {
        return beaconApi.post<GoodsUpdateParamsReq[], GoodsListDataRes>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS2_U", params)
        );
    },

    deleteGood: (params: GoodsIdParamsReq) => {
        return beaconApi.post<GoodsIdParamsReq, GoodsListDataRes>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS2_D", params)
        );
    },

    sendLive: (params: GoodsLiveParamsReq[]) => {
        return liveApi.post<{ GOODS: GoodsLiveParamsReq[] }, any>(
            ENDPOINTS.SEND_GOODS,
            liveParams({
                GOODS: params,
            })
        );
    },

    fetchGoodsGroup: (params: GoodsGroupParamsReq) => {
        return beaconApi.post<GoodsGroupParamsReq, GoodsGroupListDataRes>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS_GROUP2_S", params)
        );
    },

    insertGoodsGroup: function (params: GoodsGroupIReq[]) {
        return beaconApi.post<GoodsGroupIReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_GROUP2_I", params)
        );
    },

    updateGoodsGroup: function (params: GoodsGroupUReq[]) {
        return beaconApi.post<GoodsGroupUReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_GROUP2_U", params)
        );
    },

    deleteGoodsGroup: function (params: GoodsGroupDReq[]) {
        return beaconApi.post<GoodsGroupDReq[], any>(
            ENDPOINTS.COMMON,
            commonArrParams("S|GOODS.GOODS_GROUP2_D", params)
        );
    },

    fetchGoodsInfoLog: function (params: GoodsLogParamsReq) {
        return beaconApi.post<GoodsLogParamsReq, Response<GoodLog[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.GOODSINFOLOG_S", params)
        );
    },
};
