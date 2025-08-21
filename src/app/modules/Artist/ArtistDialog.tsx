import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Artist, CategoryArtist } from "@/interfaces/artist";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { ArtistService } from "@/app/services/artist";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { GoodImage } from "@/interfaces/goods";
import { useAppStore } from "@/hooks/useAppStore";
import Cropper from "react-easy-crop";
import { FileService } from "@/app/services/file";

export const useArtistDialog = dialogStore<Artist>();

interface DialogProps {
    type: "A" | "G";
    onClose?: (status?: string) => void;
}

type FormValues = {
    USER_ID: string;
    PWD: string;
    ALIAS: string;
    ALIAS_KR: string;
    PARENT_NAME: string;
    ARTIST_CATEGORY_ID?: number;
    COMNAME: string;
    DOB: string | dayjs.Dayjs;
    DOD: string | dayjs.Dayjs;
    FANCLUB_NAME: string;
    NATIONAL: string;
    STATE_TEXT: string;
    USE_YN: string;
    FACE_URL: string;
    YOU_URL: string;
    INS_URL: string;

    IMAGE?: (File | Partial<GoodImage>)[];
};

const initFormValues: FormValues = {
    USER_ID: "",
    PWD: "",
    ALIAS: "",
    ALIAS_KR: "",
    PARENT_NAME: "",
    COMNAME: "",
    DOB: "",
    DOD: "",
    FANCLUB_NAME: "",
    NATIONAL: "",
    STATE_TEXT: "",
    USE_YN: "Y",
    FACE_URL: "",
    YOU_URL: "",
    INS_URL: "",

    IMAGE: [],
};

export const ArtistDialog = ({ type, onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useArtistDialog();
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

    const [form] = Form.useForm<FormValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | Partial<GoodImage>)[];
    }>({
        IMAGE: [],
    });

    const [category, setCategory] = useState<CategoryArtist[]>([]);
    const [group, setGroup] = useState<Artist[]>([]);

    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imageFileInputRef],
            ]),
        []
    );

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    setUploadedImages({
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
                    });

                    form.setFieldsValue({
                        ...item,
                        PWD: "",
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
                        DOB: item.DOB
                            ? dayjs(
                                  timeService.getStrDateParseFromUTC(item.DOB)
                              )
                            : "",
                        DOD: item.DOD
                            ? dayjs(
                                  timeService.getStrDateParseFromUTC(item.DOD)
                              )
                            : "",
                    });
                } else {
                    form.setFieldsValue({
                        ...initFormValues,
                        COMNAME: currentCompany?.COMNAME,
                    });
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
    }, [currentCompany, form, item, openNotification]);

    useEffect(() => {
        (async () => {
            try {
                const payload = await ArtistService.fetchCategoryArtist({
                    TYPE: type,
                });
                setCategory(getDataFromPayloadRestful(payload));
            } catch (error) {
                console.error(error);
            }
        })();
    }, [type]);

    useEffect(() => {
        (async () => {
            try {
                const payload = await ArtistService.fetchArtistList({
                    FILTER: "",
                    SORTBY: "D",
                    SORTDIR: "D",
                    PAGENUM: "1",
                    PAGESIZE: "1000",
                    COMID: currentCompany?.COMID || 0,
                    PLACEID: currentPlace?.PLACEID || 0,
                    ARTIST_TYPE: type,
                });
                setGroup(getDataFromPayloadRestful(payload)?.[0]?.ITEMS);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [currentCompany, currentPlace, type]);

    const onValuesChange = (
        changedValues: Partial<FormValues>,
        allValues: FormValues
    ) => {
        if (changedValues.IMAGE) {
            setUploadedImages({
                IMAGE: allValues.IMAGE || [],
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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                const response = await ArtistService.updateArtist({
                    ...item,
                    ...values,
                    COMID: currentCompany?.COMID || 0,
                    PLACEID: currentPlace?.PLACEID || 0,
                    COMNAME: currentCompany?.COMNAME || "",
                    ARTIST_TYPE: type,
                    DOB: values.DOB
                        ? timeService.dateConversion(
                              (values.DOB as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                    DOD: values.DOD
                        ? timeService.dateConversion(
                              (values.DOD as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                    BIRTHDAY: values.DOB
                        ? timeService.dateConversion(
                              (values.DOB as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                    IDOL_PID: item.IDOL_PID,
                    PROFILE_IMG_YN:
                        values.IMAGE?.[0] instanceof File ? "Y" : "N",
                    THUMB_URL:
                        values.IMAGE?.[0] instanceof File ? "" : item.THUMB_URL,
                });

                if (values.IMAGE?.[0] instanceof File) {
                    await Promise.all([
                        FileService.urlFileUpload({
                            URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                            FILE: values.IMAGE[0],
                        }),
                        FileService.urlFileUpload({
                            URL: response?.RESULT_DATA?.[0]
                                ?.THUMB_UPLOAD_ACTIVE_URL,
                            FILE: values.IMAGE[0],
                        }),
                    ]);
                }
            } else {
                const response = await ArtistService.insertArtist({
                    ...values,
                    COMID: currentCompany?.COMID || 0,
                    PLACEID: currentPlace?.PLACEID || 0,
                    COMNAME: currentCompany?.COMNAME || "",
                    ARTIST_TYPE: type,
                    APPID: "com.bosoft.colorauth",
                    LOGIN_TYPE: "I",
                    DOB: values.DOB
                        ? timeService.dateConversion(
                              (values.DOB as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                    DOD: values.DOD
                        ? timeService.dateConversion(
                              (values.DOD as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                    PARENT_PID: "",
                    REG_DATE: "",
                    BIRTHDAY: values.DOB
                        ? timeService.dateConversion(
                              (values.DOB as dayjs.Dayjs)?.format("YYYY-MM-DD")
                          )
                        : "",
                });

                if (values.IMAGE) {
                    await Promise.all([
                        FileService.urlFileUpload({
                            URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                            FILE: values.IMAGE[0],
                        }),
                        FileService.urlFileUpload({
                            URL: response?.RESULT_DATA?.[0]
                                ?.THUMB_UPLOAD_ACTIVE_URL,
                            FILE: values.IMAGE[0],
                        }),
                    ]);
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
                tCommon(item ? "update-failed" : "create-failed") +
                    (item ? "" : " No duplicate user_id"),
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
                label: "AVATAR",
                type: "upload",
                // hidden: !item,
                colSpan: 24,
                edit: true,
                accept: "image/*",
            },
            {
                name: "USER_ID",
                label: "USERID",
                type: "input",
                required: true,
                placeholder: "USERID",
                colSpan: 12,
                disable: !!item,
            },
            {
                name: "PWD",
                label: "PASSWORD",
                type: "input",
                required: !item,
                placeholder: "PASSWORD",
                colSpan: 12,
            },
            {
                name: "ALIAS",
                label: "ARTIST_NAME",
                type: "input",
                required: true,
                placeholder: "ARTIST_NAME",
                colSpan: 12,
            },
            {
                name: "ALIAS_KR",
                label: "KOREA_NAME",
                type: "input",
                placeholder: "KOREA_NAME",
                colSpan: 12,
            },
            {
                name: "PARENT_NAME",
                label: "GROUP_NAME",
                type: "select",
                placeholder: "GROUP_NAME",
                colSpan: 24,
                options: group.map((item) => ({
                    value: item.ALIAS,
                    label: item.ALIAS,
                })),
                hidden: type == "G",
            },
            {
                name: "ARTIST_CATEGORY_ID",
                label: "ARTIST_CATEGORY_NAME",
                type: "select",
                placeholder: "ARTIST_CATEGORY_NAME",
                colSpan: 24,
                options: category.map((item) => ({
                    value: item.CATEGORYID,
                    label: translateContent(item.NAME),
                })),
            },
            {
                name: "COMNAME",
                label: "COMNAME",
                type: "input",
                placeholder: "COMNAME",
                colSpan: 12,
                disable: true,
            },
            {
                name: "DOB",
                label: "DOB",
                type: "date",
                placeholder: "DOB",
                colSpan: 12,
            },
            {
                name: "DOD",
                label: "DOD",
                type: "date",
                placeholder: "DOD",
                colSpan: 12,
            },
            {
                name: "FANCLUB_NAME",
                label: "FANCLUP_NAME",
                type: "input",
                placeholder: "FANCLUP_NAME",
                colSpan: 12,
            },
            {
                name: "NATIONAL",
                label: "NATIONAL",
                type: "input",
                placeholder: "NATIONAL",
                colSpan: 12,
            },
            {
                name: "STATE_TEXT",
                label: "ACTIVITIES_CONTENT",
                type: "input",
                placeholder: "ACTIVITIES_CONTENT",
                colSpan: 12,
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
                name: "FACE_URL",
                label: "FACEBOOK",
                type: "input",
                placeholder: "FACEBOOK",
                colSpan: 12,
            },
            {
                name: "INS_URL",
                label: "INSTAGRAM",
                type: "input",
                placeholder: "INSTAGRAM",
                colSpan: 12,
            },
            {
                name: "YOU_URL",
                label: "YOUTUBE",
                type: "input",
                placeholder: "YOUTUBE",
                colSpan: 12,
            },
        ],
        [category, group, item, tCommon, type]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Artist",
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
