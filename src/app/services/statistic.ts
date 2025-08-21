import beaconApi from "@api/beaconApi";
import { commonParams, liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";
import {
    CloseTicketRevenueReq,
    RevenueCompany,
    RevenueCompanyReq,
    RevenueShop,
    RevenueShopIReq,
    RevenueShopReq,
    TicketRevenue,
    TicketRevenueChart,
    TicketRevenueChartReq,
    TicketRevenueLive,
    TicketRevenueLiveReq,
    TicketRevenueOrder,
    TicketRevenueOrderReq,
    TicketRevenueReq,
} from "@/interfaces/statistic";
import liveApi from "@/api/liveApi";

const StatisticsService = {
    fetchRevenueCompany: (params: RevenueCompanyReq) => {
        return beaconApi.post<RevenueCompanyReq, Response<RevenueCompany[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.REVENUE_COMPANY_S", params)
        );
    },

    fetchRevenueShop: (params: RevenueShopReq) => {
        return beaconApi.post<RevenueShopReq, Response<RevenueShop[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SHOP_REVENUE_S", params)
        );
    },

    insertRevenueShop: (params: RevenueShopIReq) => {
        return beaconApi.post<RevenueShopIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SHOP_REVENUE_S", params)
        );
    },

    fetchTicketRevenueList: (params: TicketRevenueReq) => {
        return liveApi.post<TicketRevenueReq, Response<TicketRevenue>>(
            ENDPOINTS.FETCH_TICKET_REVENUE,
            liveParams(params)
        );
    },

    fetchTicketRevenueChart: (params: TicketRevenueChartReq) => {
        return liveApi.post<
            TicketRevenueChartReq,
            Response<TicketRevenueChart>
        >(ENDPOINTS.FETCH_TICKET_REVENUE_CHART, liveParams(params));
    },

    fetchTicketRevenueLiveList: (params: TicketRevenueLiveReq) => {
        return liveApi.post<TicketRevenueLiveReq, Response<TicketRevenueLive>>(
            ENDPOINTS.FETCH_TICKET_REVENUE_LIVE,
            liveParams(params)
        );
    },

    fetchTicketRevenueOrderList: (params: TicketRevenueOrderReq) => {
        return liveApi.post<
            TicketRevenueOrderReq,
            Response<TicketRevenueOrder>
        >(ENDPOINTS.FETCH_TICKET_REVENUE_ORDER, liveParams(params));
    },

    closeStatementTicketRevenue: (params: CloseTicketRevenueReq) => {
        return liveApi.post<CloseTicketRevenueReq, any>(
            ENDPOINTS.CLOSE_STATEMENT_TICKET_REVENUE,
            liveParams(params)
        );
    },
};

export { StatisticsService };
