import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { RewardService } from "@/app/services/reward";
import { Heart } from "@/interfaces/reward";
import { CommonService } from "@/app/services/common";
import { CommonCode } from "@/interfaces/common";
import {
    HeartRechargeDialog,
    useHeartRechargeDialog,
} from "./HeartRechargeDialog";

const { Search } = Input;

export const HeartRecharge = () => {
    const { t } = useTranslation("Locale");
    const { t: tVote } = useTranslation("Vote");
    const { t: tArtist } = useTranslation("Artist");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<Heart[]>([]);
    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useHeartRechargeDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await RewardService.fetchHeartList({
                PKG_TYPE: "2",
                HOT_YN: "",
                USE_YN: "",
                ACTIVE_YN: "",
            });

            setDataList(getDataFromPayloadRestful(payload)?.[0]?.ITEMS);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCommonCode = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await CommonService.fetchCommonCode({
                CODE_ID: "PAYTYPE",
            });

            const list = getDataFromPayloadRestful(payload);

            setCommonCode(list);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataList();
        fetchCommonCode();
    }, [fetchDataList, fetchCommonCode]);

    const columns: any = [
        {
            title: t("CODE"),
            dataIndex: "CODE",
            key: "CODE",
        },
        {
            title: t("NAME"),
            dataIndex: "NAME",
            key: "NAME",
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
            title: t("DESCRIPTION"),
            dataIndex: "DESCRIPTION",
            key: "DESCRIPTION",
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
            title: tCommon("CM_USEYN"),
            dataIndex: "USE_YN",
            key: "USE_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("PAY_TYPE"),
            dataIndex: "PAY_TYPES",
            key: "PAY_TYPES",
            render: (list: string) =>
                list
                    .split(",")
                    .map((id: string) =>
                        translateContent(
                            commonCode.find((item) => item.CODE_LIST_ID == id)
                                ?.CODE_LIST_DISPLAY_NAME ?? ""
                        )
                    )
                    .join(", "),
        },
        {
            title: t("HOT_YN"),
            dataIndex: "HOT_YN",
            key: "HOT_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("NUMBER_OF_HEARTS"),
            dataIndex: "CONVERT_AMOUNT",
            key: "CONVERT_AMOUNT",
            align: "center",
        },
        {
            title: t("BONUS_PC_OF_HEARTS"),
            dataIndex: "BONUS_PC",
            key: "BONUS_PC",
            align: "center",
            render: (text: string) => text + "%",
        },
        {
            title: t("BONUS_OF_HEARTS"),
            dataIndex: "BONUS_AMOUNT",
            key: "BONUS_AMOUNT",
            align: "center",
        },
        {
            title: t("TOTAL_HEARTS"),
            dataIndex: "TOTAL_HEARTS",
            key: "TOTAL_HEARTS",
            align: "center",
            render: (_: any, record: any) =>
                record.CONVERT_AMOUNT + record.BONUS_AMOUNT,
        },
        {
            title: t("LIMIT"),
            dataIndex: "LIMIT_YN",
            key: "LIMIT_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("NUMBER_OF_PURCHASES"),
            dataIndex: "MAX_BUY",
            key: "MAX_BUY",
            align: "center",
            render: (text: number) =>
                text == -1 ? tCommon("CM_UNLIMITED") : text,
        },
        {
            title: t("ORIGIN_PRICE"),
            dataIndex: "ORIGIN_KRW",
            key: "ORIGIN_KRW",
            align: "center",
        },
        {
            title: t("DISCOUNT_PRICE"),
            dataIndex: "DISCOUNT_PC",
            key: "DISCOUNT_PC",
            align: "center",
            render: (text: string) => text + "%",
        },
        {
            title: t("SALE_PRICE"),
            dataIndex: "PRICE_KRW",
            key: "PRICE_KRW",
            align: "center",
        },
        {
            title: tVote("START_DATE"),
            dataIndex: "EFFECTIVE_TIME",
            key: "EFFECTIVE_TIME",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tVote("END_DATE"),
            dataIndex: "EXPIRED_TIME",
            key: "EXPIRED_TIME",
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

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={t("HEART_RECHARGE_LIST")}
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
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: Heart) =>
                        item.NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <HeartRechargeDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
