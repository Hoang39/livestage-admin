import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import {
    getDataFromPayloadRestful,
    translateContent,
    translateContentByLocale,
} from "@/utils/handleResponse";
import { Heart } from "@/interfaces/reward";
import { CommonService } from "@/app/services/common";
import { CommonCode } from "@/interfaces/common";
import { RewardService } from "@/app/services/reward";
import { useAppStore } from "@/hooks/useAppStore";

export const useHeartRechargeDialog = dialogStore<Heart>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    CODE: string;
    NAME_EN: string;
    NAME_KO: string;
    NAME_VI: string;
    DESCRIPTION_EN: string;
    DESCRIPTION_KO: string;
    DESCRIPTION_VI: string;
    USE_YN: string;
    PAY_TYPES: string | string[];
    HOT_YN: string;
    CONVERT_AMOUNT: number;
    BONUS_PC: number;
    BONUS_AMOUNT: number;
    TOTAL_HEARTS: number;
    LIMIT_YN: string;
    MAX_BUY: number;
    ORIGIN_KRW: number;
    DISCOUNT_PC: number;
    PRICE_KRW: number;
    EFFECTIVE_TIME: string | dayjs.Dayjs;
    EXPIRED_TIME: string | dayjs.Dayjs;
};

const initFormValues: FormValues = {
    CODE: "",
    NAME_EN: "",
    NAME_KO: "",
    NAME_VI: "",
    DESCRIPTION_EN: "",
    DESCRIPTION_KO: "",
    DESCRIPTION_VI: "",
    USE_YN: "Y",
    PAY_TYPES: "",
    HOT_YN: "Y",
    CONVERT_AMOUNT: 0,
    BONUS_PC: 0,
    BONUS_AMOUNT: 0,
    TOTAL_HEARTS: 0,
    LIMIT_YN: "N",
    MAX_BUY: -1,
    ORIGIN_KRW: 0,
    DISCOUNT_PC: 0,
    PRICE_KRW: 0,
    EFFECTIVE_TIME: "",
    EXPIRED_TIME: "",
};

export const HeartRechargeDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tVote } = useTranslation("Vote");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useHeartRechargeDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [isLimited, setIsLimited] = useState("");

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
                const payload = await CommonService.fetchCommonCode({
                    CODE_ID: "PAYTYPE",
                });

                const list = getDataFromPayloadRestful(payload);

                setCommonCode(list);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    setIsLimited(item.LIMIT_YN);

                    form.setFieldsValue({
                        ...item,
                        PAY_TYPES: item.PAY_TYPES.split(","),
                        NAME_EN: translateContentByLocale(item.NAME, "en_US"),
                        NAME_KO: translateContentByLocale(item.NAME, "ko_KR"),
                        NAME_VI: translateContentByLocale(item.NAME, "vi_VN"),
                        DESCRIPTION_EN: translateContentByLocale(
                            item.DESCRIPTION,
                            "en_US"
                        ),
                        DESCRIPTION_KO: translateContentByLocale(
                            item.DESCRIPTION,
                            "ko_KR"
                        ),
                        DESCRIPTION_VI: translateContentByLocale(
                            item.DESCRIPTION,
                            "vi_VN"
                        ),
                        EFFECTIVE_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.EFFECTIVE_TIME
                            )
                        ),
                        EXPIRED_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.EXPIRED_TIME
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

    const onValuesChange = (
        changedValues: Partial<FormValues>,
        _allValues: FormValues
    ) => {
        if (changedValues.LIMIT_YN) {
            setIsLimited(changedValues.LIMIT_YN);

            if (changedValues.LIMIT_YN == "Y") {
                form.setFieldsValue({
                    MAX_BUY: 1,
                });
            } else {
                form.setFieldsValue({
                    MAX_BUY: -1,
                });
            }
        }

        if (changedValues.ORIGIN_KRW || changedValues.DISCOUNT_PC) {
            const ORIGIN_KRW = form.getFieldValue("ORIGIN_KRW") || 0;
            const DISCOUNT_PC = form.getFieldValue("DISCOUNT_PC") || 0;
            form.setFieldsValue({
                PRICE_KRW: ORIGIN_KRW * (1 - DISCOUNT_PC / 100),
            });
        }

        if (changedValues.CONVERT_AMOUNT || changedValues.BONUS_PC) {
            const CONVERT_AMOUNT = form.getFieldValue("CONVERT_AMOUNT") || 0;
            const BONUS_PC = form.getFieldValue("BONUS_PC") || 0;
            const BONUS_AMOUNT = (CONVERT_AMOUNT * BONUS_PC) / 100;
            form.setFieldsValue({
                BONUS_AMOUNT: BONUS_AMOUNT,
                TOTAL_HEARTS: CONVERT_AMOUNT + BONUS_AMOUNT,
            });
        }
    };

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

    const handleData = (values: FormValues) => {
        return {
            PKG_TYPE: "2",
            PKG_NAME: JSON.stringify({
                vi_VN: values.NAME_VI,
                en_US: values.NAME_EN,
                ko_KR: values.NAME_KO,
            }),
            PKG_CODE: values.CODE,
            PAY_TYPES:
                typeof values.PAY_TYPES == "string"
                    ? values.PAY_TYPES
                    : values.PAY_TYPES.join(","),
            PKG_DESC: JSON.stringify({
                vi_VN: values.DESCRIPTION_VI,
                en_US: values.DESCRIPTION_EN,
                ko_KR: values.DESCRIPTION_KO,
            }),
            USE_YN: values.USE_YN,
            HOT_YN: values.HOT_YN,
            MAX_BUY: values.MAX_BUY,
            PRICE_KRW: values.PRICE_KRW,
            ORIGIN_KRW: values.ORIGIN_KRW,
            DISCOUNT_PC: values.DISCOUNT_PC,
            CONVERT_AMOUNT: values.CONVERT_AMOUNT,
            BONUS_PC: values.BONUS_PC,
            BONUS_AMOUNT: values.BONUS_AMOUNT,
            EFFECTIVE_TIME: timeService.dateConversion(
                (values.EFFECTIVE_TIME as dayjs.Dayjs)?.format(
                    "YYYY-MM-DD HH:mm:ss"
                )
            ),
            EXPIRED_TIME: timeService.dateConversion(
                (values.EXPIRED_TIME as dayjs.Dayjs)?.format(
                    "YYYY-MM-DD HH:mm:ss"
                )
            ),
            THUMB_URL: "",
            THUMB_IMG_YN: "N",
            CRUD_BY: userInfo?.USERID ?? "",
        };
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                await RewardService.updateHeart({
                    ...handleData(values),
                    PKG_PID: item.PID,
                });
            } else {
                await RewardService.insertHeart({
                    ...handleData(values),
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
                name: "NAME_EN",
                label: tVote("MISSION_NAME_EN"),
                type: "input",
                required: true,
                placeholder: tVote("MISSION_NAME_EN"),
                colSpan: 24,
            },
            {
                name: "NAME_KO",
                label: tVote("MISSION_NAME_KO"),
                type: "input",
                required: true,
                placeholder: tVote("MISSION_NAME_KO"),
                colSpan: 24,
            },
            {
                name: "NAME_VI",
                label: tVote("MISSION_NAME_VI"),
                type: "input",
                required: true,
                placeholder: tVote("MISSION_NAME_VI"),
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_EN",
                label: tVote("DESCRIPTION_EN"),
                type: "input",
                placeholder: tVote("DESCRIPTION_EN"),
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_KO",
                label: tVote("DESCRIPTION_KO"),
                type: "input",
                placeholder: tVote("DESCRIPTION_KO"),
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_VI",
                label: tVote("DESCRIPTION_VI"),
                type: "input",
                placeholder: tVote("DESCRIPTION_VI"),
                colSpan: 24,
            },
            {
                name: "CODE",
                label: "CODE",
                type: "input",
                required: true,
                placeholder: "CODE",
                colSpan: 12,
                disable: !!item,
            },
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
                name: "PAY_TYPES",
                label: "PAY_TYPE",
                type: "select",
                required: true,
                placeholder: "PAY_TYPE",
                colSpan: 12,
                mode: "multiple",
                options: commonCode.map((item) => ({
                    value: item.CODE_LIST_ID,
                    label: translateContent(item.CODE_LIST_DISPLAY_NAME),
                })),
            },
            {
                name: "HOT_YN",
                label: "HOT_YN",
                type: "select",
                required: true,
                placeholder: "HOT_YN",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "CONVERT_AMOUNT",
                label: "NUMBER_OF_HEARTS",
                type: "inputnumber",
                required: true,
                placeholder: "NUMBER_OF_HEARTS",
                colSpan: 12,
                min: 0,
            },
            {
                name: "BONUS_PC",
                label: "BONUS_PC_OF_HEARTS",
                type: "inputnumber",
                required: true,
                placeholder: "BONUS_PC_OF_HEARTS",
                colSpan: 12,
                min: 0,
                max: 100,
            },
            {
                name: "BONUS_AMOUNT",
                label: "BONUS_OF_HEARTS",
                type: "inputnumber",
                disable: true,
                placeholder: "BONUS_OF_HEARTS",
                colSpan: 12,
            },
            {
                name: "TOTAL_HEARTS",
                label: "TOTAL_HEARTS",
                type: "inputnumber",
                disable: true,
                placeholder: "TOTAL_HEARTS",
                colSpan: 12,
            },
            {
                name: "LIMIT_YN",
                label: "LIMIT",
                type: "select",
                required: true,
                placeholder: "LIMIT",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "MAX_BUY",
                label: "NUMBER_OF_PURCHASES",
                type: isLimited == "Y" ? "inputnumber" : "display",
                required: true,
                placeholder: "NUMBER_OF_PURCHASES",
                colSpan: 12,
                ...(isLimited == "Y" ? { min: 1 } : {}),
            },
            {
                name: "ORIGIN_KRW",
                label: "ORIGIN_PRICE",
                type: "inputnumber",
                required: true,
                placeholder: "ORIGIN_PRICE",
                colSpan: 12,
                min: 0,
            },
            {
                name: "DISCOUNT_PC",
                label: "DISCOUNT_PRICE",
                type: "inputnumber",
                required: true,
                placeholder: "DISCOUNT_PRICE",
                colSpan: 12,
                min: 0,
                max: 100,
            },
            {
                name: "PRICE_KRW",
                label: "SALE_PRICE",
                type: "inputnumber",
                disable: true,
                placeholder: "SALE_PRICE",
                colSpan: 12,
            },
            {
                name: "EFFECTIVE_TIME",
                label: tVote("START_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("START_DATE"),
                colSpan: 12,
            },
            {
                name: "EXPIRED_TIME",
                label: tVote("END_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("END_DATE"),
                colSpan: 12,
            },
        ],
        [tVote, item, tCommon, commonCode, isLimited]
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
