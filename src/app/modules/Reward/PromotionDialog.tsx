import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Prize, Promotion } from "@/interfaces/reward";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { RewardService } from "@/app/services/reward";
import { useAppStore } from "@/hooks/useAppStore";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";

export const usePromotionDialog = dialogStore<Promotion>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    PROMO_TYPE: string;
    NAME: string;
    WIN_RATE: number;
    TOTAL_PRIZE: number;
    USE_YN: string;
    PROMO_START_TIME: string | dayjs.Dayjs;
    PROMO_END_TIME: string | dayjs.Dayjs;

    prizeList: Partial<Prize>[];
};

const initFormValues: FormValues = {
    PROMO_TYPE: "roulette",
    NAME: "",
    WIN_RATE: 0,
    TOTAL_PRIZE: 2,
    USE_YN: "Y",
    PROMO_START_TIME: "",
    PROMO_END_TIME: "",

    prizeList: [],
};

export const PromotionDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tVote } = useTranslation("Vote");

    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = usePromotionDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [form] = Form.useForm<FormValues>();

    const { userInfo } = useAppStore((state) => state);

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
                    const response = await RewardService.fetchPrizeList({
                        PROMO_PID: item.PROMO_PID,
                        PAGE: 1,
                        SIZE: 1000,
                    });

                    form.setFieldsValue({
                        ...item,
                        prizeList:
                            getDataFromPayloadRestful(response)?.[0]?.ITEMS ||
                            [],
                        PROMO_START_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.PROMO_START_TIME
                            )
                        ),
                        PROMO_END_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.PROMO_END_TIME
                            )
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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (values.prizeList.length < 2 || values.prizeList.length > 10) {
                openNotification(
                    "error",
                    "Total prize is invalid. Must be >= 2 and =< 10",
                    undefined,
                    {
                        showProgress: true,
                        pauseOnHover: true,
                    }
                );
                return;
            }

            if (
                values.prizeList.reduce(
                    (total: number, item: Partial<Prize>) => {
                        return total + (item.PRIZE_WIN_RATE || 0);
                    },
                    0
                ) !== 100
            ) {
                openNotification(
                    "error",
                    "Number of prizes not 100%",
                    undefined,
                    {
                        showProgress: true,
                        pauseOnHover: true,
                    }
                );
                return;
            }

            if (item) {
                const response = await RewardService.updatePromotion({
                    ...values,
                    TOTAL_PRIZE: values.prizeList.length,
                    PROMO_START_TIME: timeService.dateConversion(
                        (values.PROMO_START_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    PROMO_END_TIME: timeService.dateConversion(
                        (values.PROMO_END_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    CRUD_BY: userInfo?.USERID ?? "",
                    PROMO_PID: item.PROMO_PID,
                });

                if (response?.RESULT_DATA?.[0]?.ERRMSG != "Success") {
                    openNotification(
                        "error",
                        response?.RESULT_DATA?.[0]?.ERRMSG,
                        undefined,
                        {
                            showProgress: true,
                            pauseOnHover: true,
                        }
                    );
                    return;
                }

                if (values.prizeList.length) {
                    await RewardService.updatePromotionPrize({
                        PROMO_PID: item.PROMO_PID,
                        PRIZE_NAME: values.prizeList
                            .map((item) => item.PRIZE_NAME)
                            .join(","),
                        PRIZE_WIN_RATE: values.prizeList
                            .map((item) => item.PRIZE_WIN_RATE)
                            .join(","),
                        QUANTITY: values.prizeList
                            .map((item) => item.QUANTITY)
                            .join(","),
                        HEART_CONVERT: values.prizeList
                            .map((item) => item.HEART_CONVERT)
                            .join(","),
                        WIN_YN: values.prizeList
                            .map((item) => item.WIN_YN)
                            .join(","),
                        USE_YN: Array(values.prizeList.length)
                            .fill("Y")
                            .join(","),
                        CRUD_BY: userInfo?.USERID ?? "",
                    });
                }
            } else {
                const response = await RewardService.insertPromotion({
                    ...values,
                    TOTAL_PRIZE: values.prizeList.length,
                    PROMO_START_TIME: timeService.dateConversion(
                        (values.PROMO_START_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    PROMO_END_TIME: timeService.dateConversion(
                        (values.PROMO_END_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    CRUD_BY: userInfo?.USERID ?? "",
                });

                if (response?.RESULT_DATA?.[0]?.ERRMSG != "Success") {
                    openNotification(
                        "error",
                        response?.RESULT_DATA?.[0]?.ERRMSG,
                        undefined,
                        {
                            showProgress: true,
                            pauseOnHover: true,
                        }
                    );
                    return;
                }

                if (values.prizeList.length) {
                    await RewardService.updatePromotionPrize({
                        PROMO_PID: response?.RESULT_DATA?.[0]?.PROMO_PID,
                        PRIZE_NAME: values.prizeList
                            .map((item) => item.PRIZE_NAME)
                            .join(","),
                        PRIZE_WIN_RATE: values.prizeList
                            .map((item) => item.PRIZE_WIN_RATE)
                            .join(","),
                        QUANTITY: values.prizeList
                            .map((item) => item.QUANTITY)
                            .join(","),
                        HEART_CONVERT: values.prizeList
                            .map((item) => item.HEART_CONVERT)
                            .join(","),
                        WIN_YN: values.prizeList
                            .map((item) => item.WIN_YN)
                            .join(","),
                        USE_YN: Array(values.prizeList.length)
                            .fill("Y")
                            .join(","),
                        CRUD_BY: userInfo?.USERID ?? "",
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

    const handleDeleteOptions = useCallback(
        async (_name: number, _parent?: any, config?: any) => {
            config?.();
        },
        []
    );

    const fields: Field[] = useMemo(
        () => [
            {
                name: "PROMO_TYPE",
                label: "PROMO_TYPE",
                type: "input",
                disable: true,
                placeholder: "PROMO_TYPE",
                colSpan: 12,
            },
            {
                name: "PROMO_NAME",
                label: "NAME",
                type: "input",
                required: true,
                placeholder: "NAME",
                colSpan: 12,
            },
            {
                name: "WIN_RATE",
                label: "WIN_RATE",
                type: "inputnumber",
                required: true,
                placeholder: "WIN_RATE",
                colSpan: 12,
                min: 0,
                max: 100,
            },
            // {
            //     name: "TOTAL_PRIZE",
            //     label: "TOTAL_PRIZE",
            //     type: "inputnumber",
            //     required: true,
            //     placeholder: "TOTAL_PRIZE",
            //     colSpan: 12,
            //     min: 2,
            //     max: 10,
            // },
            {
                name: "USE_YN",
                label: tCommon("CM_USEYN"),
                type: "select",
                required: true,
                placeholder: tCommon("CM_USEYN"),
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "PROMO_START_TIME",
                label: tVote("START_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("START_DATE"),
                colSpan: 12,
            },
            {
                name: "PROMO_END_TIME",
                label: tVote("END_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("END_DATE"),
                colSpan: 12,
            },
            {
                name: "prizeList",
                label: "PRIZE_LIST",
                type: "options",
                colSpan: 24,
                onDelete: handleDeleteOptions,
                children: [
                    {
                        name: "PRIZE_NAME",
                        label: "NAME",
                        type: "input",
                        required: true,
                        placeholder: "NAME",
                        colSpan: 10,
                    },
                    {
                        name: "PRIZE_WIN_RATE",
                        label: "PRIZE_WIN_RATE",
                        type: "inputnumber",
                        required: true,
                        placeholder: "PRIZE_WIN_RATE",
                        colSpan: 10,
                        min: 0,
                        max: 100,
                    },
                    {
                        name: "QUANTITY",
                        label: "QUANTITY",
                        type: "inputnumber",
                        required: true,
                        placeholder: "QUANTITY",
                        colSpan: 10,
                        min: 0,
                    },
                    {
                        name: "HEART_CONVERT",
                        label: "NUMBER_OF_HEARTS",
                        type: "inputnumber",
                        required: true,
                        placeholder: "NUMBER_OF_HEARTS",
                        colSpan: 10,
                        min: 0,
                    },
                    {
                        name: "WIN_YN",
                        label: "WIN_YN",
                        type: "select",
                        required: true,
                        placeholder: "WIN_YN",
                        colSpan: 10,
                        options: [
                            { value: "Y", label: tCommon("CM_YN_Y") },
                            { value: "N", label: tCommon("CM_YN_N") },
                        ],
                    },
                ],
            },
        ],
        [tCommon, tVote, handleDeleteOptions]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Locale",
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
