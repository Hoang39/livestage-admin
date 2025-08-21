import liveApi from "@api/liveApi";
import { Broadcast } from "@/interfaces/broadcast";
import { Response } from "@/interfaces/common";
import { liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";

const BroadcastService = {
    fetchBroadcasts: (params: any) => {
        return liveApi.post<unknown, Response<Broadcast[]>>(
            ENDPOINTS.GET_BROADCAST,
            liveParams(params)
        );
    },

    insertBroadcasts: (params: Partial<Broadcast>) => {
        return liveApi.post<Partial<Broadcast>, any>(
            ENDPOINTS.INSERT_BROADCAST,
            liveParams(params)
        );
    },

    updateBroadcasts: (params: Partial<Broadcast>) => {
        return liveApi.post<Partial<Broadcast>, any>(
            ENDPOINTS.UPDATE_BROADCAST,
            liveParams(params)
        );
    },
};

export { BroadcastService };
