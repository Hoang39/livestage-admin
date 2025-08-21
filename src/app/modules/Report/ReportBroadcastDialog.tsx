import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Popconfirm,
    Select,
} from "antd";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { BroadcastReport } from "@/interfaces/report";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";
import { ReportService } from "@/app/services/report";
import { ReportBroadcastList } from "./ReportBroadcastList";

export const useReportBroadcastDialog = dialogStore<BroadcastReport>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    REPORT_STATUS: string;
    REASON_NAME: string;
    REPORT_PID: string;
    COMPLAIN_INFO_DESCRIPTION: string;
    IDPHOTOS: any;
};

export const ReportBroadcastDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Report");
    const { t: tCommon } = useTranslation("Common");
    const { t: tMembership } = useTranslation("Membership");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useReportBroadcastDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [commonCode1, setCommonCode1] = useState<CommonCode[]>([]);
    const [commonCode2, setCommonCode2] = useState<CommonCode[]>([]);
    const [reason, setReason] = useState("");

    const [uploadedImages, setUploadedImages] = useState<{
        IDPHOTOS: any;
    }>({
        IDPHOTOS: [],
    });

    const [form] = Form.useForm<FormValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                const response = await CommonService.fetchCommonCode({
                    CODE_ID: "REPORTLIVEREASON",
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
                    CODE_ID: "REJECTCOMPLAINREASON",
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
        (async () => {
            if (item) {
                if (item.REPORT_STATUS == "P") {
                    setUploadedImages({
                        IDPHOTOS: JSON.parse(item.COMPLAIN_INFO)?.IDPHOTOS?.map(
                            (item: any) => ({
                                URL: item,
                            })
                        ),
                    });
                }

                form.setFieldsValue({
                    ...item,
                    REASON_NAME: translateContent(item.REASON_NAME),
                    ...(item.REPORT_STATUS == "P"
                        ? {
                              COMPLAIN_INFO_DESCRIPTION: JSON.parse(
                                  item.COMPLAIN_INFO
                              )?.DESCRIPTION,
                          }
                        : {}),
                });
            }
        })();
    }, [form, item]);

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            setReason("");
            setUploadedImages({ IDPHOTOS: [] });

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async (status: string) => {
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

            if (item) {
                if (status == "unban") {
                    await ReportService.removeReport({
                        TARGET_PID: item.PID,
                        REPORT_TYPE: "VID",
                        USER_PID: item.USER_PID,
                        USER_ID: item.USER_ID,
                        LINK_USER: item.LINK_USER,
                    });
                }

                if (status == "ban") {
                    await ReportService.insertReport({
                        REASON_CODE: reason ?? "",
                        REASON_NAME:
                            commonCode1.find(
                                (item) => item.CODE_LIST_ID == reason
                            )?.CODE_LIST_DISPLAY_NAME ?? "",
                        TARGET_PID: item.PID,
                        REPORT_TYPE: "VID",
                        USER_PID: item.USER_PID,
                        USER_ID: item.USER_ID,
                        LINK_USER: item.LINK_USER,
                    });
                }

                if (status == "complain") {
                    await ReportService.updateReport({
                        REASON_CODE: reason ?? "",
                        REASON_NAME:
                            commonCode2.find(
                                (item) => item.CODE_LIST_ID == reason
                            )?.CODE_LIST_DISPLAY_NAME ?? "",
                        TARGET_PID: item.PID,
                        REPORT_TYPE: "VID",
                        COMPLAIN_INFO: "",
                        STATUS: "I",
                        USER_PID: item.USER_PID,
                        USER_ID: item.USER_ID,
                        LINK_USER: item.LINK_USER,
                        REPORT_PID: item.REPORT_PID,
                    });
                }
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

            handleClose("success");
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

    const fields: Field[] = useMemo(
        () => [
            {
                name: "REPORT_STATUS",
                label: "RP_STATUS",
                type: "select",
                disable: true,
                placeholder: "RP_STATUS",
                colSpan: 24,
                options: [
                    {
                        label: t("RP_STATUS_COMPLAIN"),
                        value: "P",
                    },
                    {
                        label: t("RP_STATUS_BLOCKED"),
                        value: "I",
                    },
                    {
                        label: t("RP_STATUS_REPORTING"),
                        value: "R",
                    },
                ],
            },
            {
                name: "REPORT_PID",
                label: "RP_REPORT_PID",
                type: "input",
                disable: true,
                hidden:
                    item?.REPORT_STATUS != "I" && item?.REPORT_STATUS != "P",
                placeholder: "RP_REPORT_PID",
                colSpan: 24,
            },
            {
                name: "REASON_NAME",
                label: "RP_REASON_LOCK",
                type: "input",
                disable: true,
                hidden:
                    item?.REPORT_STATUS != "I" && item?.REPORT_STATUS != "P",
                placeholder: "RP_REASON_LOCK",
                colSpan: 24,
            },
            {
                name: "COMPLAIN_INFO_DESCRIPTION",
                label: "RP_COMPLAIN_TITLE",
                type: "input",
                disable: true,
                hidden: item?.REPORT_STATUS != "P",
                placeholder: "RP_COMPLAIN_TITLE",
                colSpan: 24,
            },
            {
                name: "IDPHOTOS",
                label: "RP_COMPLAIN_TITLE",
                type: "upload",
                disable: true,
                colSpan: 24,
                hidden: item?.REPORT_STATUS != "P",
            },
        ],
        [item, t]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Report",
        uploadedImages,
    });

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={dialogTitle}
                placement="right"
                open={open}
                loading={isLoading}
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
                            {item?.REPORT_STATUS == "I" && (
                                <>
                                    <Popconfirm
                                        title={t("RP_OPEN_BLOCK")}
                                        placement="topLeft"
                                        onConfirm={() => handleSave("unban")}
                                        okText={tCommon("CM_YN_Y")}
                                        cancelText={tCommon("CM_CANCEL")}
                                    >
                                        <Button
                                            type="primary"
                                            loading={isLoading}
                                        >
                                            {t("RP_OPEN_BLOCK")}
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                            {(item?.REPORT_STATUS == "R" ||
                                item?.REPORT_STATUS == "") && (
                                <>
                                    <Popconfirm
                                        title={t("RP_CLOSE_BLOCK")}
                                        description={
                                            <Select
                                                style={{ width: 400 }}
                                                onChange={(value) =>
                                                    setReason(value)
                                                }
                                                options={commonCode1.map(
                                                    (item) => ({
                                                        label: translateContent(
                                                            item.CODE_LIST_DISPLAY_NAME
                                                        ),
                                                        value: item.CODE_LIST_ID,
                                                    })
                                                )}
                                            />
                                        }
                                        placement="topLeft"
                                        onConfirm={() => handleSave("ban")}
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
                            {item?.REPORT_STATUS == "P" && (
                                <>
                                    <Popconfirm
                                        title={t("RP_OPEN_BLOCK")}
                                        placement="topLeft"
                                        onConfirm={() => handleSave("unban")}
                                        okText={tCommon("CM_YN_Y")}
                                        cancelText={tCommon("CM_CANCEL")}
                                    >
                                        <Button
                                            type="primary"
                                            loading={isLoading}
                                        >
                                            {t("RP_OPEN_BLOCK")}
                                        </Button>
                                    </Popconfirm>

                                    <Popconfirm
                                        title={t("RP_REJECT_COMPLAIN")}
                                        description={
                                            <Select
                                                style={{ width: 400 }}
                                                onChange={(value) =>
                                                    setReason(value)
                                                }
                                                options={commonCode2.map(
                                                    (item) => ({
                                                        label: translateContent(
                                                            item.CODE_LIST_DISPLAY_NAME
                                                        ),
                                                        value: item.CODE_LIST_ID,
                                                    })
                                                )}
                                            />
                                        }
                                        placement="topLeft"
                                        onConfirm={() => handleSave("complain")}
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

                            <Button onClick={handleClose}>
                                {tCommon("CM_CANCEL")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Form form={form} layout="vertical" disabled={readonly}>
                    <Row gutter={[16, 0]}>
                        {fields.map((field, index) => (
                            <Col span={field.colSpan} key={index}>
                                {render(field)}
                            </Col>
                        ))}
                    </Row>

                    {item?.REPORT_STATUS != "P" && (
                        <ReportBroadcastList item={item as BroadcastReport} />
                    )}
                </Form>
            </Drawer>
        </>
    );
};
