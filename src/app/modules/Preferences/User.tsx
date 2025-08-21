import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { CommonService } from "@/app/services/common";
import { AuthUser as IAuthUser } from "@/interfaces/common";
import { useAppStore } from "@/hooks/useAppStore";
import timeService from "@/libs/timeService";
import { AuthUserDialog, useAuthUserDialog } from "./UserDialog";

const { Search } = Input;

export const AuthUser = () => {
    const { t } = useTranslation("AuthUser");
    const { t: tAuthMenu } = useTranslation("AuthMenu");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<IAuthUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useAuthUserDialog();

    const { userInfo } = useAppStore((state) => state);

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await CommonService.fetchAuthUser({
                COMID: "",
                USERID: userInfo?.USERID,
            });
            setDataList(getDataFromPayloadRestful(payload));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [userInfo]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: t("AUTH_USER_GRID_UPDATE_USERID"),
            dataIndex: "UPDATE_USERID",
            key: "UPDATE_USERID",
        },
        {
            title: t("AUTH_USER_GRID_PWD"),
            dataIndex: "PWD",
            key: "PWD",
        },
        {
            title: t("AUTH_USER_GRID_USERNAME"),
            dataIndex: "USERNAME",
            key: "USERNAME",
        },
        {
            title: t("AUTH_USER_GRID_USERLEVEL"),
            dataIndex: "USERLEVEL",
            key: "USERLEVEL",
            render: (text: string) =>
                text == "A"
                    ? tAuthMenu("AUTH_MENU_USER_LEVEL_A")
                    : text == "B"
                    ? tAuthMenu("AUTH_MENU_USER_LEVEL_B")
                    : tAuthMenu("AUTH_MENU_USER_LEVEL_C"),
        },
        {
            title: t("AUTH_USER_GRID_COMPLACENAME"),
            dataIndex: "COMPLACENAME",
            key: "COMPLACENAME",
        },
        {
            title: t("AUTH_USER_GRID_EMAIL"),
            dataIndex: "EMAIL",
            key: "EMAIL",
        },
        {
            title: t("AUTH_USER_GRID_CRTDATE"),
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
        <>
            <Card
                title={t("AUTH_USER_GRID_TITLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("AUTH_USER_SEARCH_TITLE")}
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
                    rowKey={"USERID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: IAuthUser) =>
                        item.USERNAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <AuthUserDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
