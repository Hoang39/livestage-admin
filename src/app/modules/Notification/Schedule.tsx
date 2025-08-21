import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationService } from "@services/notification";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { ScheduleNotification } from "@/interfaces/notification";
import timeService from "@/libs/timeService";
import { ScheduleDialog, useScheduleDialog } from "./ScheduleDialog";

const { Search } = Input;

export const Schedule = () => {
    const { t } = useTranslation("Notification");
    const { t: tPage } = useTranslation("Route");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<ScheduleNotification[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useScheduleDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload =
                await NotificationService.fetchScheduleNotification();
            setDataList(getDataFromPayloadRestful(payload));
        } catch (error) {
            console.error(error);
            setDataList([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns = [
        // {
        //     title: t("NOTI_GRID_ID"),
        //     dataIndex: "ID",
        //     key: "ID",
        // },
        {
            title: t("NOTI_GRID_SUBJECT"),
            dataIndex: "SUBJECT",
            key: "SUBJECT",
        },
        {
            title: t("NOTI_GRID_SENDER"),
            dataIndex: "SENDER",
            key: "SENDER",
        },
        {
            title: t("NOTI_GRID_SENDER_NAME"),
            dataIndex: "SENDER_NAME",
            key: "SENDER_NAME",
        },
        {
            title: t("NOTI_GRID_NOTE"),
            dataIndex: "NOTE",
            key: "NOTE",
        },
        {
            title: t("NOTI_GRID_TAS_ID"),
            dataIndex: "TAS_ID",
            key: "TAS_ID",
        },
        {
            title: t("NOTI_GRID_TO_GROUP"),
            dataIndex: "TO_GROUP",
            key: "TO_GROUP",
            render: (text: string) =>
                text == "SHOP"
                    ? t("NOTI_SCH_SHOP")
                    : text == "USER"
                    ? t("NOTI_SCH_USER")
                    : text == "MEMBERSHIP"
                    ? t("NOTI_SCH_MEMBERSHIP")
                    : t("NOTI_SCH_LIPSTAR"),
        },
        {
            title: t("NOTI_GRID_TYPE"),
            dataIndex: "TYPE",
            key: "TYPE",
            render: (text: string) =>
                text == "EMAIL" ? t("NOTI_SCH_EMAIL") : t("NOTI_SCH_SMS"),
        },
        // {
        //     title: t("NOTI_GRID_USER_EMAILS"),
        //     dataIndex: "USER_EMAILS",
        //     key: "USER_EMAILS",
        // },
        {
            title: t("NOTI_GRID_USER_NAME"),
            dataIndex: "USER_NAME",
            key: "USER_NAME",
        },
        {
            title: t("NOTI_GRID_STATUS"),
            dataIndex: "STATUS",
            key: "STATUS",
        },
        {
            title: t("NOTI_GRID_SCH_DATE"),
            dataIndex: "SCH_DATE",
            key: "SCH_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        // {
        //     title: t("NOTI_GRID_USER_MOD"),
        //     dataIndex: "USER_MOD",
        //     key: "USER_MOD",
        // },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={tPage("ScheduleSendNotification")}
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
                    rowKey={"ID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={
                        dataList?.filter((item) =>
                            item?.SUBJECT.toLowerCase().includes(
                                searchTerm.toLowerCase()
                            )
                        ) ?? []
                    }
                    columns={columns}
                    onRow={(record: ScheduleNotification) => ({
                        onClick: () =>
                            openDialog(record, record.STATUS == "PUSHED"),
                    })}
                />
                <ScheduleDialog
                    onClose={async (status) => {
                        if (status == "success") {
                            await fetchDataList();
                        }
                    }}
                />
            </Card>
        </>
    );
};
