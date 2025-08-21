import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { GoodImage } from "@/interfaces/goods";
import Cropper from "react-easy-crop";
import { FileService } from "@/app/services/file";
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

export const useHeartPackageDialog = dialogStore<Heart>();

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

    IMAGE: (File | Partial<GoodImage>)[];
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

    IMAGE: [],
};

export const HeartPackageDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tVote } = useTranslation("Vote");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useHeartPackageDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [isCropModalVisible, setIsCropModalVisible] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<{
        url: string;
        fieldName: any;
        file: File;
    } | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [isLimited, setIsLimited] = useState("");

    const [form] = Form.useForm<FormValues>();

    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imageFileInputRef],
            ]),
        []
    );

    const { userInfo } = useAppStore((state) => state);

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | Partial<GoodImage>)[];
    }>({
        IMAGE: [],
    });

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
                    setUploadedImages({
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
                    });

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
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
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
        allValues: FormValues
    ) => {
        if (changedValues.IMAGE) {
            setUploadedImages({
                IMAGE: allValues.IMAGE || [],
            });
        }

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
            PKG_TYPE: "1",
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
            THUMB_URL:
                values.IMAGE?.[0] instanceof File ? "" : item?.THUMB_URL ?? "",
            THUMB_IMG_YN: values.IMAGE?.[0] instanceof File ? "Y" : "N",
            CRUD_BY: userInfo?.USERID ?? "",
        };
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                const response = await RewardService.updateHeart({
                    ...handleData(values),
                    PKG_PID: item.PID,
                });

                if (values.IMAGE?.[0] instanceof File) {
                    await FileService.urlFileUpload({
                        URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                        FILE: values.IMAGE[0],
                    });
                }
            } else {
                const response = await RewardService.insertHeart({
                    ...handleData(values),
                });

                if (values.IMAGE?.[0] instanceof File) {
                    await FileService.urlFileUpload({
                        URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                        FILE: values.IMAGE[0],
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

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: any
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageToCrop({
                    url: event.target?.result as string,
                    fieldName,
                    file,
                });
                setIsCropModalVisible(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropOk = () => {
        if (imageToCrop && croppedAreaPixels) {
            const image = new Image();
            image.src = imageToCrop.url;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            if (ctx) {
                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height
                );

                canvas.toBlob((blob) => {
                    if (blob) {
                        const croppedFile = new File(
                            [blob],
                            imageToCrop.file.name,
                            {
                                type: imageToCrop.file.type,
                                lastModified: imageToCrop.file.lastModified,
                            }
                        );

                        setUploadedImages({
                            ...uploadedImages,
                            [imageToCrop.fieldName]: [croppedFile],
                        });

                        form.setFieldValue(imageToCrop.fieldName, [
                            croppedFile,
                        ]);
                    }
                }, imageToCrop.file.type);
            }
        }
        setIsCropModalVisible(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const handleCropCancel = () => {
        setIsCropModalVisible(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const fields: Field[] = useMemo(
        () => [
            {
                name: "IMAGE",
                label: "IMAGE",
                type: "upload",
                // hidden: !item,
                colSpan: 24,
                edit: true,
                accept: "image/*",
            },
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
        fileInputRefs,
        uploadedImages,
        handleFileChange,
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

            <Modal
                title={tCommon("CM_CROP_IMAGE")}
                open={isCropModalVisible}
                onOk={handleCropOk}
                onCancel={handleCropCancel}
                okText={tCommon("Confirm")}
                cancelText={tCommon("Cancel")}
                style={{ zIndex: 9999 }}
            >
                {imageToCrop && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: 300,
                        }}
                    >
                        <Cropper
                            image={imageToCrop.url}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};
