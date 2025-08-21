import beaconApi from "@api/beaconApi";
import { commonParams, liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";
import {
    GoodsSale,
    GoodsSaleReq,
    GoodsSaleUReq,
    GrantUserPersonalReq,
    PersonalSale,
    PersonalSaleReq,
    PersonalSaleUReq,
    SellerGoodsListReq,
    SellerGoodsListRes,
    SellerList,
    SellerListReq,
    SellerReviewListReq,
    SellerReviewListRes,
} from "@/interfaces/personal";
import liveApi from "@/api/liveApi";

const PersonalService = {
    fetchPersonalSale: (params: PersonalSaleReq) => {
        return beaconApi.post<PersonalSaleReq, Response<PersonalSale[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.SELLER_S", params)
        );
    },

    updatePersonalSale: (params: PersonalSaleUReq) => {
        return beaconApi.post<PersonalSaleUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.SELLER_U", params)
        );
    },

    grantUserPersonal: (params: GrantUserPersonalReq) => {
        return liveApi.post<GrantUserPersonalReq, any>(
            ENDPOINTS.GRANT_USER_PERSONAL,
            liveParams(params)
        );
    },

    fetchGoodsSale: (params: GoodsSaleReq) => {
        return beaconApi.post<GoodsSaleReq, Response<GoodsSale[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS3_S", params)
        );
    },

    updateGoodsSale: (params: GoodsSaleUReq) => {
        return liveApi.post<GoodsSaleUReq, any>(
            ENDPOINTS.REJECT_GOODS_SALE,
            liveParams({
                REQUEST_ID: "S|USER.GOODS_APPROVAL_STATUS_U",
                PARAMETER: params,
            })
        );
    },

    fetchSellerList: (params: SellerListReq) => {
        return liveApi.post<SellerListReq, SellerList[]>(
            ENDPOINTS.FETCH_SELLER_LIST,
            liveParams(params)
        );
    },

    fetchSellerReviewList: (params: SellerReviewListReq) => {
        return liveApi.post<SellerReviewListReq, SellerReviewListRes[]>(
            ENDPOINTS.FETCH_SELLER_REVIEW_LIST,
            liveParams(params)
        );
    },

    fetchSellerGoodsList: (params: SellerGoodsListReq) => {
        return liveApi.post<SellerGoodsListReq, SellerGoodsListRes[]>(
            ENDPOINTS.FETCH_SELLER_GOODS_LIST,
            liveParams(params)
        );
    },
};

export { PersonalService };
