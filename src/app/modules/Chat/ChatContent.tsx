import { Button, Card, Input, Image } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { ChatService } from "@/app/services/chat";
import { getShopId } from "@/utils/getShopId";
import { useAppStore } from "@/hooks/useAppStore";
import { ChatHistory, Message } from "@/interfaces/chat";
import {
    HeartOutlined,
    GithubOutlined,
    SmileOutlined,
    MehOutlined,
    FrownOutlined,
    CloseOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { WebSocketService } from "@/app/services/webSocket";
import { TranslateService } from "@/app/services/translate";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import "./custom-card.scss";

const reactions = [
    { value: "heart", label: "❤️", icon: <HeartOutlined /> },
    { value: "thumb", label: "👍", icon: <GithubOutlined /> },
    { value: "laugh", label: "😂", icon: <SmileOutlined /> },
    { value: "wow", label: "😮", icon: <MehOutlined /> },
    { value: "sad", label: "😢", icon: <FrownOutlined /> },
    { value: "angry", label: "😣", icon: <CloseOutlined /> },
];

export const ChatContent = ({
    item,
    loading,
    setLoading,
}: {
    item?: ChatHistory;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tOrder } = useTranslation("Order");
    const { t: tReport } = useTranslation("Report");

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const [isLoading, setIsLoading] = useState(false);
    const [chatMessageHistory, setChatMessageHistory] = useState<Message[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [roomToken, setRoomToken] = useState<string | null>(null);
    const [chatReplyItem, setChatReplyItem] = useState<Message | null>(null);
    const [isBlockRoom, setIsBlockRoom] = useState<boolean | null>(null);
    const [chatMessage, setChatMessage] = useState<string>("");
    const [showReactionMenu, setShowReactionMenu] = useState<string | null>(
        null
    );
    const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);

    const webSocketService = useRef<WebSocketService | null>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    const resetMenusOnHover = () => {
        setShowReactionMenu(null);
        setShowOptionsMenu(null);
    };

    const toggleReactionMenu = (msgId: string) => {
        setShowReactionMenu(showReactionMenu === msgId ? null : msgId);
        setShowOptionsMenu(null);
    };

    const toggleOptionsMenu = (msgId: string) => {
        setShowOptionsMenu(showOptionsMenu === msgId ? null : msgId);
        setShowReactionMenu(null);
    };

    const selectReaction = (msgId: string, reactionValue: string) => {
        webSocketService.current?.react({
            rid: item?.rid || "",
            uid:
                currentCompany?.COMID && currentPlace?.PLACEID
                    ? getShopId(currentCompany?.COMID, currentPlace?.PLACEID)
                    : "",
            type: reactionValue,
            uuid: msgId,
        });
    };

    const resetReplyMessage = () => {
        setChatReplyItem(null);
    };

    const replyMessage = (msgId: string) => {
        const msg = chatMessageHistory.find((m) => m.id === msgId);
        if (msg) setChatReplyItem(msg);
    };

    const copyMessage = (msgId: string) => {
        const targetMsg = chatMessageHistory.find((msg) => msg.id === msgId);
        if (targetMsg) {
            let content = "";
            if (targetMsg.ctype === "C" || targetMsg.ctype === "L") {
                content = targetMsg.mesg || "";
            } else if (targetMsg.ctype === "I") {
                content = targetMsg.img || "";
            }
            navigator.clipboard
                .writeText(content)
                .then(() => alert(tCommon("CM_COPY") + "!"))
                .catch((err) => alert(`${tCommon("CM_COPY_FAILED")}: ${err}`));
        }
    };

    const translateMessage = async (msgId: string) => {
        const targetMsg = chatMessageHistory.find((msg) => msg.id === msgId);
        if (targetMsg) {
            try {
                const data = await TranslateService.translateText({
                    textToTranslate: targetMsg.mesg || "",
                    cacheYN: "N",
                    targetLang: (Cookies.get("cipLang") || "en_US").substring(
                        0,
                        2
                    ),
                });
                const result = data.RESULT_DATA[0];
                targetMsg.mesg = result.TARGET_TEXT;
                targetMsg.originMesg = result.ORIGINAL_TEXT;
                setChatMessageHistory([...chatMessageHistory]);
            } catch (error) {
                console.error("translateMessage: ", error);
            }
        }
    };

    const resetTranslate = (msgId: string) => {
        const targetMsg = chatMessageHistory.find((msg) => msg.id === msgId);
        if (targetMsg && targetMsg.originMesg) {
            targetMsg.mesg = targetMsg.originMesg;
            targetMsg.originMesg = undefined;
            setChatMessageHistory([...chatMessageHistory]);
        }
    };

    const deleteMessage = (msgId: string) => {
        const data = {
            rid: item?.rid || "",
            uid:
                currentCompany?.COMID && currentPlace?.PLACEID
                    ? getShopId(currentCompany?.COMID, currentPlace?.PLACEID)
                    : "",
            uuid: msgId,
        };
        webSocketService.current?.deleteChat(data);
    };

    const block = () => {
        const data = {
            rid: item?.rid || "",
            uid: userInfo.USERID,
            uname: userInfo.MEMNAME,
            expid:
                currentCompany?.COMID && currentPlace?.PLACEID
                    ? getShopId(currentCompany?.COMID, currentPlace?.PLACEID)
                    : "",
            expname: item?.uname || "",
            domain: "LIVESTAGE",
            reason: "has been kicked out of the chat room.",
        };
        webSocketService.current?.block(data);
        alert(tCommon("CM_SAVE"));
        handleBlockRoom();
    };

    const unBlock = async () => {
        const data = {
            rid: item?.rid || "",
            uid: userInfo.USERID,
            expid:
                currentCompany?.COMID && currentPlace?.PLACEID
                    ? getShopId(currentCompany?.COMID, currentPlace?.PLACEID)
                    : "",
            domain: "LIVESTAGE",
        };
        webSocketService.current?.unBlock(data);
        alert(tCommon("CM_SAVE"));
        await fetchToken();
    };

    const deleteChat = async () => {
        if (item) {
            try {
                await ChatService.deleteUserChat({
                    rid: item.rid,
                    uid: item.uid,
                });
                alert(tCommon("CM_SAVE"));
                setLoading(!loading);
            } catch (err) {
                console.error("deleteChat: ", err);
            }
        }
    };

    const getCtypeMsg = (msg: Message) => {
        return (
            chatMessageHistory.find((data) => data.uuid === msg.reply)
                ?.cstate === "Y"
        );
    };

    const focusLastMsg = () => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    };

    const scrollToReplyMessage = (replyUuid: string) => {
        const targetMsg = chatMessageHistory.find(
            (msg) => msg.id === replyUuid
        );
        if (targetMsg) {
            const element = document.getElementById(
                `chat-content-msg-${targetMsg.id}`
            );
            console.log({ element });
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("highlight");
                setTimeout(() => element.classList.remove("highlight"), 1000);
            }
        }
    };

    const handleMessage = useCallback(
        (msg: any) => {
            const chat = {
                ...msg,
                time: dayjs(
                    timeService.getStrDateParseFromUTC(msg.stime ?? "")
                ).format("HH:mm YYYY-MM-DD"),
                me: msg.uid === item?.uid ? 1 : 0,
            };
            try {
                switch (chat.ctype) {
                    case "G":
                    case "O":
                        chat.detail = JSON.parse(chat.mesg);
                        chat.detail.name = translateContent(
                            JSON.stringify(chat.detail.name)
                        );
                        break;
                    case "I":
                        chat.img = `${__PHOTO_CHAT_PATH__}/${item?.rid}/${chat.uuid}.jpg`;
                        break;
                }
                if (chat.replyMsg) {
                    switch (chat.replyMsg.ctype) {
                        case "G":
                        case "O":
                            chat.replyMsg.detail = JSON.parse(
                                chat.replyMsg.mesg
                            );
                            chat.replyMsg.detail.name = translateContent(
                                JSON.stringify(chat.replyMsg.detail.name)
                            );
                            break;
                        case "I":
                            chat.replyMsg.img = `${__PHOTO_CHAT_PATH__}/${item?.rid}/${chat.replyMsg.uuid}.jpg`;
                            break;
                    }
                }
                return chat;
            } catch (e) {
                console.error("handleMessage error:", e);
                return null;
            }
        },
        [item]
    );

    const sendChat = useCallback(() => {
        if (!chatMessage.trim() || !item) return;
        const data = {
            rid: item.rid,
            cid: "CH-0",
            uid:
                currentCompany?.COMID && currentPlace?.PLACEID
                    ? getShopId(currentCompany?.COMID, currentPlace?.PLACEID)
                    : "",
            uname: currentPlace?.PLACENAME || "SHOP NAME",
            icon: `AVATAR ${currentPlace?.PLACENAME}`,
            ctype: "C",
            mesg: chatMessage.trim(),
            reply: chatReplyItem?.uuid,
        };
        webSocketService.current?.sendChat(data);
        setChatMessage("");
        resetReplyMessage();
    }, [chatMessage, chatReplyItem, currentCompany, currentPlace, item]);

    const exitRoom = useCallback(() => {
        if (item && authToken) {
            webSocketService.current?.exitRoom(authToken);
        }
    }, [authToken, item]);

    const handleJoinRoomToken = useCallback(
        (_data: any) => {
            webSocketService.current?.fetchHistory({
                pg: 1,
                sz: 100,
                authToken: authToken || "",
            });
        },
        [authToken]
    );

    const handleHistory = useCallback(
        (data: any) => {
            if (data?.list?.length >= 0) {
                const history = data.list
                    .reverse()
                    .map(handleMessage)
                    .filter((m: any): m is ChatHistory => m !== null);
                setChatMessageHistory(history);
                focusLastMsg();
            }
        },
        [handleMessage]
    );

    const handleBlockRoom = () => {
        setIsBlockRoom(true);
        setChatMessageHistory([]);
    };

    const handleChat = useCallback(
        (data: any) => {
            const dataHandle = handleMessage(data);
            if (dataHandle) {
                setChatMessageHistory((prev) => [...prev, dataHandle]);
                focusLastMsg();
            }
        },
        [handleMessage]
    );

    const handleReaction = (data: any) => {
        if (data.uuid && data.react) {
            setChatMessageHistory((prev) =>
                prev.map((msg) =>
                    msg.uuid === data.uuid ? { ...msg, react: data.react } : msg
                )
            );
        }
    };

    const handleDelete = useCallback(
        (data: any) => {
            if (data.uuid) {
                alert(tCommon("CM_SAVE"));
                setChatMessageHistory((prev) =>
                    prev.filter((msg) => msg.uuid !== data.uuid)
                );
            }
        },
        [tCommon]
    );

    const networkCallback = useCallback(
        (state: number, message: string) => {
            console.log("networkCallback: ", { state, message });
            if (state === 1) {
                webSocketService.current?.setDefaultCallback((json) => {
                    const { action, data } = json;
                    switch (action) {
                        case "enterRoomToken":
                            handleJoinRoomToken(data);
                            break;
                        case "history":
                            handleHistory(data);
                            break;
                        case "chat":
                            handleChat(data);
                            break;
                        case "reaction":
                            handleReaction(data);
                            break;
                        case "delChat":
                            handleDelete(data);
                            break;
                        case "blockEnterRoomToken":
                            handleBlockRoom();
                            break;
                    }
                });
                if (authToken && roomToken) {
                    webSocketService.current?.joinRoomWithToken(
                        authToken,
                        roomToken
                    );
                }
            }
        },
        [
            authToken,
            handleChat,
            handleDelete,
            handleHistory,
            handleJoinRoomToken,
            roomToken,
        ]
    );

    const openConnect = useCallback(
        (token: string) => {
            webSocketService.current = new WebSocketService();
            webSocketService.current.open(
                `${__SOCKET_URL__}?token=${token}`,
                networkCallback
            );
        },
        [networkCallback]
    );

    const fetchToken = useCallback(async () => {
        setIsLoading(true);
        try {
            if (item) {
                const payload = await ChatService.fetchChatToken({
                    ROOM_TYPE: "CMS_SHOP",
                    ROOM_ID: item.rid,
                    USER_ID:
                        currentCompany?.COMID && currentPlace?.PLACEID
                            ? getShopId(
                                  currentCompany?.COMID ?? 0,
                                  currentPlace?.PLACEID ?? 0
                              )
                            : "",
                });

                const tokenInfo = getDataFromPayloadRestful(payload)?.[0];

                setAuthToken(tokenInfo?.AUTH_TOKEN);
                setRoomToken(tokenInfo?.ROOM_TOKEN);
                openConnect(tokenInfo?.AUTH_TOKEN);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace, item, openConnect]);

    useEffect(() => {
        setIsBlockRoom(false);
        setChatMessageHistory([]);
        exitRoom();
        fetchToken();
    }, [exitRoom, fetchToken]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                sendChat();
                e.preventDefault();
            }
        };

        const input = document.querySelector<
            HTMLInputElement | HTMLTextAreaElement
        >(".chat-message-input");

        input?.addEventListener("keydown", handleKeyPress as EventListener);

        return () => {
            input?.removeEventListener(
                "keydown",
                handleKeyPress as EventListener
            );
        };
    }, [sendChat]);

    const renderReplyContent = (msg: Message) => {
        if (!msg.replyMsg || !getCtypeMsg(msg)) return null;
        return (
            <div
                className="reply-msg"
                onClick={() => scrollToReplyMessage(msg.replyMsg!._id || "")}
            >
                {msg.replyMsg.ctype === "C" && (
                    <div className="reply-content">{msg.replyMsg.mesg}</div>
                )}
                {msg.replyMsg.ctype === "L" && (
                    <div className="reply-content">
                        <a
                            href={msg.replyMsg.mesg}
                            style={{ color: "rgb(81, 81, 249)" }}
                        >
                            {msg.replyMsg.mesg}
                        </a>
                    </div>
                )}
                {["G", "O"].includes(msg?.replyMsg?.ctype ?? "") && (
                    <div className="reply-content msg-link">
                        {msg.replyMsg.detail.orderId && (
                            <div>
                                <span className="msg-link-title">
                                    {tOrder("ORDER_GRID_1_ORDERID")}:{" "}
                                </span>
                                {msg.replyMsg.detail.orderId}
                            </div>
                        )}
                        {msg.replyMsg.detail.goodsId && (
                            <div>
                                <span className="msg-link-title">
                                    {tOrder("ORDER_GRID_2_GOODSID")}:{" "}
                                </span>
                                {msg.replyMsg.detail.goodsId}
                            </div>
                        )}
                        <img
                            className="msg-item-img"
                            src={msg.replyMsg.detail.thumbleUrl}
                            alt={msg.replyMsg.detail.thumbleUrl}
                            onError={(e) =>
                                (e.currentTarget.src = "img/no_image.jpeg")
                            }
                        />
                        <div>
                            <div className="msg-link-title">
                                {translateContent(msg.replyMsg.detail.name)}
                            </div>
                            <div>
                                <span className="strikethrough-text text-capitalize">
                                    {msg.replyMsg.detail.price}
                                </span>{" "}
                                <span className="strikethrough-text text-capitalize">
                                    W
                                </span>{" "}
                                <span>{msg.replyMsg.detail.priceSell}</span>
                            </div>
                        </div>
                    </div>
                )}
                {msg.replyMsg.ctype === "I" && (
                    <div className="reply-content msg-img">
                        <Image
                            width={80}
                            className="msg-item-img"
                            src={msg.replyMsg.img}
                            alt={msg.replyMsg.img}
                        />
                    </div>
                )}
            </div>
        );
    };

    return item ? (
        <Card
            title={
                <div className="chat-content-head">
                    <img
                        className="chat-history-item-avatar"
                        src={
                            __PHOTO_LIVE_CHAT_PATH__ +
                            "/userphoto/" +
                            item?.rid.split("_")[1] +
                            "/" +
                            item?.rid.split("_")[1] +
                            ".jpg"
                        }
                        alt=""
                    />
                    <span style={{ fontWeight: 500, fontSize: "16px" }}>
                        {item?.uname}
                    </span>
                </div>
            }
            extra={
                <div className="chat-content-head-btn">
                    <EllipsisOutlined />
                    <div className="options-menu">
                        <div className="option-item" onClick={deleteChat}>
                            {tCommon("CM_REMOVE")}
                        </div>
                        <div className="option-item" onClick={block}>
                            {tReport("RP_CLOSE_BLOCK")}
                        </div>
                    </div>
                </div>
            }
            loading={isLoading}
            className="chat-content"
        >
            <div className="chat-content-history" ref={chatRef}>
                {chatMessageHistory
                    .filter((msg) => msg.cstate === "Y")
                    .map((msg) => (
                        <div
                            key={msg.id}
                            id={`chat-content-msg-${msg.id}`}
                            className={msg.me === 1 ? "msgMe" : "msgYou"}
                            onMouseEnter={resetMenusOnHover}
                        >
                            <div>
                                {msg.ctype === "C" && (
                                    <div className="msg">
                                        {renderReplyContent(msg)}
                                        <div>{msg.mesg}</div>
                                        <div className="msg-date">
                                            {msg.time}
                                        </div>
                                        {msg.react &&
                                            Object.keys(msg.react).some(
                                                (key) =>
                                                    reactions
                                                        .map((r) => r.value)
                                                        .includes(key) &&
                                                    msg.react[key] > 0
                                            ) && (
                                                <div className="msg-reactions">
                                                    {reactions.map(
                                                        (reaction) =>
                                                            msg.react[
                                                                reaction.value
                                                            ] > 0 && (
                                                                <div
                                                                    key={
                                                                        reaction.value
                                                                    }
                                                                    className="msg-reaction"
                                                                >
                                                                    <span>
                                                                        {
                                                                            reaction.label
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            msg
                                                                                .react[
                                                                                reaction
                                                                                    .value
                                                                            ]
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                                {msg.ctype === "L" && (
                                    <div className="msg">
                                        {renderReplyContent(msg)}
                                        <a
                                            href={msg.mesg}
                                            style={{
                                                color: "rgb(81, 81, 249)",
                                            }}
                                        >
                                            {msg.mesg}
                                        </a>
                                        <div className="msg-date">
                                            {msg.time}
                                        </div>
                                        {msg.react &&
                                            Object.keys(msg.react).some(
                                                (key) =>
                                                    reactions
                                                        .map((r) => r.value)
                                                        .includes(key) &&
                                                    msg.react[key] > 0
                                            ) && (
                                                <div className="msg-reactions">
                                                    {reactions.map(
                                                        (reaction) =>
                                                            msg.react[
                                                                reaction.value
                                                            ] > 0 && (
                                                                <div
                                                                    key={
                                                                        reaction.value
                                                                    }
                                                                    className="msg-reaction"
                                                                >
                                                                    <span>
                                                                        {
                                                                            reaction.label
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            msg
                                                                                .react[
                                                                                reaction
                                                                                    .value
                                                                            ]
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                                {["G", "O"].includes(msg.ctype || "") && (
                                    <div className="msg msg-link">
                                        {renderReplyContent(msg)}
                                        {msg.detail.orderId && (
                                            <div>
                                                <span className="msg-link-title">
                                                    {tOrder(
                                                        "ORDER_GRID_1_ORDERID"
                                                    )}
                                                    :{" "}
                                                </span>
                                                {msg.detail.orderId}
                                            </div>
                                        )}
                                        {msg.detail.goodsId && (
                                            <div>
                                                <span className="msg-link-title">
                                                    {tOrder(
                                                        "ORDER_GRID_2_GOODSID"
                                                    )}
                                                    :{" "}
                                                </span>
                                                {msg.detail.goodsId}
                                            </div>
                                        )}
                                        <img
                                            className="msg-item-img"
                                            src={msg.detail.thumbleUrl}
                                            alt={msg.detail.thumbleUrl}
                                            onError={(e) =>
                                                (e.currentTarget.src =
                                                    "img/no_image.jpeg")
                                            }
                                        />
                                        <div>
                                            <div className="msg-link-title">
                                                {translateContent(
                                                    msg.detail.name
                                                )}
                                            </div>
                                            <div>
                                                <span className="strikethrough-text text-capitalize">
                                                    {msg.detail.price}
                                                </span>{" "}
                                                <span className="strikethrough-text text-capitalize">
                                                    W
                                                </span>{" "}
                                                <span>
                                                    {msg.detail.priceSell}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="msg-date">
                                            {msg.time}
                                        </div>
                                        {msg.react &&
                                            Object.keys(msg.react).some(
                                                (key) =>
                                                    reactions
                                                        .map((r) => r.value)
                                                        .includes(key) &&
                                                    msg.react[key] > 0
                                            ) && (
                                                <div className="msg-reactions">
                                                    {reactions.map(
                                                        (reaction) =>
                                                            msg.react[
                                                                reaction.value
                                                            ] > 0 && (
                                                                <div
                                                                    key={
                                                                        reaction.value
                                                                    }
                                                                    className="msg-reaction"
                                                                >
                                                                    <span>
                                                                        {
                                                                            reaction.label
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            msg
                                                                                .react[
                                                                                reaction
                                                                                    .value
                                                                            ]
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                                {msg.ctype === "I" && (
                                    <div className="msg msg-img">
                                        {renderReplyContent(msg)}
                                        {/* <a href={msg.img} data-fancybox> */}
                                        <Image
                                            width={80}
                                            className="msg-item-img"
                                            src={msg.img}
                                            alt={msg.img}
                                        />
                                        {/* </a> */}
                                        <div
                                            className="msg-date"
                                            style={{ padding: "0 10px" }}
                                        >
                                            {msg.time}
                                        </div>
                                        {msg.react &&
                                            Object.keys(msg.react).some(
                                                (key) =>
                                                    reactions
                                                        .map((r) => r.value)
                                                        .includes(key) &&
                                                    msg.react[key] > 0
                                            ) && (
                                                <div className="msg-reactions">
                                                    {reactions.map(
                                                        (reaction) =>
                                                            msg.react[
                                                                reaction.value
                                                            ] > 0 && (
                                                                <div
                                                                    key={
                                                                        reaction.value
                                                                    }
                                                                    className="msg-reaction"
                                                                >
                                                                    <span>
                                                                        {
                                                                            reaction.label
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            msg
                                                                                .react[
                                                                                reaction
                                                                                    .value
                                                                            ]
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}
                                {msg.originMesg && (
                                    <div
                                        style={{
                                            fontStyle: "italic",
                                            padding: "3px",
                                            cursor: "pointer",
                                            fontSize: "11px",
                                        }}
                                        onClick={() =>
                                            resetTranslate(msg.id || "")
                                        }
                                    >
                                        {tCommon("CM_VIEW_ORIGINAL")}
                                    </div>
                                )}
                                <div className="msg-actions">
                                    <button
                                        className="msg-action-btn"
                                        onClick={() =>
                                            toggleReactionMenu(msg.id || "")
                                        }
                                    >
                                        <HeartOutlined />
                                    </button>
                                    <button
                                        className="msg-action-btn"
                                        onClick={() =>
                                            toggleOptionsMenu(msg.id || "")
                                        }
                                    >
                                        ⋯
                                    </button>
                                    <div
                                        className={`reaction-menu ${
                                            showReactionMenu === msg.id
                                                ? "show"
                                                : ""
                                        }`}
                                    >
                                        {reactions.map((reaction) => (
                                            <div
                                                key={reaction.value}
                                                className="reaction-item"
                                                onClick={() =>
                                                    selectReaction(
                                                        msg.uuid || "",
                                                        reaction.value
                                                    )
                                                }
                                            >
                                                {reaction.label}
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className={`options-menu ${
                                            showOptionsMenu === msg.id
                                                ? "show"
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className="option-item"
                                            onClick={() =>
                                                replyMessage(msg.id || "")
                                            }
                                        >
                                            {tCommon("CM_REPLY")}
                                        </div>
                                        {(msg.ctype === "C" ||
                                            msg.ctype === "L" ||
                                            msg.ctype === "I") && (
                                            <div
                                                className="option-item"
                                                onClick={() =>
                                                    copyMessage(msg.id || "")
                                                }
                                            >
                                                {tCommon("CM_COPY")}
                                            </div>
                                        )}
                                        {msg.ctype === "C" &&
                                            !msg.originMesg && (
                                                <div
                                                    className="option-item"
                                                    onClick={() =>
                                                        translateMessage(
                                                            msg.id || ""
                                                        )
                                                    }
                                                >
                                                    {tCommon("CM_TRANSLATE")}
                                                </div>
                                            )}
                                        {msg.me === 1 && (
                                            <div
                                                className="option-item"
                                                onClick={() =>
                                                    deleteMessage(
                                                        msg.uuid || ""
                                                    )
                                                }
                                            >
                                                {tCommon("CM_REMOVE")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="chat-content-input">
                {chatReplyItem && (
                    <div className="chat-content-input-reply">
                        <div>
                            {["G", "O"].includes(chatReplyItem.ctype || "") && (
                                <div className="reply-msg-text msg-link">
                                    <img
                                        className="msg-item-img"
                                        src={chatReplyItem.detail.thumbleUrl}
                                        alt={chatReplyItem.detail.thumbleUrl}
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                "img/no_image.jpeg")
                                        }
                                    />
                                </div>
                            )}
                            {chatReplyItem.ctype === "I" && (
                                <div className="reply-msg-text msg-img">
                                    <img
                                        className="msg-item-img"
                                        src={chatReplyItem.img}
                                        alt={chatReplyItem.img}
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                "img/no_image.jpeg")
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="reply-msg-text">
                                <strong>{tCommon("CM_REPLY")}</strong>{" "}
                                {chatReplyItem.me !== 1 && (
                                    <span>{item?.uname}</span>
                                )}
                            </div>
                            {chatReplyItem.ctype === "C" && (
                                <div className="reply-msg-text">
                                    {chatReplyItem.mesg}
                                </div>
                            )}
                            {chatReplyItem.ctype === "L" && (
                                <div className="reply-msg-text">
                                    <a
                                        href={chatReplyItem.mesg}
                                        style={{ color: "rgb(81, 81, 249)" }}
                                    >
                                        {chatReplyItem.mesg}
                                    </a>
                                </div>
                            )}
                            {chatReplyItem.ctype === "G" && (
                                <div className="reply-msg-text">
                                    [{tCommon("CM_GOODS")}]
                                </div>
                            )}
                            {chatReplyItem.ctype === "O" && (
                                <div className="reply-msg-text">
                                    [{tCommon("CM_ORDER")}]
                                </div>
                            )}
                            {chatReplyItem.ctype === "I" && (
                                <div className="reply-msg-text">
                                    [{tCommon("CM_IMAGE")}]
                                </div>
                            )}
                        </div>
                        <div
                            style={{
                                alignSelf: "baseline",
                                marginLeft: "auto",
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                            onClick={resetReplyMessage}
                        >
                            &times;
                        </div>
                    </div>
                )}
                <div className="chat-content-input-container">
                    {!isBlockRoom ? (
                        <>
                            <Input
                                className="chat-message-input"
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                            />
                            <Button
                                size="middle"
                                type="primary"
                                onClick={sendChat}
                            >
                                {tCommon("CM_CHAT")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="chat-message-input">
                                {tCommon("CM_BLOCK_USER_NOTIFY")}
                            </span>
                            <button
                                className="btn btn-sm btn-default"
                                onClick={unBlock}
                            >
                                {tReport("RP_OPEN_BLOCK")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    ) : (
        <></>
    );
};
