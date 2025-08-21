import { Button, Card, Flex, Image, Input, Table } from "antd";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BannerService } from "@services/banner";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { handleImagePath } from "@/utils/handleImage";
import { translateContent } from "@/utils/handleResponse";
import { Banner as IBanner } from "@/interfaces/banner";
import { useAppStore } from "@/hooks/useAppStore";
import timeService from "@/libs/timeService";
import { BannerDialog, useBannerDialog } from "./BannerDialog";
interface BannerProps {
    role: "banner" | "sub-banner";
}

const { Search } = Input;

export const Banner = ({ role }: BannerProps) => {
    const { t } = useTranslation("Banner");
    const { t: tCommon } = useTranslation("Common");
    const { t: tBroadcast } = useTranslation("Broadcast");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useBannerDialog();

    const { categoryList } = useAppStore((state) => state);

    const [filter] = useState({
        PAGE_NUM: 1,
        PAGE_SIZE: 500,
    });

    const fetchData = useCallback(
        async (params: typeof filter) => {
            setIsLoading(true);
            try {
                const payload = await BannerService.fetchBanners({
                    ...params,
                    MAIN_TF: role == "banner" ? "T" : "F",
                });
                setDataList(getDataFromPayloadRestful(payload));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        },
        [role]
    );

    const getDataDisplay = useCallback((item: any) => {
        switch (item.TYPE) {
            case "L":
                return item.LIVE_TITLE;
            case "G":
                return item.GOODS_NAME;
            case "U":
            case "T":
                return item.METADATA;
            default:
                return "";
        }
    }, []);

    const bannerTypes = useMemo(
        () => [
            { id: "N", TYPE: t("BANNER_GRID_TYPE_O_N") },
            { id: "L", TYPE: t("BANNER_GRID_TYPE_O_L") },
            { id: "G", TYPE: t("BANNER_GRID_TYPE_O_G") },
            { id: "U", TYPE: t("BANNER_GRID_TYPE_O_U") },
            { id: "T", TYPE: t("BANNER_GRID_TYPE_O_T") },
        ],
        [t]
    );

    const renderBannerType = useCallback(
        (type: string) => {
            const bannerType = bannerTypes.find((item) => item.id === type);
            return bannerType ? bannerType.TYPE : "";
        },
        [bannerTypes]
    );

    const handleData = useCallback(
        (data: IBanner) => {
            try {
                return {
                    ...data,
                    DATA_DISPLAY: getDataDisplay(data),
                    MAIN_TF: role == "banner" ? "T" : "F",
                };
            } catch (error) {
                console.log("🚀 ~ handleDataBanner ~ error:", error);
                return data;
            }
        },
        [getDataDisplay, role]
    );

    useEffect(() => {
        // Fetch data
        fetchData(filter);
    }, [filter, fetchData]);

    const columns: any = [
        {
            title: t("BANNER_GRID_IMAGE_URL"),
            dataIndex: "IMAGE_URL",
            key: "IMAGE_URL",
            render: (src: string) => (
                <Image
                    width={role == "banner" ? 50 : 140}
                    height={50}
                    preview={false}
                    src={handleImagePath(src)}
                    fallback="img/no_image.jpeg"
                />
            ),
        },
        {
            title: t("BANNER_GRID_TITLE"),
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
            title: t("BANNER_GRID_TYPE"),
            dataIndex: "TYPE",
            key: "TYPE",
            render: (text: string) => renderBannerType(text),
            align: "center",
        },
        {
            title: t("BANNER_GRID_DATA_DISPLAY"),
            dataIndex: "DATA_DISPLAY",
            key: "DATA_DISPLAY",
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 400,
                    }}
                >
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("BANNER_GRID_START_DATE"),
            dataIndex: "START_DATE",
            key: "START_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("BANNER_GRID_END_DATE"),
            dataIndex: "END_DATE",
            key: "END_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: tBroadcast("BROADCAST_GRID_1_CATEGORY_ID"),
            dataIndex: "CATEGORY_ID",
            key: "CATEGORY_ID",
            align: "center",
            render: (id: string) =>
                categoryList.filter(
                    (item) => item.CATEGORYID.toString() == id
                )?.[0]?.NAME,
            hidden: role == "banner",
        },
        {
            title: t("BANNER_GRID_SORT_NO"),
            dataIndex: "SORT_NO",
            key: "SORT_NO",
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
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog({
            MAIN_TF: role == "banner" ? "T" : "F",
        });
    };

    return (
        <>
            <Card
                title={role == "banner" ? t("Banner") : t("SubBanner")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("BANNER_GRID_TITLE")}
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
                    rowKey={"PID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList
                        .map((item: IBanner) => handleData(item))
                        .filter((item: IBanner) =>
                            item.TITLE.toLowerCase().includes(
                                searchTerm.toLowerCase()
                            )
                        )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () =>
                            openDialog({
                                ...record,
                                MAIN_TF: role == "banner" ? "T" : "F",
                            }),
                    })}
                />

                <BannerDialog
                    onClose={async (status) => {
                        if (status === "success") {
                            await fetchData(filter);
                        }
                    }}
                />
            </Card>
        </>
    );
};
