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
import { PersonalSale } from "@/interfaces/personal";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";
import { PersonalService } from "@/app/services/personal";

export const usePersonalSaleDialog = dialogStore<PersonalSale>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    APPROVALSTATE: string;
    REASONCODE: string;
    IDPHOTOS: any;
};

export const PersonalSaleDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Membership");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = usePersonalSaleDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [uploadedImages, setUploadedImages] = useState<{
        IDPHOTOS: any;
    }>({
        IDPHOTOS: [],
    });

    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [reason, setReason] = useState("");

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
                    CODE_ID: "REJECTMEMBERSHIPREASON",
                });
                setCommonCode(getDataFromPayloadRestful(response));

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
        if (item) {
            setUploadedImages({
                IDPHOTOS: JSON.parse(item.IDPHOTOS)?.map((item: any) => ({
                    URL: item,
                })),
            });
            form.setFieldsValue(item);
        }
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
        if (status == "Rejected" && !reason) {
            openNotification("error", t("MEM_RQ_WARMING_1"), undefined, {
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        try {
            setIsLoading(true);

            if (item) {
                await PersonalService.grantUserPersonal({
                    COMID: 95,
                    PLACEID: 102,
                    USER_ID: item.USERID,
                    LINK_USER: item.MEMID,
                    TYPE: status,
                    ...(reason
                        ? {
                              REJECTID: reason,
                              REJECTREASON: commonCode.find(
                                  (item) => item.CODE_LIST_ID == reason
                              )?.CODE_LIST_DISPLAY_NAME,
                          }
                        : {
                              REJECTID: 0,
                              REJECTREASON: "",
                          }),
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
                name: "APPROVALSTATUS",
                label: "MEM_RQ_STATUS",
                type: "select",
                disable: true,
                placeholder: "MEM_RQ_STATUS",
                colSpan: 24,
                options: [
                    {
                        label: t("MEM_RQ_PENDING"),
                        value: "Pending",
                    },
                    {
                        label: t("MEM_RQ_APPROVED"),
                        value: "Approved",
                    },
                    {
                        label: t("MEM_RQ_REJECTED"),
                        value: "Rejected",
                    },
                ],
            },
            {
                name: "REASONCODE",
                label: "MEM_RQ_REASON",
                type: "select",
                disable: true,
                hidden: item?.APPROVALSTATUS != "Rejected",
                placeholder: "MEM_RQ_REASON",
                colSpan: 24,
                options: commonCode.map((item) => ({
                    label: translateContent(item.CODE_LIST_DISPLAY_NAME),
                    value: item.CODE_LIST_ID,
                })),
            },
            {
                name: "IDPHOTOS",
                label: "MEM_RQ_FILE",
                type: "upload",
                disable: true,
                colSpan: 24,
            },
        ],
        [commonCode, item, t]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Membership",
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
                            {item?.APPROVALSTATUS == "Pending" && (
                                <>
                                    <Popconfirm
                                        title={t("MEM_RQ_APPROVE")}
                                        placement="topLeft"
                                        onConfirm={() => handleSave("I")}
                                        okText={tCommon("CM_YN_Y")}
                                        cancelText={tCommon("CM_CANCEL")}
                                    >
                                        <Button
                                            type="primary"
                                            loading={isLoading}
                                        >
                                            {t("MEM_RQ_APPROVE")}
                                        </Button>
                                    </Popconfirm>

                                    <Popconfirm
                                        title={t("MEM_RQ_REJECT")}
                                        description={
                                            <Select
                                                style={{ width: 400 }}
                                                onChange={(value) =>
                                                    setReason(value)
                                                }
                                                options={commonCode.map(
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
                                        onConfirm={() => handleSave("D")}
                                        okText={tCommon("CM_YN_Y")}
                                        cancelText={tCommon("CM_CANCEL")}
                                    >
                                        <Button
                                            color="danger"
                                            variant="outlined"
                                            loading={isLoading}
                                        >
                                            {t("MEM_RQ_REJECT")}
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
                </Form>
            </Drawer>
        </>
    );
};
