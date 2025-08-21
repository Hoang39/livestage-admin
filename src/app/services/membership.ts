import { commonParams, liveParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";
import {
    GrantUserMembershipReq,
    Member,
    MemberReport,
    MemberReq,
    Membership,
    MembershipReq,
    MembershipUReq,
} from "@/interfaces/membership";
import beaconApi from "@/api/beaconApi";
import liveApi from "@/api/liveApi";

const MembershipService = {
    fetchMembershipReq: (params: MembershipReq) => {
        return beaconApi.post<MembershipReq, Response<Membership[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.MEMBERSHIP_S", params)
        );
    },

    updateMembershipReq: (params: MembershipUReq) => {
        return beaconApi.post<MembershipUReq, any>(
            ENDPOINTS.COMMON,
            commonParams("S|COMMON.MEMBERSHIP_U", params)
        );
    },

    fetchMemberUser: (params: MemberReq) => {
        return beaconApi.post<MemberReq, Response<Member[]>>(
            ENDPOINTS.FETCH_MEMBER,
            liveParams(params)
        );
    },

    fetchReportMember: () => {
        return beaconApi.post<null, Response<MemberReport[]>>(
            ENDPOINTS.FETCH_REPORT_MEMBER,
            liveParams({})
        );
    },

    grantUserMembership: (params: GrantUserMembershipReq) => {
        return liveApi.post<GrantUserMembershipReq, any>(
            ENDPOINTS.GRANT_USER_MEMBERSHIP,
            liveParams({ USERS: [params] })
        );
    },
};

export { MembershipService };
