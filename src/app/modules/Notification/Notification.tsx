import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationService } from "@services/notification";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { translateContent } from "@/utils/handleResponse";
import { Notification as INotification } from "@/interfaces/notification";
import timeService from "@/libs/timeService";
import {
    NotificationDialog,
    useNotificationDialog,
} from "./NotificationDialog";

const { Search } = Input;

export const Notification = () => {
    const { t } = useTranslation("Notification");
    const { t: tCategory } = useTranslation("Category");
    const { t: tPage } = useTranslation("Route");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<INotification[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useNotificationDialog();

    const [filter] = useState({
        PAGE: 1,
        SIZE: 500,
    });

    const fetchDataList = useCallback(async (params: typeof filter) => {
        setIsLoading(true);
        try {
            const payload = await NotificationService.fetchNotiList(params);
            setDataList(getDataFromPayloadRestful(payload));
        } catch (error) {
            console.error(error);
            setDataList([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleData = useCallback((data: INotification) => {
        try {
            const dataParse = JSON.parse(data.NDATA);

            if (typeof dataParse.data == "string") {
                dataParse.data = JSON.parse(dataParse.data);
            }

            data.TITLE =
                typeof dataParse.title == "object"
                    ? JSON.stringify(dataParse.title)
                    : dataParse.title;
            data.BODY = dataParse.body;

            const { action, payload } = dataParse.data;

            return {
                ...data,
                CONFIG_DATA: JSON.stringify({
                    ACTION: action,
                    ...payload,
                }),
            };
        } catch (error) {
            console.log("🚀 ~ handleDataNotification ~ error:", error);
            return data;
        }
    }, []);

    useEffect(() => {
        fetchDataList(filter);
    }, [filter, fetchDataList]);

    const columns: any = [
        {
            title: t("NOTI_GRID_TITLE"),
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
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("NOTI_GRID_BODY"),
            dataIndex: "BODY",
            key: "BODY",
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
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("NOTI_GRID_SEND_STATUS"),
            dataIndex: "SEND_STATUS",
            key: "SEND_STATUS",
            render: (id: string) =>
                id == "I"
                    ? t("NOTI_GRID_SEND_STATUS_O_I")
                    : t("NOTI_GRID_SEND_STATUS_O_S"),
        },
        {
            title: t("NOTI_GRID_ACTION"),
            dataIndex: "CONFIG_DATA",
            key: "ACTION",
            render: (config: any) => {
                if (!config) return "";
                const configData = JSON.parse(config);
                return configData["ACTION"];
            },
        },
        {
            title: t("NOTI_GRID_DATA_INFO"),
            dataIndex: "CONFIG_DATA",
            key: "DATA",
            render: (config: any) => {
                if (!config) return "";
                const configData = JSON.parse(config);
                const action = configData["ACTION"];
                switch (action) {
                    case "LINK": {
                        return configData["URL"];
                    }
                    case "TEMPLATE": {
                        return configData["TEMPLATE_ID"];
                    }
                    case "ROUTE_VID": {
                        return configData["LIVE_PID"];
                    }
                    case "ROUTE_GOODS": {
                        return configData["GOODS_ID"];
                    }
                    default: {
                        return "";
                    }
                }
            },
        },
        {
            title: tCommon("CM_USEYN"),
            dataIndex: "PUSH_YN",
            key: "PUSH_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("NOTI_GRID_SCH_DATE"),
            dataIndex: "SCH_DATE",
            key: "SCH_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tCategory("CATEGORY_GRID_CRTDATE"),
            dataIndex: "CRT_DATE",
            key: "CRT_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={tPage("Noti")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("NOTI_GRID_TITLE")}
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
                    rowKey={"PUSH_PID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={
                        dataList
                            ?.map((item) => handleData(item))
                            ?.filter((item) =>
                                item?.TITLE.toLowerCase().includes(
                                    searchTerm.toLowerCase()
                                )
                            ) ?? []
                    }
                    columns={columns}
                    onRow={(record: INotification) => ({
                        onClick: () =>
                            openDialog(record, record.SEND_STATUS == "S"),
                    })}
                />
                <NotificationDialog
                    onClose={async (status) => {
                        if (status == "success") {
                            await fetchDataList(filter);
                        }
                    }}
                />
            </Card>
        </>
    );
};
