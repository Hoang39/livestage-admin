import liveApi from "@/api/liveApi";
import { commonParams, liveParams } from "@/api/params";
import { Response } from "@/interfaces/common";
import {
    EventReq,
    Event,
    EventIReq,
    EventUReq,
    EventDReq,
    UserEvent,
    UserEventReq,
    UserEventDetailReq,
    UserEventDetail,
    UserEventUReq,
} from "@/interfaces/event";
import beaconApi from "@api/beaconApi";
import ENDPOINTS from "@api/EndPoints";

export const EventService = {
    fetchEventList: (params: EventReq) => {
        return beaconApi.post<EventReq, Response<Event[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.GOLD_EVENT_S", params)
        );
    },

    insertEvent: (params: EventIReq) => {
        return beaconApi.post<EventIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.GOLD_EVENT_I", params)
        );
    },

    updateEvent: (params: EventUReq) => {
        return beaconApi.post<EventUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.GOLD_EVENT_U", params)
        );
    },

    deleteEvent: (params: EventDReq) => {
        return beaconApi.post<EventDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.GOLD_EVENT_D", params)
        );
    },

    fetchUserEventList: (params: UserEventReq) => {
        return liveApi.post<UserEventReq, Response<UserEvent[]>>(
            ENDPOINTS.FETCH_USER_EVENT,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_USER_EVENT_LIST_S",
                PARAMETER: params,
            })
        );
    },

    fetchUserEventDetails: (params: UserEventDetailReq) => {
        return liveApi.post<UserEventDetailReq, Response<UserEventDetail[]>>(
            ENDPOINTS.FETCH_USER_EVENT_DETAIL,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_USER_EVENT_S",
                PARAMETER: params,
            })
        );
    },

    updateUserEvent: (params: UserEventUReq) => {
        return liveApi.post<UserEventUReq, any>(
            ENDPOINTS.UPDATE_USER_EVENT,
            liveParams({
                REQUEST_ID: "S|IDOL.INTERLOCK_USER_EVENT_U",
                PARAMETER: params,
            })
        );
    },
};
