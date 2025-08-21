import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Space, Table, Card, Image } from "antd";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { Rank, Vote, VoteDetail } from "@/interfaces/vote";
import { VoteService } from "@/app/services/vote";
import { useAppStore } from "@/hooks/useAppStore";
import timeService from "@/libs/timeService";

export const useVoteListDialog = dialogStore<Vote>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

export const VoteListDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Vote");
    const { t: tArtist } = useTranslation("Artist");
    const { t: tCommon } = useTranslation("Common");

    const { open, item, readonly, closeDialog } = useVoteListDialog();
    const [isLoading1, setIsLoading1] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [dataSource1, setDataSource1] = useState<VoteDetail[]>([]);
    const [dataSource2, setDataSource2] = useState<Rank[]>([]);

    const { currentCompany, currentPlace, voteList } = useAppStore(
        (state) => state
    );

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        (async () => {
            setIsLoading1(true);

            try {
                if (item) {
                    const response = await VoteService.fetchVoteDetail({
                        COMID: currentCompany?.COMID || 0,
                        PLACEID: currentPlace?.PLACEID || 0,
                        PAGE: 1,
                        SIZE: 1000,
                        FILTER: "",
                        EVENT_PID: item.PID,
                    });

                    setDataSource1(getDataFromPayloadRestful(response));
                }

                setIsLoading1(false);
            } catch (error) {
                setIsLoading1(false);
                console.log("Init form values: ", error);
            }
        })();
    }, [currentCompany, currentPlace, item]);

    useEffect(() => {
        (async () => {
            setIsLoading2(true);

            try {
                if (item) {
                    const response = await VoteService.fetchRankList({
                        FILTER: "",
                        EVENT_PID: item.PID,
                    });

                    setDataSource2(
                        getDataFromPayloadRestful(response)?.[0].ITEMS
                    );
                }

                setIsLoading2(false);
            } catch (error) {
                setIsLoading2(false);
                console.log("Init form values: ", error);
            }
        })();
    }, [item]);

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

    const columns1: any = [
        {
            title: t("DESCRIPTION"),
            dataIndex: "DESCRIPTION",
            key: "DESCRIPTION",
        },
        {
            title: t("MAXIMUM_NUMBER_OF_VOTES"),
            dataIndex: "MAX_DAILY_VOTE",
            key: "MAX_DAILY_VOTE",
            align: "center",
            render: (id: number) =>
                voteList.find((item: any) => item?.id == id)?.NAME ?? "",
        },
        {
            title: t("NUMBER_OF_HEARTS"),
            dataIndex: "AMOUNT_PER_VOTE",
            key: "AMOUNT_PER_VOTE",
            align: "center",
        },
        {
            title: t("ROULETTE_YN"),
            dataIndex: "ROULETTE_YN",
            key: "ROULETTE_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
    ];

    const columns2: any = [
        {
            title: tArtist("AVATAR"),
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
            title: t("ARTIST_TYPE"),
            dataIndex: "ARTIST_TYPE",
            key: "ARTIST_TYPE",
            render: (type: string) =>
                type == "G" ? t("GROUP") : type == "A" ? t("MEMBER") : "",
        },
        {
            title: tArtist("ARTIST_NAME"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: tArtist("KOREA_NAME"),
            dataIndex: "ALIAS_KR",
            key: "ALIAS_KR",
        },
        {
            title: tArtist("DOB"),
            dataIndex: "DOB",
            key: "DOB",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tArtist("DOD"),
            dataIndex: "DOD",
            key: "DOD",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={dialogTitle}
                placement="right"
                open={open}
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
                <Card
                    title={t("VOTE_EVENT_INFO")}
                    style={{ marginBottom: "16px" }}
                >
                    <Table
                        scroll={{ x: "max-content" }}
                        loading={isLoading1}
                        dataSource={dataSource1}
                        columns={columns1}
                    />
                </Card>

                <Card title={t("VOTE_ARTIST_LIST")}>
                    <Table
                        scroll={{ x: "max-content" }}
                        loading={isLoading2}
                        dataSource={dataSource2}
                        columns={columns2}
                    />
                </Card>
            </Drawer>
        </>
    );
};
