import { Card, Flex, Input, Table, Image } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { VoteService } from "@/app/services/vote";
import { Vote } from "@/interfaces/vote";
import { useAppStore } from "@/hooks/useAppStore";
import { useVoteListDialog, VoteListDialog } from "./VoteListDialog";

const { Search } = Input;

export const VoteList = () => {
    const { t } = useTranslation("Vote");
    const { t: tArtist } = useTranslation("Artist");

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<Vote[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useVoteListDialog();

    const fetchDataList = useCallback(async () => {
        if (
            currentCompany?.COMID == undefined ||
            currentPlace?.PLACEID == undefined
        ) {
            return;
        }

        setIsLoading(true);
        try {
            const payload = await VoteService.fetchVoteList({
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                PAGE: 1,
                SIZE: 1000,
            });

            setDataList(getDataFromPayloadRestful(payload)?.[0]?.ITEMS);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: t("IMAGE"),
            dataIndex: "THUMB_URL",
            key: "THUMB_URL",
            render: (text: string) => (
                <Image
                    onClick={(e) => e.stopPropagation()}
                    preview={false}
                    width={60}
                    src={text}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: t("TITLE"),
            dataIndex: "TITLE",
            key: "TITLE",
        },
        {
            title: t("ARTIST_TYPE"),
            dataIndex: "ARTIST_TYPE",
            key: "ARTIST_TYPE",
            render: (type: string) =>
                type == "G" ? t("GROUP") : type == "A" ? t("MEMBER") : "",
        },
        {
            title: t("STATUS"),
            dataIndex: "STATUS_NAME",
            key: "STATUS_NAME",
            align: "center",
        },
        {
            title: t("SIZE_OF_PARTICIPANTS"),
            dataIndex: "TOTAL_VOTE_USER",
            key: "TOTAL_VOTE_USER",
            align: "center",
        },
        {
            title: t("WINNER"),
            dataIndex: "WINNING_ALIAS",
            key: "WINNING_ALIAS",
        },
        {
            title: t("START_DATE"),
            dataIndex: "START_TIME",
            key: "START_TIME",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("END_DATE"),
            dataIndex: "END_TIME",
            key: "END_TIME",
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
                title={t("VOTE_EVENT_LIST")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("ENTER_NAME")}
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
                    dataSource={dataList.filter((item: Vote) =>
                        item.TITLE.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <VoteListDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
