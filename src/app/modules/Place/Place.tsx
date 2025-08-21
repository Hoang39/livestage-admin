import { Button, Card, Flex, Image, Input, Select, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Place as IPlace } from "@/interfaces/business";
import { useTranslation } from "react-i18next";
import { CommonService } from "@/app/services/common";
import { getLinkUrlResource } from "@/utils/getLinkUrlResource";
import timeService from "@/libs/timeService";
import { useAppStore } from "@/hooks/useAppStore";
import { getShopId } from "@/utils/getShopId";
import { PlaceDialog, usePlaceDialog } from "./PlaceDialog";

const { Search } = Input;

export const Place = () => {
    const { t } = useTranslation("Company");
    const { t: tCommon } = useTranslation("Common");
    const { t: tCategory } = useTranslation("Category");

    const { companyList } = useAppStore((state) => state);

    const [dataSource, setDataSource] = useState<IPlace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [comId, setComId] = useState(companyList[0].COMID);

    const { openDialog } = usePlaceDialog();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const listRes = await CommonService.getPlaceInfo({
                COMID: comId,
                PLACEID: "",
                PLACENAME: "",
            });
            setDataSource(listRes.RESULT_DATA);
        } catch (error) {
            console.log("Error getCompanyList: ", error);
        }

        setIsLoading(false);
    }, [comId]);

    useEffect(() => {
        fetchData();
    }, [comId, fetchData]);

    const columns: any = [
        {
            title: "",
            dataIndex: "THUMURL",
            key: "THUMURL",
            width: 120,
            align: "center",
            render: (text: string) => (
                <Image
                    onClick={(e) => e.stopPropagation()}
                    preview={false}
                    width={60}
                    src={getLinkUrlResource(text)}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: t("COM_GRID_2_PLACENAME"),
            dataIndex: "PLACENAME",
            key: "PLACENAME",
        },
        {
            title: "ID",
            dataIndex: "SHOPID",
            key: "SHOPID",
            render: (_: any, record: any) =>
                getShopId(record.COMID, record.PLACEID),
        },
        {
            title: t("COM_GRID_2_ZIP"),
            dataIndex: "ZIP",
            key: "ZIP",
        },
        {
            title: t("COM_GRID_2_ADDR"),
            dataIndex: "ADDR",
            key: "ADDR",
        },
        {
            title: t("COM_GRID_2_TEL"),
            dataIndex: "TEL",
            key: "TEL",
        },
        {
            title: t("COM_GRID_2_MANAGER"),
            dataIndex: "MANAGER",
            key: "MANAGER",
        },
        {
            title: t("COM_GRID_2_MNGMOBILE"),
            dataIndex: "MNGMOBILE",
            key: "MNGMOBILE",
        },
        {
            title: t("COM_GRID_2_EMAIL"),
            dataIndex: "EMAIL",
            key: "EMAIL",
        },
        {
            title: t("COM_GRID_2_SHIPPINGFEE"),
            dataIndex: "SHIPPINGFEE",
            key: "SHIPPINGFEE",
        },
        {
            title: t("COM_GRID_2_FREESHIPPINGFEE"),
            dataIndex: "FREESHIPPINGFEE",
            key: "FREESHIPPINGFEE",
        },
        {
            title: t("COM_GRID_2_DELIVERYPERIOD"),
            dataIndex: "DELIVERYPERIOD",
            key: "DELIVERYPERIOD",
        },
        {
            title: t("COM_GRID_2_ADDSHIPPINGFEE"),
            dataIndex: "ADDSHIPPINGFEE",
            key: "ADDSHIPPINGFEE",
        },
        {
            title: t("COM_GRID_2_RETURNSHIPPINGFEE"),
            dataIndex: "RETURNSHIPPINGFEE",
            key: "RETURNSHIPPINGFEE",
        },
        {
            title: t("COM_GRID_2_EXCHANGESHIPPINGFEE"),
            dataIndex: "EXCHANGESHIPPINGFEE",
            key: "EXCHANGESHIPPINGFEE",
        },
        {
            title: t("COM_GRID_2_BASICINFO"),
            dataIndex: "BASICINFO",
            key: "BASICINFO",
        },
        {
            title: t("COM_GRID_2_RETURNREFUNDPOLICYINFO"),
            dataIndex: "RETURNREFUNDPOLICYINFO",
            key: "RETURNREFUNDPOLICYINFO",
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
            title: t("COM_GRID_2_USEYN"),
            dataIndex: "USEYN",
            key: "USEYN",
            render: (key: string) =>
                key == "Y" ? tCommon("CM_YN_Y") : t("CM_YN_N"),
        },
        {
            title: tCategory("CATEGORY_GRID_CRTDATE"),
            dataIndex: "CRTDATE",
            key: "CRTDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <Card
            title={t("COM_GRID_2_TITLE")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("COM_SEARCH_GRID_2_TITLE")}
                        allowClear
                        onSearch={(value) => {
                            setSearchTerm(value);
                        }}
                        style={{ width: 200 }}
                    />

                    <Select
                        style={{ width: 200 }}
                        value={comId}
                        onChange={(value) => setComId(value)}
                        options={companyList.map((item) => ({
                            value: item.COMID,
                            label: item.COMNAME,
                        }))}
                    />

                    <Button type="primary" onClick={handleAddItem}>
                        {tCommon("CM_ADD")}
                    </Button>
                </Flex>
            }
        >
            <Table
                rowKey="PLACEID"
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource?.filter((item) =>
                    item.PLACENAME.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    )
                )}
                columns={columns}
                onRow={(record) => ({
                    onClick: () => openDialog(record),
                })}
            />
            <PlaceDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
