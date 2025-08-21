import liveApi from "@/api/liveApi";
import { liveParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import { GoodReview, GoodReviewIReq, GoodReviewReq } from "@/interfaces/review";
import ENDPOINTS from "@api/EndPoints";

export const ReviewService = {
    fetchReviewListByGoods: (params: GoodReviewReq) => {
        return liveApi.post<GoodReviewReq, Response<GoodReview[]>>(
            ENDPOINTS.FETCH_REVIEWS,
            liveParams(params)
        );
    },

    insertReviewReply: (params: GoodReviewIReq) => {
        return liveApi.post<GoodReviewIReq, any>(
            ENDPOINTS.INSERT_REVIEWS,
            liveParams(params)
        );
    },
};
