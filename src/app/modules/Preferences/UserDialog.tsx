import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { AuthUser } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";
import { useAppStore } from "@/hooks/useAppStore";
import { CompanyService } from "@/app/services/company";
import { Place } from "@/interfaces/business";
import { sha512 } from "js-sha512";

export const useAuthUserDialog = dialogStore<AuthUser>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = Partial<AuthUser>;

const initFormValues: FormValues = {
    UPDATE_USERID: "",
    PWD: "",
    USERNAME: "",
    USERLEVEL: "",
    EMAIL: "",
};

export const AuthUserDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tAuthMenu } = useTranslation("AuthMenu");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useAuthUserDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [userLevel, setUserLevel] = useState("");
    const [placeList, setPlaceList] = useState<Place[]>([]);

    const [form] = Form.useForm<FormValues>();

    const { companyList } = useAppStore((state) => state);

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
                    if (item.COMID) {
                        const listRes = await CompanyService.getPlaceList({
                            COMID: item.COMID,
                        });
                        setPlaceList(listRes.RESULT_DATA);
                    }

                    setUserLevel(item.USERLEVEL);

                    form.setFieldsValue({
                        ...item,
                        PWD: "",
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

    const onValuesChange = async (
        changedValues: Partial<FormValues>,
        _allValues: FormValues
    ) => {
        if (changedValues.USERLEVEL) {
            setUserLevel(changedValues.USERLEVEL);
        }
        if (changedValues.COMID) {
            const listRes = await CompanyService.getPlaceList({
                COMID: changedValues.COMID,
            });
            setPlaceList(listRes.RESULT_DATA);
            form.setFieldValue("PLACEID", undefined);
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            setUserLevel("");
            setPlaceList([]);

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
                await CommonService.updateAuthUser({
                    ...values,
                    ...(values.PWD
                        ? { PWD: sha512(values.PWD) }
                        : { PWD: undefined }),
                    USERID: item.USERID,
                    APP_ID: __APP_ID__,
                    VIEWYN: "N",
                    ...(values.COMID ? { COMID: values.COMID } : { COMID: 0 }),
                    ...(values.PLACEID
                        ? { PLACEID: values.PLACEID }
                        : { PLACEID: 0 }),
                });
            } else {
                const response = await CommonService.insertAuthUser({
                    ...values,
                    PWD: sha512(values.PWD ?? ""),
                    USERID: values.UPDATE_USERID ?? "",
                    UPDATE_USERID: undefined,
                    APP_ID: __APP_ID__,
                    VIEWYN: "N",
                    ...(values.COMID ? { COMID: values.COMID } : { COMID: 0 }),
                    ...(values.PLACEID
                        ? { PLACEID: values.PLACEID }
                        : { PLACEID: 0 }),
                });

                if (response?.RESULT_DATA?.[0]?.RNTMSG != "SUCCESSFULLY") {
                    openNotification(
                        "error",
                        response?.RESULT_DATA?.[0]?.RNTMSG,
                        undefined,
                        {
                            showProgress: true,
                            pauseOnHover: true,
                        }
                    );

                    return;
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

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);

            await CommonService.deleteAuthUser({
                USERID: item?.USERID ?? "",
                APP_ID: __APP_ID__,
                COMID: item?.COMID,
                PLACEID: item?.PLACEID,
                USERLEVEL: item?.USERLEVEL,
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
    }, [handleClose, item, openNotification, tCommon]);

    const fields: Field[] = useMemo(
        () => [
            {
                name: "UPDATE_USERID",
                label: "AUTH_USER_GRID_UPDATE_USERID",
                type: "input",
                required: true,
                placeholder: "AUTH_USER_GRID_UPDATE_USERID",
                colSpan: 12,
            },
            {
                name: "PWD",
                label: "AUTH_USER_GRID_PWD",
                type: "input",
                required: !item,
                placeholder: "AUTH_USER_GRID_PWD",
                colSpan: 12,
            },
            {
                name: "USERNAME",
                label: "AUTH_USER_GRID_USERNAME",
                type: "input",
                required: true,
                placeholder: "AUTH_USER_GRID_USERNAME",
                colSpan: 12,
            },
            {
                name: "USERLEVEL",
                label: "AUTH_USER_GRID_USERLEVEL",
                type: "select",
                required: true,
                placeholder: "AUTH_USER_GRID_USERLEVEL",
                colSpan: 12,
                options: [
                    { value: "A", label: tAuthMenu("AUTH_MENU_USER_LEVEL_A") },
                    { value: "B", label: tAuthMenu("AUTH_MENU_USER_LEVEL_B") },
                    { value: "C", label: tAuthMenu("AUTH_MENU_USER_LEVEL_C") },
                ],
            },
            {
                name: "COMID",
                label: tCommon("CM_COMPANY"),
                type: "select",
                required: true,
                hidden: userLevel == "" || userLevel == "A",
                placeholder: tCommon("CM_COMPANY"),
                colSpan: 12,
                options: companyList.map((item) => ({
                    value: item.COMID,
                    label: item.COMNAME,
                })),
            },
            {
                name: "PLACEID",
                label: tCommon("CM_PLACE"),
                type: "select",
                required: true,
                hidden: userLevel == "" || userLevel == "A" || userLevel == "B",
                placeholder: tCommon("CM_PLACE"),
                colSpan: 12,
                options: placeList.map((item) => ({
                    value: item.PLACEID,
                    label: item.PLACENAME,
                })),
            },
            {
                name: "EMAIL",
                label: "AUTH_USER_GRID_EMAIL",
                type: "input",
                placeholder: "AUTH_USER_GRID_EMAIL",
                colSpan: 12,
            },
        ],
        [item, tAuthMenu, tCommon, userLevel, companyList, placeList]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "AuthUser",
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
                    onValuesChange={onValuesChange}
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
