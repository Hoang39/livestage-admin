import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Card, Drawer, Space, Table } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import timeService from "@/libs/timeService";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { StatisticsService } from "@/app/services/statistic";
import { TicketRevenueLive, TicketRevenueOrder } from "@/interfaces/statistic";
import dayjs from "dayjs";

export const useMemberDialog = dialogStore<any>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

export const MemberDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Broadcast");
    const { t: tCommon } = useTranslation("Common");
    const { t: tStatistics } = useTranslation("Statistics");
    const { t: tOrder } = useTranslation("Order");
    const { t: tBroadcast } = useTranslation("Broadcast");
    const { t: tReport } = useTranslation("Report");
    const { t: tAuth } = useTranslation("AuthUser");

    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useMemberDialog();
    const [dataList, setDataList] = useState<TicketRevenueLive[]>([]);
    const [childrenData, setChildrenData] = useState<{
        [key: string]: TicketRevenueOrder[];
    }>({});
    const [isChildLoading, setIsChildLoading] = useState<{
        [key: string]: boolean;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    const response =
                        await StatisticsService.fetchTicketRevenueLiveList({
                            SHOP_ID: item.SHOP_ID,
                            USER_PID: item.USER_PID,
                            DATE: dayjs(item.FROM_DATE).format("YYYY-MM-DD"),
                            SORT_TYPE: "",
                            SORT_DIR: "",
                            PAGE_NUM: "1",
                            PAGE_SIZE: "500",
                        });

                    setDataList(getDataFromPayloadRestful(response));
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("Init form values: ", error);
            }
        })();
    }, [item, openNotification]);

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const columns: any = [
        {
            title: t("BROADCAST_GRID_1_PID"),
            dataIndex: "PID",
            key: "PID",
            align: "center",
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
            title: t("BROADCAST_GRID_1_OPEN_DATE"),
            dataIndex: "OPEN_DATE",
            key: "OPEN_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
            align: "center",
        },
        {
            title: t("BROADCAST_GRID_1_PRICE"),
            dataIndex: "TICKET_PRICE",
            key: "TICKET_PRICE",
            align: "center",
        },
        {
            title: tStatistics("STATISTICS_GROSS_SALES_AMOUNT"),
            dataIndex: "TOT_PRICE",
            key: "TOT_PRICE",
            align: "center",
        },
        {
            title: tStatistics("STATISTICS_DIS_AMOUNT"),
            dataIndex: "DIS_PRICE",
            key: "DIS_PRICE",
            align: "center",
        },
        {
            title: tStatistics("STATISTICS_NET_SALES_AMOUNT"),
            dataIndex: "PAY_PRICE",
            key: "PAY_PRICE",
            align: "center",
        },
        {
            title: tOrder("ORDER_GRID_2_QTY"),
            dataIndex: "TOTAL_SUCCESS_ORDER",
            key: "TOTAL_SUCCESS_ORDER",
            align: "center",
        },
    ];

    const childColumns: any = [
        {
            title: tReport("RP_USER_ID"),
            dataIndex: "USER_PID",
            key: "USER_PID",
        },
        {
            title: tAuth("AUTH_USER_GRID_USERNAME"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: tOrder("ORDER_GRID_2_ORDERID"),
            dataIndex: "TICKET_ORDER_PID",
            key: "TICKET_ORDER_PID",
        },
        {
            title: tStatistics("STATISTICS_GRID_ORDERDATE"),
            dataIndex: "CRT_DATE",
            key: "CRT_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
    ];

    const fetchShop = useCallback(
        async (record: TicketRevenueLive) => {
            setIsChildLoading((prev) => ({ ...prev, [record.PID]: true }));
            try {
                const response =
                    await StatisticsService.fetchTicketRevenueOrderList({
                        SHOP_ID: item.SHOP_ID,
                        USER_PID: item.USER_PID,
                        DATE: dayjs(item.FROM_DATE).format("YYYY-MM-DD"),
                        LIVE_PID: record.PID,
                        PAYMENT_TYPE: "A",
                        SORT_TYPE: "",
                        SORT_DIR: "",
                        PAGE_NUM: "1",
                        PAGE_SIZE: "500",
                    });
                const data: TicketRevenueOrder[] =
                    getDataFromPayloadRestful(response) || [];

                setChildrenData((prev) => ({
                    ...prev,
                    [record.PID]: data,
                }));
            } catch (error) {
                console.log("Error fetchShop: ", error);
            } finally {
                setIsChildLoading((prev) => ({ ...prev, [record.PID]: false }));
            }
        },
        [item]
    );

    const handleExpand = useCallback(
        async (expanded: boolean, record: TicketRevenueLive) => {
            if (
                expanded &&
                (!childrenData[record.PID] ||
                    childrenData[record.PID].length === 0)
            ) {
                await fetchShop(record);
            }
        },
        [childrenData, fetchShop]
    );

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={dialogTitle}
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="60%"
                style={{ zIndex: 999 }}
                footer={
                    !readonly && (
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button onClick={handleClose}>
                                {tCommon("CM_CANCEL")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Card title={tBroadcast("BROADCAST_LIST_TITLE")}>
                    <Table
                        scroll={{ x: "max-content" }}
                        loading={isLoading}
                        dataSource={dataList}
                        columns={columns}
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    rowKey="ID"
                                    loading={
                                        isChildLoading[record.PID] || false
                                    }
                                    columns={childColumns}
                                    dataSource={childrenData[record.PID] || []}
                                    pagination={false}
                                />
                            ),
                            onExpand: handleExpand,
                        }}
                    />
                </Card>
            </Drawer>
        </>
    );
};
