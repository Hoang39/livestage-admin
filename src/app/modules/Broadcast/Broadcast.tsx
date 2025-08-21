import { Button, Card, Flex, Image, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BroadcastService } from "@services/broadcast";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { handleImagePath } from "@/utils/handleImage";
import { getShopId } from "@/utils/getShopId";
import { getLinkVideo } from "@/utils/getLinkVideo";
import timeService from "@/libs/timeService";
import { EyeOutlined } from "@ant-design/icons";
import { useAppStore } from "@/hooks/useAppStore";
import { Broadcast as IBroadcast } from "@/interfaces/broadcast";

const { Search } = Input;

export const Broadcast = () => {
    const { t } = useTranslation("Broadcast");
    const { t: tCommon } = useTranslation("Common");

    const { currentCompany, currentPlace, categoryList } = useAppStore(
        (state) => state
    );

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<IBroadcast[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // const { openDialog } = useCompanyDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await BroadcastService.fetchBroadcasts({
                SHOP_ID:
                    currentCompany?.COMID && currentPlace?.PLACEID
                        ? getShopId(
                              currentCompany?.COMID ?? 0,
                              currentPlace?.PLACEID ?? 0
                          )
                        : "",
                KEYWORD: "",
                STATE: "",
                PAGE_SIZE: 1000,
                PAGE_NUM: 1,
            });
            setDataList(getDataFromPayloadRestful(payload));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace]);

    const handleData = useCallback((data: IBroadcast) => {
        try {
            return {
                ...data,
                LINK_VIEW: getLinkVideo(
                    data.STATE,
                    data.PID,
                    data.USER_PID,
                    data?.YOUTUBE_ID || ""
                ),
                LIVE_SHOPPING: data.SHOP_ID && data.SHOP_ID.startsWith("S"),
            };
        } catch (error) {
            console.log("🚀 ~ handleDataBroadCast ~ error:", error);
        }
    }, []);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const arrState = [
        { id: "S", STATE: t("BROADCAST_ARR_O_S") },
        { id: "O", STATE: t("BROADCAST_ARR_O_O") },
        { id: "P", STATE: t("BROADCAST_ARR_O_P") },
        { id: "F", STATE: t("BROADCAST_ARR_O_F") },
        { id: "C", STATE: t("BROADCAST_ARR_O_C") },
        { id: "Y", STATE: t("BROADCAST_ARR_O_Y") },
    ];

    const columns: any = [
        {
            title: t("BROADCAST_GRID_1_IMAGE_URL"),
            dataIndex: "IMAGE_URL",
            key: "IMAGE_URL",
            render: (src: string) => (
                <Image
                    onClick={(e) => e.stopPropagation()}
                    width={90}
                    height={50}
                    src={handleImagePath(src)}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: t("BROADCAST_GRID_1_TITLE"),
            dataIndex: "TITLE",
            key: "TITLE",
            width: 200,
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                    }}
                >
                    {text}
                </p>
            ),
        },
        {
            title: t("BROADCAST_GRID_1_PID"),
            dataIndex: "PID",
            key: "PID",
        },
        {
            title: t("BROADCAST_GRID_1_ALIAS"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: t("BROADCAST_GRID_1_PRICE"),
            dataIndex: "PRICE",
            key: "PRICE",
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_STATE"),
            dataIndex: "STATE",
            key: "STATE",
            render: (id: string) =>
                arrState.filter((item) => item.id == id)?.[0].STATE,
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_SUB_TITLE"),
            dataIndex: "SUB_TITLE",
            key: "SUB_TITLE",
            maxWidth: 200,
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                    }}
                >
                    {text}
                </p>
            ),
        },
        {
            title: t("BROADCAST_GRID_1_CATEGORY_ID"),
            dataIndex: "CATEGORY_ID",
            key: "CATEGORY_ID",
            render: (id: string) =>
                categoryList.filter(
                    (item) => item.CATEGORYID.toString() == id
                )?.[0]?.NAME,
        },
        {
            title: t("BROADCAST_GRID_1_LINK"),
            dataIndex: "LINK_VIEW",
            key: "LINK_VIEW",
            align: "center",
            render: (src: string) =>
                src ? (
                    <a href={src} target="_blank" rel="noopener noreferrer">
                        <EyeOutlined />
                    </a>
                ) : null,
        },
        {
            title: t("BROADCAST_GRID_1_SHOP_ID"),
            dataIndex: "SHOP_ID",
            key: "SHOP_ID",
        },
        {
            title: t("BROADCAST_GRID_1_SCH_START_DATE_D"),
            dataIndex: "SCH_START_DATE",
            key: "SCH_START_DATE",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_NOTI_TEXT"),
            dataIndex: "NOTI_TEXT",
            key: "NOTI_TEXT",
        },
        {
            title: t("BROADCAST_GRID_1_SCH_START_DATE"),
            dataIndex: "SCH_START_DATE",
            key: "SCH_START_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_SCH_END_DATE"),
            dataIndex: "SCH_END_DATE",
            key: "SCH_END_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
            align: "center",
        },
        {
            title: t("CM_USEYN"),
            dataIndex: "USE_YN",
            key: "USE_YN",
            render: (text: string) => (text == "Y" ? "Yes" : "No"),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_TEST_YN"),
            dataIndex: "TEST_YN",
            key: "TEST_YN",
            render: (text: string) => (text == "Y" ? "Yes" : "No"),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_UPLOAD_YN"),
            dataIndex: "UPLOAD_YN",
            key: "UPLOAD_YN",
            render: (text: string) => (text == "Y" ? "Yes" : "No"),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_VOD_DURATION"),
            dataIndex: "VOD_DURATION",
            key: "VOD_DURATION",
            align: "center",
        },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        // openDialog();
    };

    return (
        <>
            <Card
                title={t("BROADCAST_LIST_TITLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("BROADCAST_SEARCH_PLH")}
                            allowClear
                            onSearch={(value) => {
                                setSearchTerm(value);
                            }}
                            style={{ width: 200 }}
                        />

                        <Button type="primary" onClick={handleAddItem}>
                            {tCommon("CM_ADD")}
                        </Button>
                    </Flex>
                }
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList
                        .filter((item) =>
                            item.TITLE.toLowerCase().includes(
                                searchTerm.toLowerCase()
                            )
                        )
                        .map((item: IBroadcast) => {
                            return handleData(item);
                        })}
                    columns={columns}
                    // onRow={(record) => ({
                    //     onClick: () => openDialog(record),
                    // })}
                />
                {/* <BroadcastDialog
                                onClose={async (status) => {
                                    if (status === "success") {
                                        await fetchDataList();
                                    }
                                }}
                            /> */}
            </Card>
        </>
    );
};
