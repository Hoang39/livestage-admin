import liveApi from "@api/liveApi";
import {
    Notification,
    ScheduleNotification,
    ScheduleNotificationDReq,
    ScheduleNotificationIReq,
    ScheduleNotificationUReq,
} from "@/interfaces/notification";
import { Response } from "@/interfaces/common";
import { commonParams, liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import beaconApi from "@/api/beaconApi";

const NotificationService = {
    fetchNotiList: (params: any) => {
        return liveApi.post<unknown, Response<Notification[]>>(
            ENDPOINTS.GET_NOTI_LIST,
            liveParams(params)
        );
    },

    insertNoti: (params: Partial<Notification>) => {
        return liveApi.post<Partial<Notification>, any>(
            ENDPOINTS.INSERT_NOTI,
            liveParams(params)
        );
    },

    updateNoti: (params: Partial<Notification>) => {
        return liveApi.post<Partial<Notification>, any>(
            ENDPOINTS.UPDATE_NOTI,
            liveParams(params)
        );
    },

    deleteNoti: (params: Partial<Notification>) => {
        return liveApi.post<Partial<Notification>, any>(
            ENDPOINTS.DELETE_NOTI,
            liveParams(params)
        );
    },

    fetchScheduleNotification: () => {
        return beaconApi.post<null, Response<ScheduleNotification>>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SCHEDULE_SEND_NOTIFICATION_S", {})
        );
    },

    insertScheduleNotification: (params: ScheduleNotificationIReq) => {
        return beaconApi.post<ScheduleNotificationIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SCHEDULE_SEND_NOTIFICATION_I", params)
        );
    },

    updateScheduleNotification: (params: ScheduleNotificationUReq) => {
        return beaconApi.post<ScheduleNotificationUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SCHEDULE_SEND_NOTIFICATION_U", params)
        );
    },

    deleteScheduleNotification: (params: ScheduleNotificationDReq) => {
        return beaconApi.post<ScheduleNotificationDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.SCHEDULE_SEND_NOTIFICATION_D", params)
        );
    },
};

export { NotificationService };
