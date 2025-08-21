import { liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";

import liveApi from "@/api/liveApi";
import {
    BroadcastReport,
    BroadcastReportReq,
    ReportDReq,
    ReportIReq,
    ReportListDReq,
    ReportReq,
    ReportUReq,
    Report,
    GoodsReport,
    ChatReport,
    UserClaimReport,
    UserClaimReportReq,
    UserChatReportReq,
    UserChatReport,
} from "@/interfaces/report";

const ReportService = {
    fetchBroadcastsReport: (params: BroadcastReportReq) => {
        return liveApi.post<BroadcastReportReq, Response<BroadcastReport[]>>(
            ENDPOINTS.FETCH_BROADCAST_REPORT,
            liveParams(params)
        );
    },

    fetchGoodsReport: (params: BroadcastReportReq) => {
        return liveApi.post<BroadcastReportReq, Response<GoodsReport[]>>(
            ENDPOINTS.FETCH_GOODS_REPORT,
            liveParams(params)
        );
    },

    fetchChatReport: (params: BroadcastReportReq) => {
        return liveApi.post<BroadcastReportReq, Response<ChatReport[]>>(
            ENDPOINTS.FETCH_CHAT_REPORT,
            liveParams(params)
        );
    },

    fetchUserClaimReport: (params: UserClaimReportReq) => {
        return liveApi.post<UserClaimReportReq, Response<UserClaimReport[]>>(
            ENDPOINTS.FETCH_USER_CLAIM_REPORT,
            liveParams(params)
        );
    },

    fetchUserChatReport: (params: UserChatReportReq) => {
        return liveApi.post<UserChatReportReq, Response<UserChatReport[]>>(
            ENDPOINTS.FETCH_USER_CHAT_REPORT,
            liveParams(params)
        );
    },

    fetchAllReport: (params: ReportReq) => {
        return liveApi.post<ReportReq, Response<Report[]>>(
            ENDPOINTS.FETCH_ALL_REPORT,
            liveParams(params)
        );
    },

    insertReport: (params: ReportIReq) => {
        return liveApi.post<ReportIReq, any>(
            ENDPOINTS.INSERT_ALL_REPORT,
            liveParams(params)
        );
    },

    updateReport: (params: ReportUReq) => {
        return liveApi.post<ReportUReq, any>(
            ENDPOINTS.UPDATE_ALL_REPORT,
            liveParams(params)
        );
    },

    removeReport: (params: ReportDReq) => {
        return liveApi.post<ReportDReq, any>(
            ENDPOINTS.DELETE_ALL_REPORT,
            liveParams(params)
        );
    },

    deleteListReports: (params: ReportListDReq) => {
        return liveApi.post<ReportListDReq, any>(
            ENDPOINTS.DELETE_LIST_ALL_REPORT,
            liveParams(params)
        );
    },

    insertUserReport: (params: ReportIReq) => {
        return liveApi.post<ReportIReq, any>(
            ENDPOINTS.INSERT_USER_REPORT,
            liveParams(params)
        );
    },

    updateUserReport: (params: ReportUReq) => {
        return liveApi.post<ReportUReq, any>(
            ENDPOINTS.UPDATE_USER_REPORT,
            liveParams(params)
        );
    },

    removeUserReport: (params: ReportDReq) => {
        return liveApi.post<ReportDReq, any>(
            ENDPOINTS.DELETE_USER_REPORT,
            liveParams(params)
        );
    },
};

export { ReportService };
