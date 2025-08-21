import { commonParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import {
    Coupon,
    CouponDReq,
    CouponIReq,
    CouponReq,
    CouponStatistics,
    CouponStatisticsReq,
    CouponUReq,
} from "@/interfaces/coupon";
import beaconApi from "@api/beaconApi";
import ENDPOINTS from "@api/EndPoints";

export const CouponService = {
    fetchCoupon: (params: CouponReq) => {
        return beaconApi.post<CouponReq, Response<Coupon[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CP_S", params)
        );
    },

    fetchCouponStatistics: (params: CouponStatisticsReq) => {
        return beaconApi.post<
            CouponStatisticsReq,
            Response<CouponStatistics[]>
        >(ENDPOINTS.COMMON, commonParams("S|COMMON.CP_STATISTICS_S", params));
    },

    insertCoupon: (params: CouponIReq) => {
        return beaconApi.post<CouponIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CP_I", params)
        );
    },

    updateCoupon: (params: CouponUReq) => {
        return beaconApi.post<CouponUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CP_U", params)
        );
    },

    deleteCoupon: (params: CouponDReq) => {
        return beaconApi.post<CouponDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.CP_D", params)
        );
    },
};
