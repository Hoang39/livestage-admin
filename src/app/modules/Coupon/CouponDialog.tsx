import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Coupon } from "@/interfaces/coupon";
import { CouponService } from "@/app/services/coupon";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";

export const useCouponDialog = dialogStore<Coupon>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    NAME: string;
    DESCRIPTION: string;
    STATUS: string;
    VALUE: number;
    MAX_VALUE: number;
    MIN_VALUE: number;
    QUALITY: number;
    ACTIVE_YN: string;
    START_DATE: string | dayjs.Dayjs;
    END_DATE: string | dayjs.Dayjs;
};

const initFormValues: FormValues = {
    NAME: "",
    DESCRIPTION: "",
    STATUS: "UPCOMING",
    VALUE: 0,
    MAX_VALUE: 0,
    MIN_VALUE: 0,
    QUALITY: 10,
    ACTIVE_YN: "Y",
    START_DATE: "",
    END_DATE: "",
};

export const CouponDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Coupon");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useCouponDialog();
    const [isLoading, setIsLoading] = useState(false);

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
                    form.setFieldsValue({
                        ...item,
                        START_DATE: dayjs(
                            timeService.getStrDateParseFromUTC(item.START_DATE)
                        ),
                        END_DATE: dayjs(
                            timeService.getStrDateParseFromUTC(item.END_DATE)
                        ),
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

    function generateRandomString() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                await CouponService.updateCoupon({
                    ...item,
                    ...values,
                    START_DATE: timeService.dateConversion(
                        (values.START_DATE as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.END_DATE as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                });
            } else {
                await CouponService.insertCoupon({
                    ...values,
                    CP_CODE: generateRandomString(),
                    TYPE: "PRODUCT",
                    USAGE_LIMIT_PER_USER: 1,
                    PAYMENT_TYPE: "",
                    APPLICABLE_GROUP_GOODS_ID: "",
                    COM_ID: 0,
                    PLACE_ID: 0,
                    START_DATE: timeService.dateConversion(
                        (values.START_DATE as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.END_DATE as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
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

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);

            await CouponService.deleteCoupon({
                CP_ID: item?.CP_ID ?? 0,
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
                name: "NAME",
                label: "COUPON_GRID_NAME",
                type: "input",
                required: true,
                placeholder: "COUPON_GRID_NAME",
                colSpan: 12,
            },
            {
                name: "DESCRIPTION",
                label: "COUPON_GRID_DESCRIPTION",
                type: "input",
                placeholder: "COUPON_GRID_DESCRIPTION",
                colSpan: 12,
            },
            {
                name: "STATUS",
                label: "COUPON_GRID_STATUS",
                type: "input",
                disable: true,
                placeholder: "COUPON_GRID_STATUS",
                colSpan: 12,
                options: [
                    { value: "UPCOMING", label: t("COUPON_GRID_STATUS_0") },
                    { value: "FINISHED", label: t("COUPON_GRID_STATUS_1") },
                    { value: "ONGOING", label: t("COUPON_GRID_STATUS_2") },
                ],
            },
            {
                name: "VALUE",
                label: "COUPON_GRID_VALUE",
                type: "inputnumber",
                required: true,
                placeholder: "COUPON_GRID_VALUE",
                colSpan: 12,
                min: 0,
            },
            {
                name: "MAX_VALUE",
                label: "COUPON_GRID_MAX_VALUE",
                type: "inputnumber",
                required: true,
                placeholder: "COUPON_GRID_MAX_VALUE",
                colSpan: 12,
                min: 0,
            },
            {
                name: "MIN_VALUE",
                label: "COUPON_GRID_MIN_VALUE",
                type: "inputnumber",
                required: true,
                placeholder: "COUPON_GRID_MIN_VALUE",
                colSpan: 12,
                min: 0,
            },
            {
                name: "QUALITY",
                label: "COUPON_GRID_QUALITY",
                type: "inputnumber",
                required: true,
                placeholder: "COUPON_GRID_QUALITY",
                colSpan: 12,
                min: 0,
            },
            {
                name: "ACTIVE_YN",
                label: tCommon("CM_ACTIVE"),
                type: "select",
                required: true,
                placeholder: tCommon("CM_ACTIVE"),
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "START_DATE",
                label: "COUPON_GRID_START_DATE",
                type: "datetime",
                required: true,
                placeholder: "COUPON_GRID_START_DATE",
                colSpan: 12,
                minDate: dayjs(),
            },
            {
                name: "END_DATE",
                label: "COUPON_GRID_END_DATE",
                type: "datetime",
                required: true,
                placeholder: "COUPON_GRID_END_DATE",
                colSpan: 12,
                minDate: dayjs(),
            },
        ],
        [t, tCommon]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Coupon",
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
