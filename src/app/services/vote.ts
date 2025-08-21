import ENDPOINTS from "@/api/EndPoints";
import liveApi from "@/api/liveApi";
import { liveParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import {
    Rank,
    RankReq,
    Vote,
    VoteAccountReq,
    VoteDetail,
    VoteDetailReq,
    VoteDReq,
    VoteReq,
} from "@/interfaces/vote";

export const VoteService = {
    fetchVoteList: (params: VoteReq) => {
        return liveApi.post<VoteReq, Response<Vote[]>>(
            ENDPOINTS.FETCH_VOTE_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_LIST_S",
                PARAMETER: params,
            })
        );
    },

    fetchVoteDetail: (params: VoteDetailReq) => {
        return liveApi.post<VoteDetailReq, Response<VoteDetail[]>>(
            ENDPOINTS.FETCH_VOTE_DETAIL,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_LIST_S",
                PARAMETER: params,
            })
        );
    },

    fetchRankList: (params: RankReq) => {
        return liveApi.post<RankReq, Response<Rank[]>>(
            ENDPOINTS.FETCH_RANK_LIST,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_LIST_S",
                PARAMETER: params,
            })
        );
    },

    fetchConfigList: () => {
        return liveApi.post<any, any>(
            ENDPOINTS.FETCH_CONFIG_LIST,
            liveParams({
                REQUEST_ID: "",
                PARAMETER: {},
            })
        );
    },

    insertVote: (params: any) => {
        return liveApi.post<any, any>(
            ENDPOINTS.INSERT_VOTE,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_I",
                PARAMETER: params,
            })
        );
    },

    updateVote: (params: any) => {
        return liveApi.post<any, any>(
            ENDPOINTS.UPDATE_VOTE,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_U",
                PARAMETER: params,
            })
        );
    },

    deleteVote: (params: VoteDReq) => {
        return liveApi.post<VoteDReq, any>(
            ENDPOINTS.DELETE_VOTE,
            liveParams({
                REQUEST_ID: "S|IDOL_INTERLOCK.EVENT_CONFIRM_D",
                PARAMETER: params,
            })
        );
    },

    updateVoteAccount: (params: VoteAccountReq) => {
        return liveApi.post<VoteAccountReq, any>(
            ENDPOINTS.UPDATE_VOTE_ACCOUNT,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_EVENT_U",
                PARAMETER: params,
            })
        );
    },
};
