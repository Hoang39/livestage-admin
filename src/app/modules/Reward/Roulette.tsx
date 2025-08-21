import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { RewardService } from "@/app/services/reward";
import { Prize, Promotion } from "@/interfaces/reward";
import { PromotionDialog, usePromotionDialog } from "./PromotionDialog";

const { Search } = Input;

export const Roulette = () => {
    const { t } = useTranslation("Locale");
    const { t: tVote } = useTranslation("Vote");
    const { t: tArtist } = useTranslation("Artist");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<Promotion[]>([]);
    const [childrenData, setChildrenData] = useState<{
        [key: number]: Prize[];
    }>({});
    const [isChildLoading, setIsChildLoading] = useState<{
        [key: number]: boolean;
    }>({});
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = usePromotionDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await RewardService.fetchPromotionList({
                PAGE: 1,
                SIZE: 1000,
            });

            setDataList(getDataFromPayloadRestful(payload)?.[0]?.ITEMS);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: t("PROMO_TYPE"),
            dataIndex: "PROMO_TYPE",
            key: "PROMO_TYPE",
        },
        {
            title: t("NAME"),
            dataIndex: "PROMO_NAME",
            key: "PROMO_NAME",
        },
        {
            title: t("WIN_RATE"),
            dataIndex: "WIN_RATE",
            key: "WIN_RATE",
            align: "center",
        },
        {
            title: t("TOTAL_PRIZE"),
            dataIndex: "TOTAL_PRIZE",
            key: "TOTAL_PRIZE",
            align: "center",
        },
        {
            title: tCommon("CM_USEYN"),
            dataIndex: "USE_YN",
            key: "USE_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: tVote("START_DATE"),
            dataIndex: "PROMO_START_TIME",
            key: "PROMO_START_TIME",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tVote("END_DATE"),
            dataIndex: "PROMO_END_TIME",
            key: "PROMO_END_TIME",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tArtist("CRTDATE"),
            dataIndex: "CREATED_AT",
            key: "CREATED_AT",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    const childColumns: any = [
        {
            title: "No.",
            dataIndex: "DISPLAY_ORDER",
            key: "DISPLAY_ORDER",
            align: "center",
        },
        {
            title: t("NAME"),
            dataIndex: "PRIZE_NAME",
            key: "PRIZE_NAME",
        },
        {
            title: t("PRIZE_WIN_RATE"),
            dataIndex: "PRIZE_WIN_RATE",
            key: "PRIZE_WIN_RATE",
            align: "center",
        },
        {
            title: t("QUANTITY"),
            dataIndex: "QUANTITY",
            key: "QUANTITY",
            align: "center",
        },
        {
            title: t("NUMBER_OF_HEARTS"),
            dataIndex: "HEART_CONVERT",
            key: "HEART_CONVERT",
            align: "center",
        },
        {
            title: t("WIN_YN"),
            dataIndex: "WIN_YN",
            key: "WIN_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: tCommon("CM_USEYN"),
            dataIndex: "USE_YN",
            key: "USE_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: tArtist("CRTDATE"),
            dataIndex: "CREATED_AT",
            key: "CREATED_AT",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    const fetchPrize = useCallback(async (id: number) => {
        setIsChildLoading((prev) => ({ ...prev, [id]: true }));
        try {
            const response = await RewardService.fetchPrizeList({
                PROMO_PID: id,
                PAGE: 1,
                SIZE: 1000,
            });
            const data: Prize[] =
                getDataFromPayloadRestful(response)?.[0]?.ITEMS || [];

            setChildrenData((prev) => ({
                ...prev,
                [id]: data,
            }));
        } catch (error) {
            console.log("Error fetchPrize: ", error);
        } finally {
            setIsChildLoading((prev) => ({ ...prev, [id]: false }));
        }
    }, []);

    const handleExpand = useCallback(
        async (expanded: boolean, record: Promotion) => {
            if (
                expanded &&
                (!childrenData[record.PROMO_PID] ||
                    childrenData[record.PROMO_PID].length === 0)
            ) {
                await fetchPrize(record.PROMO_PID);
            }
        },
        [childrenData, fetchPrize]
    );

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={t("PROMOTIONS_LIST")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={tVote("ENTER_NAME")}
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
                <Table<Promotion>
                    rowKey="PROMO_PID"
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: Promotion) =>
                        item.PROMO_NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table<Prize>
                                rowKey="PRIZE_PID"
                                loading={
                                    isChildLoading[record.PROMO_PID] || false
                                }
                                columns={childColumns}
                                dataSource={
                                    childrenData[record.PROMO_PID] || []
                                }
                                pagination={false}
                            />
                        ),
                        onExpand: handleExpand,
                    }}
                />
            </Card>

            <PromotionDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
