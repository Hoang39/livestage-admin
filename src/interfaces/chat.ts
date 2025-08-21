export interface ChatHistory {
    stime: string;
    rid: string;
    uuid: string;
    is_notify: number;
    uid: string;
    ltime: string;
    rtype: string;
    lmesgid: string;
    reply: string;
    mesg: string;
    urmsg: number;
    uname: string;
    ruid: string;
    entry: string;
    lcstime: string;
    ctype: string;
    cstate: string;
    domain: string;
    rtitle: string;
    _id: string;
    cid: string;
}

export interface Message {
    _id: string;
    id: string;
    cid: string;
    cstate: string;
    ctype: string;
    isReact?: string;
    ltime: string;
    mesg: string;
    react: Record<string, number>;
    stime: string;
    stimets: number;
    uid: string;
    uname: string;
    uuid: string;
    time?: string;
    me?: number;
    originMesg?: string;
    img?: string;
    reply?: string;
    detail?: any;
    replyMsg?: Partial<Message>;
}

export interface ChatToken {
    AUTH_TOKEN: string;
    ROOM_TOKEN: string;
}

export type ChatTokenReq = {
    ROOM_TYPE: string;
    ROOM_ID: string;
    USER_ID: string;
};
