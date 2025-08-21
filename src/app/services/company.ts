import beaconApi from "@api/beaconApi";
import ENDPOINTS from "@api/EndPoints";
import { PlaceListDataRes, PlaceListParamsReq } from "@/interfaces/business";

export const CompanyService = {
    getPlaceList: (params: PlaceListParamsReq) => {
        return beaconApi.get<PlaceListParamsReq, PlaceListDataRes>(ENDPOINTS.GET_PLACE_LIST(params.COMID));
    },
};
