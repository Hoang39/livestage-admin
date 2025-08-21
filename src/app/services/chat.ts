import ENDPOINTS from "@/api/EndPoints";
import liveApi from "@/api/liveApi";
import { liveParams } from "@/api/params";
import { ChatTokenReq, ChatToken } from "@/interfaces/chat";
import { Response } from "@/interfaces/common";
import axios from "axios";

export const ChatService = {
    fetchChatHistory: (params: any) =>
        axios({
            method: "GET",
            url: `${__LIVE_API_URL__}/${ENDPOINTS.FETCH_CHAT_HISTORY}?shop=${params.shop}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
            headers: {
                apiKey: __API_KEY__,
            },
        }),

    fetchChatToken: (params: ChatTokenReq) => {
        return liveApi.post<ChatTokenReq, Response<ChatToken[]>>(
            ENDPOINTS.FETCH_CHAT_TOKEN,
            liveParams(params)
        );
    },

    deleteUserChat: (params: any) =>
        axios({
            method: "DELETE",
            url: `${__LIVE_API_URL__}/${ENDPOINTS.DELETE_USER_CHAT}`,
            data: { JSON: JSON.stringify(params), PLATFORM: "CMS_SHOP" },
            headers: {
                apiKey: __API_KEY__,
                "Content-Type": "text/plain;charset=UTF-8",
            },
            transformRequest: function (obj) {
                const str = [];
                for (const p in obj)
                    str.push(
                        encodeURIComponent(p) + "=" + encodeURIComponent(obj[p])
                    );
                return str.join("&");
            },
        }),
};
