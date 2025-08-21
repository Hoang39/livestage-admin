import beaconApi from "@api/beaconApi";
import { commonParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";
import { Member } from "@/interfaces/member";

const MemberService = {
    fetchMember: (params: { MEMNAME: string }) => {
        return beaconApi.post<{ MEMNAME: string }, Response<Member[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|USER.MEMBER_S", params)
        );
    },
};

export { MemberService };
