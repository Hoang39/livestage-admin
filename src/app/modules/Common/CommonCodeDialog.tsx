import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContentByLocale,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";

export const useCommonCodeDialog = dialogStore<CommonCode>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    CODE_ID: string;
    CODE_NAME: string;
    REMARK: string;
    OPEN_TAG: string;
    OPTIONS: any;
};

const initFormValues: FormValues = {
    CODE_ID: "",
    CODE_NAME: "",
    REMARK: "",
    OPEN_TAG: "",
    OPTIONS: [],
};

export const CommonCodeDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useCommonCodeDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [forcedReload, setForcedReload] = useState(false);

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
                if (item) {
                    const response = await CommonService.fetchCommonCode({
                        CODE_ID: item.CODE_ID,
                    });

                    const rows = getDataFromPayloadRestful(response);

                    form.setFieldsValue({
                        ...item,
                        OPTIONS: rows?.map((item: CommonCode) => ({
                            codeListId: item.CODE_LIST_ID,
                            codeListName: item.CODE_LIST_NAME,
                            codeListNo: item.CODE_LIST_NO,
                            codeNo: item.CODE_NO,
                            useFlag: item.USE_FLAG,
                            codeListDisplayNameEn: translateContentByLocale(
                                item.CODE_LIST_DISPLAY_NAME ?? "",
                                "en_US"
                            ),
                            codeListDisplayNameKo: translateContentByLocale(
                                item.CODE_LIST_DISPLAY_NAME ?? "",
                                "ko_KR"
                            ),
                            codeListDisplayNameVi: translateContentByLocale(
                                item.CODE_LIST_DISPLAY_NAME ?? "",
                                "vi_VN"
                            ),
                        })),
                    });
                } else {
                    form.setFieldsValue(initFormValues);
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("Init form values: ", error);
            }
        })();
    }, [form, item, openNotification]);

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                await CommonService.updateCommonCodeGroup({
                    ...values,
                    CODE_NO: item.CODE_NO,
                });
            } else {
                await CommonService.insertCommonCodeGroup(values);
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

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);

            const options = form.getFieldValue("OPTIONS");

            if (options.length) {
                await Promise.all(
                    options.map((data: any) => {
                        CommonService.deleteCommonCode({
                            CODE_NO: item?.CODE_NO ?? 0,
                            CODE_LIST_ID: data.codeListId,
                        });
                    })
                );
            }

            await CommonService.deleteCommonCodeGroup({
                CODE_NO: item?.CODE_NO ?? 0,
            });

            openNotification(
                "success",
                tCommon("delete-successful"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            handleClose("success");
        } catch (error) {
            openNotification("error", tCommon("delete-failed"), undefined, {
                showProgress: true,
                pauseOnHover: true,
            });

            console.error("handleDelete error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [form, handleClose, item, openNotification, tCommon]);

    const handleAddItem = useCallback((add: any, _name: string) => {
        add?.();
    }, []);

    const handleSaveOptions = useCallback(
        async (payload: any) => {
            try {
                const optionsItem = form.getFieldValue("OPTIONS")[payload];

                if (optionsItem.codeNo) {
                    await CommonService.updateCommonCode({
                        CODE_LIST_DISPLAY_NAME: JSON.stringify({
                            en_US: optionsItem.codeListDisplayNameEn ?? "",
                            ko_KR: optionsItem.codeListDisplayNameKo ?? "",
                            vi_VN: optionsItem.codeListDisplayNameVi ?? "",
                        }),
                        CODE_LIST_ID: optionsItem.codeListId,
                        USE_FLAG: optionsItem.useFlag,
                        CODE_LIST_NAME: optionsItem.codeListName,
                        CODE_LIST_NO: optionsItem.codeListNo,
                        CODE_NO: optionsItem.codeNo,
                    });
                } else {
                    await CommonService.insertCommonCode({
                        CODE_LIST_DISPLAY_NAME: JSON.stringify({
                            en_US: optionsItem.codeListDisplayNameEn ?? "",
                            ko_KR: optionsItem.codeListDisplayNameKo ?? "",
                            vi_VN: optionsItem.codeListDisplayNameVi ?? "",
                        }),
                        CODE_LIST_ID: optionsItem.codeListId,
                        USE_FLAG: optionsItem.useFlag,
                        CODE_LIST_NAME: optionsItem.codeListName,
                        CODE_LIST_NO: optionsItem.codeListNo,
                        CODE_NO: item?.CODE_NO ?? 0,
                    });
                }

                openNotification(
                    "success",
                    tCommon("update-successful"),
                    undefined,
                    {
                        showProgress: true,
                        pauseOnHover: true,
                    }
                );

                setForcedReload(!forcedReload);
            } catch (error) {
                openNotification("error", tCommon("update-failed"), undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });
                console.error("handleSaveOptions: ", error);
            }
        },
        [forcedReload, form, item, openNotification, tCommon]
    );

    const handleDeleteOptions = useCallback(
        async (name: number, _parent?: any, config?: any) => {
            try {
                const options = form.getFieldValue("OPTIONS");
                const deletedOption = options[name];

                await CommonService.deleteCommonCode({
                    CODE_NO: deletedOption.codeNo,
                    CODE_LIST_ID: deletedOption.codeListId,
                });

                config?.();
                setForcedReload(!forcedReload);

                openNotification(
                    "success",
                    tCommon("delete-successful"),
                    undefined,
                    {
                        showProgress: true,
                        pauseOnHover: true,
                    }
                );
            } catch (error) {
                openNotification("error", tCommon("delete-failed"), undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });
                console.error("handleDeleteOptions: ", error);
            }
        },
        [forcedReload, form, openNotification, tCommon]
    );

    const fields: Field[] = useMemo(
        () => [
            {
                name: "CODE_ID",
                label: "CMC_CODE_ID",
                type: "input",
                required: true,
                placeholder: "CMC_CODE_ID",
                colSpan: 12,
            },
            {
                name: "CODE_NAME",
                label: "CMC_CODE_NAME",
                type: "input",
                required: true,
                placeholder: "CMC_CODE_NAME",
                colSpan: 12,
            },
            {
                name: "REMARK",
                label: "CMC_REMARK",
                type: "input",
                placeholder: "CMC_REMARK",
                colSpan: 12,
            },
            {
                name: "OPEN_TAG",
                label: "CMC_OPEN_TAG",
                type: "select",
                required: true,
                placeholder: "CMC_OPEN_TAG",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "OPTIONS",
                label: "CMC_CODE_LIST_ID",
                type: "options",
                colSpan: 24,
                hidden: !editMode,
                onSave: handleSaveOptions,
                onDelete: handleDeleteOptions,
                children: [
                    {
                        name: "codeListId",
                        label: "CMC_CODE_LIST_ID",
                        type: "input",
                        required: true,
                        placeholder: "CMC_CODE_LIST_ID",
                        colSpan: 10,
                    },
                    {
                        name: "codeListName",
                        label: "CMC_CODE_LIST_NAME",
                        type: "input",
                        required: true,
                        placeholder: "CMC_CODE_LIST_NAME",
                        colSpan: 10,
                    },
                    {
                        name: "codeListNo",
                        label: "CMC_CODE_LIST_NO",
                        type: "inputnumber",
                        required: true,
                        placeholder: "CMC_CODE_LIST_NO",
                        colSpan: 10,
                        min: 0,
                    },
                    {
                        name: "useFlag",
                        label: "CMC_USE_FLAG",
                        type: "select",
                        required: true,
                        placeholder: "CMC_USE_FLAG",
                        colSpan: 10,
                        options: [
                            { value: "Y", label: tCommon("CM_YN_Y") },
                            { value: "N", label: tCommon("CM_YN_N") },
                        ],
                    },
                    {
                        name: "codeListDisplayNameEn",
                        label: "CMC_CODE_LIST_DISPLAY_NAME_EN",
                        type: "input",
                        placeholder: "CMC_CODE_LIST_DISPLAY_NAME_EN",
                        colSpan: 8,
                    },
                    {
                        name: "codeListDisplayNameKo",
                        label: "CMC_CODE_LIST_DISPLAY_NAME_KO",
                        type: "input",
                        placeholder: "CMC_CODE_LIST_DISPLAY_NAME_KO",
                        colSpan: 8,
                    },
                    {
                        name: "codeListDisplayNameVi",
                        label: "CMC_CODE_LIST_DISPLAY_NAME_VI",
                        type: "input",
                        placeholder: "CMC_CODE_LIST_DISPLAY_NAME_VI",
                        colSpan: 8,
                    },
                ],
            },
        ],
        [editMode, handleDeleteOptions, handleSaveOptions, tCommon]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "CommonCode",
        handleAdd: handleAddItem,
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
                            <Button onClick={handleClose}>
                                {tCommon("CM_CANCEL")}
                            </Button>

                            {item && (
                                <Popconfirm
                                    title={tCommon("CM_REMOVE")}
                                    description={tCommon("delete-confirmation")}
                                    placement="topLeft"
                                    onConfirm={handleDelete}
                                    okText={tCommon("CM_YN_Y")}
                                    cancelText={tCommon("CM_CANCEL")}
                                >
                                    <Button
                                        color="danger"
                                        variant="outlined"
                                        loading={isLoading}
                                    >
                                        {tCommon("CM_REMOVE")}
                                    </Button>
                                </Popconfirm>
                            )}

                            <Button
                                type="primary"
                                onClick={handleSave}
                                loading={isLoading}
                            >
                                {tCommon("CM_SAVE")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    disabled={readonly}
                    initialValues={initFormValues}
                >
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
