import { Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { RewardService } from "@/app/services/reward";
import { Mission as IMission } from "@/interfaces/reward";
import { MissionDialog, useMissionDialog } from "./MissionDialog";

const { Search } = Input;

export const Mission = () => {
    const { t } = useTranslation("Locale");
    const { t: tVote } = useTranslation("Vote");
    const { t: tArtist } = useTranslation("Artist");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<IMission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useMissionDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await RewardService.fetchMissionList({
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
            title: t("CODE"),
            dataIndex: "MISSION_TYPE",
            key: "MISSION_TYPE",
        },
        {
            title: t("NAME"),
            dataIndex: "MISSION_NAME",
            key: "MISSION_NAME",
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
            title: t("NUMBER_OF_HEARTS"),
            dataIndex: "REWARD_AMOUNT",
            key: "REWARD_AMOUNT",
            align: "center",
        },
        {
            title: t("REDIRECT"),
            dataIndex: "REDIRECT_YN",
            key: "REDIRECT_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("RESET_TIME"),
            dataIndex: "RESET_TIME",
            key: "RESET_TIME",
            align: "center",
            render: (id: string) =>
                id == "D"
                    ? t("DAILY")
                    : id == "W"
                    ? t("WEEKLY")
                    : id == "M"
                    ? t("MONTHLY")
                    : "",
        },
        {
            title: t("LIMIT"),
            dataIndex: "LIMIT_COUNT",
            key: "LIMIT_COUNT",
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

    return (
        <>
            <Card
                title={t("MISSION_LIST")}
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
                    </Flex>
                }
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: IMission) =>
                        item.MISSION_NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <MissionDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
