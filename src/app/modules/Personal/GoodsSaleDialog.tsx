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
import { GoodsSale } from "@/interfaces/personal";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";
import { PersonalService } from "@/app/services/personal";
import { useAppStore } from "@/hooks/useAppStore";

export const useGoodsSaleDialog = dialogStore<GoodsSale>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    APPROVALSTATE: string;
    REASONCODE: string;
    IMAGES: any;
    VIDEOS: any;
};

export const GoodsSaleDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Membership");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useGoodsSaleDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGES: any;
        VIDEOS: any;
    }>({
        IMAGES: [],
        VIDEOS: [],
    });

    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [reason, setReason] = useState("");

    const { userInfo } = useAppStore((state) => state);

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
                    CODE_ID: "REJECTSELLERGOODSREASON",
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
                IMAGES: item.IMAGES,
                VIDEOS: item.VIDEOS,
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
            setUploadedImages({ IMAGES: [], VIDEOS: [] });

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async (status: string) => {
        if (status == "R" && !reason) {
            openNotification("error", t("MEM_RQ_WARMING_1"), undefined, {
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        try {
            setIsLoading(true);

            if (item) {
                await PersonalService.updateGoodsSale({
                    GOODSID: item.GOODSID,
                    STATE: status,
                    MODBY: userInfo?.USERID ?? "",
                    ...(reason && {
                        REJECTID: reason,
                        REJECTREASON: commonCode.find(
                            (item) => item.CODE_LIST_ID == reason
                        )?.CODE_LIST_DISPLAY_NAME,
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
                name: "APPROVALSTATE",
                label: "MEM_RQ_STATUS",
                type: "select",
                disable: true,
                placeholder: "MEM_RQ_STATUS",
                colSpan: 24,
                options: [
                    {
                        label: t("MEM_RQ_PENDING"),
                        value: "P",
                    },
                    {
                        label: t("MEM_RQ_APPROVED"),
                        value: "A",
                    },
                    {
                        label: t("MEM_RQ_REJECTED"),
                        value: "R",
                    },
                ],
            },
            {
                name: "REASONCODE",
                label: "MEM_RQ_REASON",
                type: "select",
                disable: true,
                hidden: item?.APPROVALSTATE != "R",
                placeholder: "MEM_RQ_REASON",
                colSpan: 24,
                options: commonCode.map((item) => ({
                    label: translateContent(item.CODE_LIST_DISPLAY_NAME),
                    value: item.CODE_LIST_ID,
                })),
            },
            {
                name: "IMAGES",
                label: "MEM_RQ_FILE",
                type: "upload",
                disable: true,
                colSpan: 24,
            },
            {
                name: "VIDEOS",
                label: "MEM_RQ_FILE",
                type: "video",
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
                            {item?.APPROVALSTATE == "P" && (
                                <>
                                    <Popconfirm
                                        title={t("MEM_RQ_APPROVE")}
                                        placement="topLeft"
                                        onConfirm={() => handleSave("A")}
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
                                        onConfirm={() => handleSave("R")}
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
