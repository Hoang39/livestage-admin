import { Card, Empty, Flex, Input, Image } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import timeService from "@/libs/timeService";
import { ChatService } from "@/app/services/chat";
import { getShopId } from "@/utils/getShopId";
import { useAppStore } from "@/hooks/useAppStore";
import { ChatHistory } from "@/interfaces/chat";
import { ChatContent } from "./ChatContent";
import "./custom-card.scss";

const { Search } = Input;

export const Chat = () => {
    const { t: tVote } = useTranslation("Vote");
    const { t: tReview } = useTranslation("Review");
    const { t: tCommon } = useTranslation("Common");

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    const [isLoading, setIsLoading] = useState(false);
    const [forcedLoading, setForcedLoading] = useState(false);
    const [dataList, setDataList] = useState<ChatHistory[]>([]);
    const [chatSelected, setChatSelected] = useState<ChatHistory>();
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await ChatService.fetchChatHistory({
                shop:
                    currentCompany?.COMID && currentPlace?.PLACEID
                        ? getShopId(
                              currentCompany?.COMID ?? 0,
                              currentPlace?.PLACEID ?? 0
                          )
                        : "",
                pageNum: 1,
                pageSize: 1000,
            });

            setDataList(payload?.data?.RESULT_DATA);
            setChatSelected(payload?.data?.RESULT_DATA?.[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList, forcedLoading]);

    return (
        <Flex>
            <Card
                title={
                    <Search
                        placeholder={tVote("ENTER_NAME")}
                        allowClear
                        onSearch={(value) => {
                            setSearchTerm(value);
                        }}
                        style={{ width: "100%" }}
                    />
                }
                loading={isLoading}
                className="chat-list"
            >
                <Flex vertical gap="2">
                    {!dataList.filter((item: ChatHistory) =>
                        item.uname
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                    ).length && (
                        <Empty description={tReview("REVIEW_NO_CHAT")} />
                    )}
                    {dataList
                        .filter((item: ChatHistory) =>
                            item.uname
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                        )
                        .map((chat) => (
                            <Card
                                key={chat.uuid}
                                size="small"
                                onClick={() => setChatSelected(chat)}
                                className={`chat-history-list-item ${
                                    chat.uuid == chatSelected?.uuid &&
                                    "chat-history-list-item-selected"
                                }`}
                            >
                                <Flex align="center" gap="middle">
                                    <Image
                                        src={
                                            __PHOTO_LIVE_CHAT_PATH__ +
                                            "/userphoto/" +
                                            chat.rid.split("_")[1] +
                                            "/" +
                                            chat.rid.split("_")[1] +
                                            ".jpg"
                                        }
                                        width={40}
                                        height={40}
                                        style={{ borderRadius: "50%" }}
                                        fallback="data:image/png;base64,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"
                                        preview={false}
                                    />
                                    <Flex
                                        vertical
                                        style={{ flex: 1 }}
                                        gap="2px"
                                    >
                                        <Flex
                                            align="center"
                                            justify="space-between"
                                        >
                                            <span>{chat.uname}</span>

                                            <span
                                                style={{
                                                    textAlign: "right",
                                                    fontStyle: "italic",
                                                    fontSize: 10,
                                                    color: "#a4a1a1",
                                                }}
                                            >
                                                {timeService.formatTimeAgo(
                                                    chat.lcstime
                                                )}
                                            </span>
                                        </Flex>

                                        <span
                                            style={{
                                                fontSize: "12px",
                                                color: "gray",
                                            }}
                                        >
                                            {chat.ctype == "G"
                                                ? `[${tCommon("CM_GOODS")}]`
                                                : chat.ctype == "O"
                                                ? `[${tCommon("CM_ORDER")}]`
                                                : chat.ctype == "I"
                                                ? `[${tCommon("CM_IMAGE")}]`
                                                : chat.mesg}
                                        </span>
                                    </Flex>
                                </Flex>
                            </Card>
                        ))}
                </Flex>
            </Card>

            <ChatContent
                item={chatSelected}
                loading={forcedLoading}
                setLoading={setForcedLoading}
            />
        </Flex>
    );
};
