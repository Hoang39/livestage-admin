import { Button, Card, Flex, Input, Table, Image } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { Category as ICategory } from "@/interfaces/category";
import { CategoryService } from "@/app/services/category";
import timeService from "@/libs/timeService";
import { CategoryDialog, useCategoryDialog } from "./CategoryDialog";

const { Search } = Input;

export const Category = () => {
    const { t } = useTranslation("Category");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<ICategory[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useCategoryDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await CategoryService.getCategoryList({});
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
            title: t("CATEGORY_GRID_IMAGE"),
            dataIndex: "IMAGE",
            key: "IMAGE",
            render: (src: string) => (
                <Image
                    width={50}
                    height={50}
                    preview={false}
                    src={src + "?t=" + new Date().getTime()}
                    fallback="img/no_image.jpeg"
                />
            ),
        },
        {
            title: t("CATEGORY_GRID_NAME"),
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
            title: t("CATEGORY_GRID_DESCRIPTION"),
            dataIndex: "DESCRIPTION",
            key: "DESCRIPTION",
        },
        {
            title: t("CATEGORY_GRID_ORDERSEQ"),
            dataIndex: "ORDERSEQ",
            key: "ORDERSEQ",
            align: "center",
        },
        {
            title: tCommon("CM_USEYN"),
            dataIndex: "USEYN",
            key: "USEYN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("CATEGORY_GRID_CRTDATE"),
            dataIndex: "CRTDATE",
            key: "CRTDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("CATEGORY_GRID_MODDATE"),
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
                title={t("CATEGORY_GRID_TITTLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("CATEGORY_SEARCH_PHL")}
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
                    rowKey={"CATEGORYID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: ICategory) =>
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

            <CategoryDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
