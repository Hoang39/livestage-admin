const ENDPOINTS = {
    COMMON: `/common`,
    WEB_LOGIN: `/webLogin`,

    SAVE_ORDER: "order/update2",

    UPLOAD_FILE: "ciplive/v1/file/cms/upload/url",
    RESOURCE_FILE: "ciplive/v1/file/resource/upload/url",

    GETTRACKINGCOMPANY: "https://info.sweettracker.co.kr/api/v1/companylist?",

    GET_PLACE_LIST: (comId: number) => `/company/v1/fetch/place/${comId}`,

    GET_BANNER_LIST: "ciplive/v1/backend/live/banner",
    INSERT_BANNER_LIST: "ciplive/v1/backend/live/banner/insert",
    UPDATE_BANNER_LIST: "ciplive/v1/backend/live/banner/update",
    DELETE_BANNER_LIST: "ciplive/v1/backend/live/banner/delete",
    UPDATE_BANNER_FILE: "ciplive/v1/backend/live/banner/file/update",

    GET_BROADCAST: "ciplive/v1/backend/live/all",
    INSERT_BROADCAST: "ciplive/v1/backend/live/register",
    UPDATE_BROADCAST: "ciplive/v1/backend/live/update",

    SEND_GOODS: "ciplive/v1/backend/goods",

    FETCH_MEMBER: "cms/v1/member/list",
    FETCH_REPORT_MEMBER: "cms/v1/member/report",

    GRANT_USER_MEMBERSHIP: "ciplive/v1/backend/user/membership/grant",

    GET_TEMPLATE_LIST: "ciplive/v1/backend/template-notification/all",
    INSERT_TEMPLATE_LIST: "ciplive/v1/backend/template-notification/insert",
    UPDATE_TEMPLATE_LIST: "ciplive/v1/backend/template-notification/update",
    DELETE_TEMPLATE_LIST: "ciplive/v1/backend/template-notification/delete",

    GET_NOTI_LIST: "ciplive/v1/backend/notification/list",
    INSERT_NOTI: "ciplive/v1/backend/notification/register",
    UPDATE_NOTI: "ciplive/v1/backend/notification/update",
    DELETE_NOTI: "ciplive/v1/backend/notification/delete",

    FETCH_REVIEWS: "ciplive/v1/backend/review/list",
    INSERT_REVIEWS: "ciplive/v1/backend/review/reply",

    TRANSLATE_TEXT: "ciplive/v1/translate/t?",

    REJECT_GOODS_SALE: "ciplive/v1/backend/seller/goods/approve",
    GRANT_USER_PERSONAL: "ciplive/v1/backend/user/seller/grant",
    FETCH_SELLER_LIST: "ciplive/v1/backend/seller/list",
    FETCH_SELLER_REVIEW_LIST: "ciplive/v1/backend/seller/review/list",
    FETCH_SELLER_GOODS_LIST: "ciplive/v1/backend/seller/goods/list",

    FETCH_BROADCAST_REPORT: "ciplive/v1/backend/live-report/all",
    FETCH_GOODS_REPORT: "ciplive/v1/backend/goods-report/all",
    FETCH_CHAT_REPORT: "ciplive/v1/backend/user-report/all",
    FETCH_USER_CLAIM_REPORT: "ciplive/v1/backend/report/user/claim",
    FETCH_USER_CHAT_REPORT: "ciplive/v1/backend/report/user/all",
    FETCH_ALL_REPORT: "ciplive/v1/backend/report/all",
    INSERT_ALL_REPORT: "ciplive/v1/backend/report/create",
    UPDATE_ALL_REPORT: "ciplive/v1/backend/report/update",
    DELETE_ALL_REPORT: "ciplive/v1/backend/report/remove",
    DELETE_LIST_ALL_REPORT: "ciplive/v1/backend/report/delete-list",
    INSERT_USER_REPORT: "ciplive/v1/backend/report/user/create",
    UPDATE_USER_REPORT: "ciplive/v1/backend/report/user/update",
    DELETE_USER_REPORT: "ciplive/v1/backend/report/user/remove",

    FETCH_USER_EVENT: "ciplive/v1/backend/idol/user-event/list",
    FETCH_USER_EVENT_DETAIL: "ciplive/v1/backend/idol/user-event/detail",
    UPDATE_USER_EVENT: "ciplive/v1/backend/idol/user-event/update",

    FETCH_ARTIST_LIST: "ciplive/v1/backend/idol/account/list",
    FETCH_CATEGORY_ARTIST: "ciplive/v1/colormall/home/category",
    INSERT_ARTIST: "ciplive/v1/backend/idol/account/insert",
    UPDATE_ARTIST: "ciplive/v1/backend/idol/account/update",

    FETCH_VOTE_LIST: "ciplive/v1/backend/idol/event/list",
    FETCH_VOTE_DETAIL: "ciplive/v1/backend/idol/event/detail",
    FETCH_RANK_LIST: "ciplive/v1/backend/idol/event/rank/list",
    FETCH_CONFIG_LIST: "ciplive/v1/backend/idol/event/config/list",
    INSERT_VOTE: "ciplive/v1/backend/idol/event/insert",
    UPDATE_VOTE: "ciplive/v1/backend/idol/event/update",
    DELETE_VOTE: "ciplive/v1/backend/idol/event/delete",
    UPDATE_VOTE_ACCOUNT: "ciplive/v1/backend/idol/event/account/insert",

    FETCH_HEART_LIST: "ciplive/v1/backend/idol/package/heart/list",
    INSERT_HEART: "ciplive/v1/backend/idol/package/heart/insert",
    UPDATE_HEART: "ciplive/v1/backend/idol/package/heart/update",
    FETCH_MISSION_CONFIG: "ciplive/v1/backend/idol/mission/config/list",
    FETCH_MISSION_LIST: "ciplive/v1/backend/idol/mission/list",
    INSERT_MISSION: "ciplive/v1/backend/idol/mission/insert",
    UPDATE_MISSION: "ciplive/v1/backend/idol/mission/update",
    FETCH_PROMOTION_LIST: "ciplive/v1/backend/idol/promotion/list",
    INSERT_PROMOTION: "ciplive/v1/backend/idol/promotion/insert",
    UPDATE_PROMOTION: "ciplive/v1/backend/idol/promotion/update",
    FETCH_PRIZE_LIST: "ciplive/v1/backend/idol/promotion/prize/list",
    UPDATE_PROMOTION_PRIZE: "ciplive/v1/backend/idol/promotion/prize/insert",

    FETCH_CHAT_HISTORY: "ciplive/v1/chat/shop/history",
    FETCH_CHAT_TOKEN: "ciplive/v1/chat/chatroom/token",
    DELETE_USER_CHAT: "ciplive/v1/chat/user/history",

    FETCH_TICKET_REVENUE: "ciplive/v1/backend/ticket/rev/list",
    FETCH_TICKET_REVENUE_CHART: "ciplive/v1/backend/ticket/rev/chart",
    FETCH_TICKET_REVENUE_LIVE: "ciplive/v1/backend/ticket/rev/live/list",
    FETCH_TICKET_REVENUE_ORDER: "ciplive/v1/backend/ticket/rev/order/list",
    CLOSE_STATEMENT_TICKET_REVENUE:
        "ciplive/v1/backend/ticket-revenue/trigger/statement",
};

export default ENDPOINTS;
