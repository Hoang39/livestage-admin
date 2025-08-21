import beaconApi from "@api/beaconApi";
import { commonParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";

import type { LoginDataRes, LoginParamsReq } from "@interfaces/auth";

const AuthService = {
    login: (params: LoginParamsReq) => {
        return beaconApi.post<LoginParamsReq, LoginDataRes>(
            ENDPOINTS.WEB_LOGIN,
            commonParams("S|USER.AUTHUSER_LOGIN_S", params)
        );
    },
};

export { AuthService };
