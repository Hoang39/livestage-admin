import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { EventService } from "@/app/services/event";
import { Event as IEvent } from "@/interfaces/event";
import timeService from "@/libs/timeService";
import { EventDialog, useEventDialog } from "./EventDialog";

const { Search } = Input;

export const Event = () => {
    const { t } = useTranslation("Event");
    const { t: tCommon } = useTranslation("Common");
    const { t: tCategory } = useTranslation("Category");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<IEvent[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useEventDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await EventService.fetchEventList({
                USEYN: "",
            });
            setDataList(getDataFromPayloadRestful(payload));
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
            title: t("EVENT_GRID_TITLE"),
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
            title: t("EVENT_GRID_KEYNAME"),
            dataIndex: "KEYNAME",
            key: "KEYNAME",
        },
        {
            title: t("EVENT_GRID_BONUS"),
            dataIndex: "BONUS",
            key: "BONUS",
        },
        {
            title: t("EVENT_GRID_RULES"),
            dataIndex: "RULES",
            key: "RULES",
        },
        {
            title: t("EVENT_GRID_STARTDATE"),
            dataIndex: "STARTDATE",
            key: "STARTDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("EVENT_GRID_ENDDATE"),
            dataIndex: "ENDDATE",
            key: "ENDDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: tCategory("CATEGORY_GRID_MODDATE"),
            dataIndex: "MODDATE",
            key: "MODDATE",
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
                title={t("EVENT_GRID_TITTLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("EVENT_SEARCH_PHL")}
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
                    dataSource={dataList.filter((item: IEvent) =>
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

            <EventDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
