import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Place as IPlace } from "@/interfaces/business";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Modal, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import { FileService } from "@/app/services/file";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { GoodImage } from "@/interfaces/goods";
import { CommonService } from "@/app/services/common";
import { useDaumPostcode, Postcode } from "@/hooks/useDaumPostcode";
import { useAppStore } from "@/hooks/useAppStore";

export const usePlaceDialog = dialogStore<IPlace>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    COMID?: number;
    PLACENAME: string;
    ZIP: string;
    ADDR: string;
    TEL: string;
    MANAGER: string;
    MNGMOBILE: string;
    EMAIL: string;
    SHIPPINGFEE: number;
    FREESHIPPINGFEE: number;
    DELIVERYPERIOD: string;
    ADDSHIPPINGFEE: number;
    RETURNSHIPPINGFEE: number;
    EXCHANGESHIPPINGFEE: number;
    BASICINFO: string;
    RETURNREFUNDPOLICYINFO: string;
    USEYN: string;
    IMAGE?: (File | GoodImage)[];
};

const initFormValues: FormValues = {
    PLACENAME: "",
    ZIP: "",
    ADDR: "",
    TEL: "",
    MANAGER: "",
    MNGMOBILE: "",
    EMAIL: "",
    SHIPPINGFEE: 0,
    FREESHIPPINGFEE: 0,
    DELIVERYPERIOD: "",
    ADDSHIPPINGFEE: 0,
    RETURNSHIPPINGFEE: 0,
    EXCHANGESHIPPINGFEE: 0,
    BASICINFO: "",
    RETURNREFUNDPOLICYINFO: "",
    USEYN: "",
    IMAGE: [],
};

export const PlaceDialog = ({ onClose = () => "" }: DialogProps) => {
    // const { t } = useTranslation("Company");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = usePlaceDialog();
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

    const { companyList } = useAppStore((state) => state);

    const imagesFileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | GoodImage)[];
    }>({
        IMAGE: [],
    });

    const [deleteImages, setDeleteImages] = useState<GoodImage[]>([]);

    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imagesFileInputRef],
            ]),
        []
    );

    const [form] = Form.useForm<FormValues>();

    const { openDaumPostcode, DaumPostcodeModal } = useDaumPostcode();

    const handleSearchAddress = useCallback(() => {
        openDaumPostcode((address: Postcode) => {
            form.setFieldValue("ZIP", address.zonecode);
            form.setFieldValue("ADDR", address.fullAddress);
        });
    }, [form, openDaumPostcode]);

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
                    const imgResponse = await CommonService.fetchUserImageList({
                        COMID: item.COMID,
                        PLACEID: item.PLACEID,
                        IMGKIND: "A",
                    });

                    setUploadedImages({
                        IMAGE: [...getDataFromPayloadRestful(imgResponse)],
                    });

                    form.setFieldsValue({
                        ...item,
                        IMAGE: [...getDataFromPayloadRestful(imgResponse)],
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
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            setUploadedImages({
                IMAGE: [],
            });
            setDeleteImages([]);

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
                let logoImage = [];

                if (
                    values.IMAGE?.filter((item) => item instanceof File)?.length
                ) {
                    logoImage = await FileService.multiFileUpload({
                        FOLDER_FLAG: "A",
                        COMID: item.COMID,
                        PLACEID: item.PLACEID,
                        FILES: values.IMAGE?.filter(
                            (item) => item instanceof File
                        ),
                    });

                    await Promise.all(
                        logoImage.map((img) =>
                            CommonService.insertUserImageList({
                                COMID: item.COMID,
                                PLACEID: item.PLACEID,
                                IMGKIND: "A",
                                URL: img.URL,
                                PATH: img.PATH,
                            })
                        )
                    );
                }

                if (deleteImages.length) {
                    await Promise.all(
                        deleteImages.map((item) => {
                            CommonService.deleteUserImageList({
                                COMID: item.COMID,
                                PLACEID: item.PLACEID,
                                IMGKIND: item.IMGKIND,
                                IMGID: item.IMGID,
                            });
                            return;
                        })
                    );

                    await Promise.all(
                        deleteImages.map((item) => {
                            FileService.deleteFile({
                                IMAGE_URL: item.URL,
                                IMAGE_TYPE: "P",
                            });
                            return;
                        })
                    );

                    setDeleteImages([]);
                }

                await CommonService.updatePlace({
                    ...item,
                    ...values,
                    THUMURL: logoImage?.[0]?.URL
                        ? `${__PHOTO_PATH__}${logoImage?.[0]?.URL}`
                        : (uploadedImages.IMAGE?.[0] as GoodImage)?.URL ?? "",
                    THUMPATH:
                        logoImage?.[0]?.PATH ??
                        (uploadedImages.IMAGE?.[0] as GoodImage)?.PATH ??
                        "",
                });
            } else {
                await CommonService.insertPlace({
                    ...values,
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

            await CommonService.deletePlace({
                COMID: item?.COMID ?? 0,
                PLACEID: item?.PLACEID ?? 0,
            });

            const images = form.getFieldValue("IMAGE");

            const deleteImagesArr = [...images, ...deleteImages].filter(
                (item: any) => !(item instanceof File)
            );

            if (deleteImagesArr.length) {
                await Promise.all(
                    deleteImagesArr.map((item) => {
                        CommonService.deleteUserImageList({
                            COMID: item.COMID,
                            PLACEID: item.PLACEID,
                            IMGKIND: item.IMGKIND,
                            IMGID: item.IMGID,
                        });
                        return;
                    })
                );

                await Promise.all(
                    deleteImagesArr.map((item) => {
                        FileService.deleteFile({
                            IMAGE_URL: item.URL,
                            IMAGE_TYPE: "A",
                        });
                        return;
                    })
                );

                setDeleteImages([]);
            }

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
            openNotification(
                "error",
                "Cannot be deleted because product information exists.",
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            console.error("handleDelete error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [deleteImages, form, handleClose, item, openNotification, tCommon]);

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
                            [imageToCrop.fieldName]: [
                                croppedFile,
                                ...form.getFieldValue(imageToCrop.fieldName),
                            ],
                        });

                        form.setFieldValue(imageToCrop.fieldName, [
                            croppedFile,
                            ...form.getFieldValue(imageToCrop.fieldName),
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

    const handleDeleteImage = (index: number, fieldName: any, item: any) => {
        const currentImages = form.getFieldValue(fieldName) || [];
        const updatedImages = currentImages.filter(
            (_: File, i: number) => i !== index
        );
        form.setFieldValue(fieldName, updatedImages);
        setUploadedImages({
            ...uploadedImages,
            [fieldName]: updatedImages,
        });

        if (!(item instanceof File)) {
            setDeleteImages([...deleteImages, { ...item, IMGKIND: "A" }]);
        }
    };

    const fields: Field[] = useMemo(
        () => [
            {
                name: "COMID",
                label: "COM_GRID_1_COMNAME",
                type: "select",
                placeholder: "COM_GRID_1_COMNAME",
                colSpan: 12,
                options: companyList.map((item) => ({
                    value: item.COMID,
                    label: item.COMNAME,
                })),
                disable: !!item,
                required: !item,
            },
            {
                name: "PLACENAME",
                label: "COM_GRID_2_PLACENAME",
                type: "input",
                required: true,
                placeholder: "COM_GRID_2_PLACENAME",
                colSpan: 12,
            },
            {
                name: "ZIP",
                label: "COM_GRID_1_ZIP",
                type: "button",
                required: true,
                placeholder: "COM_GRID_1_ZIP",
                colSpan: 12,
                onClick: handleSearchAddress,
            },
            {
                name: "ADDR",
                label: "COM_GRID_1_ADDR",
                type: "button",
                required: true,
                placeholder: "COM_GRID_1_ADDR",
                colSpan: 12,
                onClick: handleSearchAddress,
            },
            {
                name: "TEL",
                label: "COM_GRID_1_TEL",
                type: "input",
                placeholder: "COM_GRID_1_TEL",
                colSpan: 12,
            },
            {
                name: "MANAGER",
                label: "COM_GRID_2_MANAGER",
                type: "input",
                placeholder: "COM_GRID_2_MANAGER",
                colSpan: 12,
            },
            {
                name: "MNGMOBILE",
                label: "COM_GRID_2_MNGMOBILE",
                type: "input",
                placeholder: "COM_GRID_2_MNGMOBILE",
                colSpan: 12,
            },
            {
                name: "EMAIL",
                label: "COM_GRID_2_EMAIL",
                type: "input",
                placeholder: "COM_GRID_2_EMAIL",
                colSpan: 12,
            },
            {
                name: "SHIPPINGFEE",
                label: "COM_GRID_2_SHIPPINGFEE",
                type: "inputnumber",
                placeholder: "COM_GRID_2_SHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "FREESHIPPINGFEE",
                label: "COM_GRID_2_FREESHIPPINGFEE",
                type: "inputnumber",
                placeholder: "COM_GRID_2_FREESHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "DELIVERYPERIOD",
                label: "COM_GRID_2_DELIVERYPERIOD",
                type: "input",
                placeholder: "COM_GRID_2_DELIVERYPERIOD",
                colSpan: 12,
            },
            {
                name: "ADDSHIPPINGFEE",
                label: "COM_GRID_2_ADDSHIPPINGFEE",
                type: "inputnumber",
                placeholder: "COM_GRID_2_ADDSHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "RETURNSHIPPINGFEE",
                label: "COM_GRID_2_RETURNSHIPPINGFEE",
                type: "inputnumber",
                placeholder: "COM_GRID_2_RETURNSHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "EXCHANGESHIPPINGFEE",
                label: "COM_GRID_2_EXCHANGESHIPPINGFEE",
                type: "inputnumber",
                placeholder: "COM_GRID_2_EXCHANGESHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "BASICINFO",
                label: "COM_GRID_2_BASICINFO",
                type: "input",
                placeholder: "COM_GRID_2_BASICINFO",
                colSpan: 12,
            },
            {
                name: "RETURNREFUNDPOLICYINFO",
                label: "COM_GRID_2_RETURNREFUNDPOLICYINFO",
                type: "input",
                placeholder: "COM_GRID_2_RETURNREFUNDPOLICYINFO",
                colSpan: 12,
            },
            {
                name: "USEYN",
                label: tCommon("CM_USEYN"),
                type: "select",
                placeholder: tCommon("CM_USEYN"),
                colSpan: 12,
                defaultValue: "Y",
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
                required: true,
            },
            {
                name: "IMAGE",
                label: "COM_GRID_1_LOGOIMAGEURL",
                type: "upload",
                colSpan: 24,
                accept: "image/*",
                hidden: !item,
            },
        ],
        [companyList, handleSearchAddress, tCommon, item]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Company",
        fileInputRefs,
        uploadedImages,
        handleDeleteImage,
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
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                )}
            </Modal>

            <DaumPostcodeModal />
        </>
    );
};
