import beaconApi from "@api/beaconApi";
import { commonParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Place, PlaceReq } from "@/interfaces/beaconManager";
import { Response } from "@/interfaces/common";

const BeaconManagerService = {
    fetchComToPlaceAll: (params: PlaceReq) => {
        return beaconApi.post<PlaceReq, Response<Place[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|STATICS.COM_TO_PLACE_ALL_S", params)
        );
    },
};

export { BeaconManagerService };
