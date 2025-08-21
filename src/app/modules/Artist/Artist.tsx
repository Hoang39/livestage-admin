import { Button, Card, Flex, Input, Table, Image } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { ArtistService } from "@/app/services/artist";
import { CategoryArtist, Artist as IArtist } from "@/interfaces/artist";
import timeService from "@/libs/timeService";
import { ArtistDialog, useArtistDialog } from "./ArtistDialog";
import { useAppStore } from "@/hooks/useAppStore";

const { Search } = Input;

interface ArtistProps {
    type: "A" | "G";
}

export const Artist = ({ type }: ArtistProps) => {
    const { t } = useTranslation("Artist");
    const { t: tCommon } = useTranslation("Common");

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<IArtist[]>([]);
    const [category, setCategory] = useState<CategoryArtist[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useArtistDialog();

    const fetchDataList = useCallback(async () => {
        if (
            currentCompany?.COMID == undefined ||
            currentPlace?.PLACEID == undefined
        ) {
            return;
        }

        setIsLoading(true);
        try {
            const payload = await ArtistService.fetchArtistList({
                FILTER: "",
                SORTBY: "D",
                SORTDIR: "D",
                PAGENUM: "1",
                PAGESIZE: "1000",
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                ARTIST_TYPE: type,
            });
            setDataList(getDataFromPayloadRestful(payload)?.[0]?.ITEMS);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace, type]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    useEffect(() => {
        (async () => {
            try {
                const payload = await ArtistService.fetchCategoryArtist({
                    TYPE: type,
                });
                setCategory(getDataFromPayloadRestful(payload));
            } catch (error) {
                console.error(error);
            }
        })();
    }, [type]);

    const columns: any = [
        {
            title: t("AVATAR"),
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
            title: t("USERID"),
            dataIndex: "USER_ID",
            key: "USER_ID",
        },
        {
            title: t("PASSWORD"),
            dataIndex: "PWD",
            key: "PWD",
            render: () => "********",
        },
        {
            title: t("ARTIST_NAME"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: t("KOREA_NAME"),
            dataIndex: "ALIAS_KR",
            key: "ALIAS_KR",
        },
        {
            title: t("GROUP_NAME"),
            dataIndex: "PARENT_NAME",
            key: "PARENT_NAME",
            hidden: type == "G",
        },
        {
            title: t("ARTIST_CATEGORY_NAME"),
            dataIndex: "ARTIST_CATEGORY_ID",
            key: "ARTIST_CATEGORY_ID",
            render: (id: number) =>
                translateContent(
                    category.find((item) => item.CATEGORYID == id)?.NAME ?? ""
                ),
        },
        {
            title: t("COMNAME"),
            dataIndex: "COMNAME",
            key: "COMNAME",
        },
        {
            title: t("DOB"),
            dataIndex: "DOB",
            key: "DOB",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("DOD"),
            dataIndex: "DOD",
            key: "DOD",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("FANCLUP_NAME"),
            dataIndex: "FANCLUB_NAME",
            key: "FANCLUB_NAME",
        },
        {
            title: t("NATIONAL"),
            dataIndex: "NATIONAL",
            key: "NATIONAL",
        },
        {
            title: t("ACTIVITIES_CONTENT"),
            dataIndex: "STATE_TEXT",
            key: "STATE_TEXT",
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
            title: t("FACEBOOK"),
            dataIndex: "FACE_URL",
            key: "FACE_URL",
        },
        {
            title: t("INSTAGRAM"),
            dataIndex: "INS_URL",
            key: "INS_URL",
        },
        {
            title: t("YOUTUBE"),
            dataIndex: "YOU_URL",
            key: "YOU_URL",
        },
        {
            title: t("CRTDATE"),
            dataIndex: "REG_DATE",
            key: "REG_DATE",
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
                title={t("ARTIST_LIST")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("ENTER_ARTIST_NAME")}
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
                    dataSource={dataList.filter((item: IArtist) =>
                        item.ALIAS.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <ArtistDialog
                type={type}
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
