import ENDPOINTS from "@/api/EndPoints";
import liveApi from "@/api/liveApi";
import { liveParams } from "@/api/params";
import {
    Artist,
    ArtistIReq,
    ArtistReq,
    ArtistUReq,
    CategoryArtist,
    CategoryArtistReq,
} from "@/interfaces/artist";
import { Response } from "@/interfaces/common";

export const ArtistService = {
    fetchArtistList: (params: ArtistReq) => {
        return liveApi.post<ArtistReq, Response<Artist[]>>(
            ENDPOINTS.FETCH_ARTIST_LIST,
            liveParams({
                REQUEST_ID: "S|USER.ACCOUNT_ALL_S",
                PARAMETER: params,
            })
        );
    },

    fetchCategoryArtist: (params: CategoryArtistReq) => {
        return liveApi.post<CategoryArtistReq, Response<CategoryArtist[]>>(
            ENDPOINTS.FETCH_CATEGORY_ARTIST,
            liveParams(params)
        );
    },

    insertArtist: (params: ArtistIReq) => {
        return liveApi.post<ArtistIReq, any>(
            ENDPOINTS.INSERT_ARTIST,
            liveParams({
                REQUEST_ID: "S|USER.IDOL_I",
                PARAMETER: params,
            })
        );
    },

    updateArtist: (params: ArtistUReq) => {
        return liveApi.post<ArtistUReq, any>(
            ENDPOINTS.UPDATE_ARTIST,
            liveParams({
                REQUEST_ID: "S|USER.ACCOUNT_U",
                PARAMETER: params,
            })
        );
    },
};
