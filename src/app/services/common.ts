import beaconApi from "@api/beaconApi";
import {
    AuthUser,
    AuthUserReq,
    AuthUserUpdateReq,
    CommonCode,
    CommonCodeDReq,
    CommonCodeGroup,
    CommonCodeGroupDReq,
    CommonCodeGroupIReq,
    CommonCodeGroupReq,
    CommonCodeGroupUReq,
    CommonCodeIReq,
    CommonCodeReq,
    CommonCodeUReq,
    MenuItem,
    Response,
    UserImage,
    UserImageIReq,
    UserImageReq,
} from "@/interfaces/common";
import ENDPOINTS from "@api/EndPoints";
import { commonParams } from "@/api/params";
import type { GoodsListDataRes, GoodsListParamsReq } from "@/interfaces/goods";
import {
    Company,
    CompanyListDataRes,
    CompanyListParamsReq,
    Place,
    PlaceInfoReq,
    PlaceInfoRes,
} from "@/interfaces/business";
import axios from "axios";

const CommonService = {
    getGoodsList: (params: GoodsListParamsReq) => {
        return beaconApi.post<GoodsListParamsReq, GoodsListDataRes>(
            ENDPOINTS.COMMON,
            commonParams("S|GOODS.GOODS2_S", params)
        );
    },

    getMenuBar: (params: unknown) => {
        return beaconApi.post<unknown, Response<MenuItem[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.MENU_MENUBAR_S", params)
        );
    },

    getCompanyList: (params: CompanyListParamsReq) => {
        return beaconApi.post<CompanyListParamsReq, CompanyListDataRes>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_COMPANY_S", params)
        );
    },

    insertCompanyList: (params: Partial<Company>) => {
        return beaconApi.post<Partial<Company>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_COMPANY_I", params)
        );
    },

    updateCompanyList: (params: Partial<Company>) => {
        return beaconApi.post<Partial<Company>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_COMPANY_U", params)
        );
    },

    deleteCompanyList: (params: { COMID: number }) => {
        return beaconApi.post<{ COMID: number }, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_COMPANY_D", params)
        );
    },

    getPlaceInfo: (params: PlaceInfoReq) => {
        return beaconApi.post<PlaceInfoReq, PlaceInfoRes>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_PLACE_S", params)
        );
    },

    insertPlace: (params: Partial<Place>) => {
        return beaconApi.post<Partial<Place>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_PLACE_I", params)
        );
    },

    updatePlace: (params: Partial<Place>) => {
        return beaconApi.post<Partial<Place>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_PLACE_U", params)
        );
    },

    deletePlace: (params: Partial<Place>) => {
        return beaconApi.post<Partial<Place>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.BEACON_PLACE_D", params)
        );
    },

    getTrackingCompanyList: (params: { t_key: string }) => {
        return axios({
            method: "GET",
            url: `${ENDPOINTS.GETTRACKINGCOMPANY}${new URLSearchParams(
                params
            ).toString()}`,
        });
    },

    fetchCommonCode: (params: CommonCodeReq) => {
        return beaconApi.post<CommonCodeReq, Response<CommonCode[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_S", params)
        );
    },

    insertCommonCode: (params: CommonCodeIReq) => {
        return beaconApi.post<CommonCodeIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_I", params)
        );
    },

    updateCommonCode: (params: CommonCodeUReq) => {
        return beaconApi.post<CommonCodeUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_U", params)
        );
    },

    deleteCommonCode: (params: CommonCodeDReq) => {
        return beaconApi.post<CommonCodeDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_D", params)
        );
    },

    fetchCommonCodeGroup: (params: CommonCodeGroupReq) => {
        return beaconApi.post<CommonCodeGroupReq, Response<CommonCodeGroup[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_GROUP_S", params)
        );
    },

    insertCommonCodeGroup: (params: CommonCodeGroupIReq) => {
        return beaconApi.post<CommonCodeGroupIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_GROUP_I", params)
        );
    },

    updateCommonCodeGroup: (params: CommonCodeGroupUReq) => {
        return beaconApi.post<CommonCodeGroupUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_GROUP_U", params)
        );
    },

    deleteCommonCodeGroup: (params: CommonCodeGroupDReq) => {
        return beaconApi.post<CommonCodeGroupDReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.COMMONCODE_GROUP_D", params)
        );
    },

    fetchContentHtml: (key: string, lang: string) => {
        return axios.get(
            `${__RESOURCE_URL__}/static_resource/terms/${key}_${lang}.html?t=${new Date().getTime()}`
        );
    },

    fetchUserImageList: (params: UserImageReq) => {
        return beaconApi.post<UserImageReq, Response<UserImage>>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.USER_IMAGE_S", params)
        );
    },

    insertUserImageList: (params: UserImageIReq) => {
        return beaconApi.post<UserImageIReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.USER_IMAGE_I", params)
        );
    },

    deleteUserImageList: (params: Partial<UserImageIReq>) => {
        return beaconApi.post<Partial<UserImageIReq>, any>(
            ENDPOINTS.COMMON,
            commonParams("S|SERVICE.USER_IMAGE_D", params)
        );
    },

    fetchAuthUser: (params: AuthUserReq) => {
        return beaconApi.post<AuthUserReq, Response<AuthUser>>(
            ENDPOINTS.COMMON,
            commonParams("S|USER.AUTHUSER_S", params)
        );
    },

    insertAuthUser: (params: AuthUserUpdateReq) => {
        return beaconApi.post<AuthUserUpdateReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|USER.AUTHUSER_I", params)
        );
    },

    updateAuthUser: (params: AuthUserUpdateReq) => {
        return beaconApi.post<AuthUserUpdateReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|USER.AUTHUSER_U", params)
        );
    },

    deleteAuthUser: (params: AuthUserUpdateReq) => {
        return beaconApi.post<AuthUserUpdateReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|USER.AUTHUSER_D", params)
        );
    },
};

export { CommonService };
