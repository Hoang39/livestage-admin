import { Button, Card, Popconfirm, Select, Space, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
    ChatReport,
    UserChatReport,
    UserClaimReport,
} from "@/interfaces/report";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { ReportService } from "@/app/services/report";
import timeService from "@/libs/timeService";
import { useNotificationContext } from "@/app/context/notification";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";

export const ReportChatList = ({
    item,
    status,
}: {
    item: ChatReport;
    status: string;
}) => {
    const { t } = useTranslation("Report");
    const { t: tCommon } = useTranslation("Common");
    const { t: tMembership } = useTranslation("Membership");

    const [commonCode1, setCommonCode1] = useState<CommonCode[]>([]);
    const [commonCode2, setCommonCode2] = useState<CommonCode[]>([]);
    const [reason, setReason] = useState("");

    const { openNotification } = useNotificationContext();

    const [dataSource, setDataSource] = useState<
        (UserClaimReport | UserChatReport)[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            if (status == "P" || status == "I") {
                const response = await ReportService.fetchUserClaimReport({
                    USER_PID: item.TARGET_USER_PID,
                    STATUS: status,
                });

                setDataSource(getDataFromPayloadRestful(response));
            } else {
                const response = await ReportService.fetchUserChatReport({
                    TARGET_USER_PID: item.TARGET_USER_PID,
                    STATUS: status,
                    ACTION_TYPE: "CHAT",
                    REPORT_PID: "",
                });

                setDataSource(getDataFromPayloadRestful(response));
            }
        } catch (error) {
            console.log("Error getCompanyList: ", error);
        }

        setIsLoading(false);
    }, [item, status]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                const response = await CommonService.fetchCommonCode({
                    CODE_ID: "BLOCKCHATREASON",
                });

                setCommonCode1(getDataFromPayloadRestful(response));

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("error fetching reason code: ", error);
            }
        })();
    }, [openNotification]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                const response = await CommonService.fetchCommonCode({
                    CODE_ID: "REJECTCOMPLAINCHATREASON",
                });

                setCommonCode2(getDataFromPayloadRestful(response));

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("error fetching reason code: ", error);
            }
        })();
    }, [openNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (status: string, record: any) => {
        if ((status == "ban" || status == "complain") && !reason) {
            openNotification(
                "error",
                tMembership("MEM_RQ_WARMING_1"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );
            return;
        }

        try {
            setIsLoading(true);

            if (status == "unban") {
                await ReportService.removeUserReport({
                    RESULT_PID: `${record.RESULT_PID}`,
                });
            }

            if (status == "ban") {
                await ReportService.insertUserReport({
                    REASON_CODE: reason ?? "",
                    REASON_NAME:
                        commonCode1.find((item) => item.CODE_LIST_ID == reason)
                            ?.CODE_LIST_DISPLAY_NAME ?? "",
                    REPORT_PID: `${record.REPORT_PID}`,
                    USER_PID: record.TARGET_USER_PID,
                    LINK_USER: record.TARGET_MEM_ID,
                });
            }

            if (status == "complain") {
                await ReportService.updateUserReport({
                    REASON_CODE: reason ?? "",
                    REASON_NAME:
                        commonCode2.find((item) => item.CODE_LIST_ID == reason)
                            ?.CODE_LIST_DISPLAY_NAME ?? "",
                    RESULT_PID: `${record.REPORT_PID}`,
                    REPORT_TYPE: "USER",
                    USER_PID: record.USER_PID,
                    LINK_USER: record.LINK_USER,
                });
            }

            openNotification(
                "success",
                tCommon(item ? "update-successful" : "create-successful"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            await fetchData();
        } catch (error) {
            openNotification(
                "error",
                tCommon(item ? "update-failed" : "create-failed"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            console.error("Validation or save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns: any = [
        {
            title: t("RP_DATE"),
            dataIndex: "CRT_DATE",
            key: "CRT_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("RP_PERSON_REPORT"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: "Room ID",
            dataIndex: "CHAT_ROOM_ID",
            key: "CHAT_ROOM_ID",
        },
        {
            title: t("PR_CONTENT_REPORT"),
            dataIndex: "REASON_NAME",
            key: "REASON_NAME",
            render: (text: string) => translateContent(text),
        },
        {
            title: t("RP_STATUS"),
            dataIndex: "STATUS",
            key: "STATUS",
            render: (text: string) =>
                text == "P"
                    ? t("RP_STATUS_COMPLAIN")
                    : text == "I"
                    ? t("RP_STATUS_BLOCKED")
                    : text == "R"
                    ? t("RP_STATUS_REPORTING")
                    : text == "C"
                    ? t("RP_STATUS_SUCCESS")
                    : "",
        },
        {
            title: "",
            dataIndex: "",
            key: "",
            render: (_: any, record: any) => (
                <Space
                    style={{
                        width: "100%",
                        justifyContent: "flex-end",
                    }}
                >
                    {record?.STATUS == "I" && (
                        <>
                            <Popconfirm
                                title={t("RP_OPEN_BLOCK")}
                                placement="topLeft"
                                onConfirm={() => handleSave("unban", record)}
                                okText={tCommon("CM_YN_Y")}
                                cancelText={tCommon("CM_CANCEL")}
                            >
                                <Button type="primary" loading={isLoading}>
                                    {t("RP_OPEN_BLOCK")}
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                    {(record?.STATUS == "R" || record?.STATUS == "") && (
                        <>
                            <Popconfirm
                                title={t("RP_CLOSE_BLOCK")}
                                description={
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={(value) => setReason(value)}
                                        options={commonCode1.map((item) => ({
                                            label: translateContent(
                                                item.CODE_LIST_DISPLAY_NAME
                                            ),
                                            value: item.CODE_LIST_ID,
                                        }))}
                                    />
                                }
                                placement="topLeft"
                                onConfirm={() => handleSave("ban", record)}
                                okText={tCommon("CM_YN_Y")}
                                cancelText={tCommon("CM_CANCEL")}
                            >
                                <Button
                                    color="danger"
                                    variant="outlined"
                                    loading={isLoading}
                                >
                                    {t("RP_CLOSE_BLOCK")}
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                    {record?.STATUS == "P" && (
                        <>
                            <Popconfirm
                                title={t("RP_OPEN_BLOCK")}
                                placement="topLeft"
                                onConfirm={() => handleSave("unban", record)}
                                okText={tCommon("CM_YN_Y")}
                                cancelText={tCommon("CM_CANCEL")}
                            >
                                <Button type="primary" loading={isLoading}>
                                    {t("RP_OPEN_BLOCK")}
                                </Button>
                            </Popconfirm>

                            <Popconfirm
                                title={t("RP_REJECT_COMPLAIN")}
                                description={
                                    <Select
                                        style={{ width: 400 }}
                                        onChange={(value) => setReason(value)}
                                        options={commonCode2.map((item) => ({
                                            label: translateContent(
                                                item.CODE_LIST_DISPLAY_NAME
                                            ),
                                            value: item.CODE_LIST_ID,
                                        }))}
                                    />
                                }
                                placement="topLeft"
                                onConfirm={() => handleSave("complain", record)}
                                okText={tCommon("CM_YN_Y")}
                                cancelText={tCommon("CM_CANCEL")}
                            >
                                <Button
                                    color="danger"
                                    variant="outlined"
                                    loading={isLoading}
                                >
                                    {t("RP_REJECT_COMPLAIN")}
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card title={t("RP_LIST_REPORT_TITLE")}>
            <Table
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource}
                columns={columns}
            />
        </Card>
    );
};
