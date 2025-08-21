import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Good, GoodGroup, GoodImage } from "@/interfaces/goods";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Modal,
    Popconfirm,
    Image as ImageAntd,
} from "antd";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import {
    translateContent,
    translateContentByLocale,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { GoodService } from "@/app/services/good";
import { FileService } from "@/app/services/file";
import { CommonService } from "@/app/services/common";
import { useAppStore } from "@/hooks/useAppStore";

export const useGoodsGroupDialog = dialogStore<GoodGroup>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormGoodsGroupValues = {
    GROUPNAME: string;
    GROUPNAME_EN?: string;
    GROUPNAME_KO?: string;
    GROUPNAME_VI?: string;
    THUMBURL: string;
    USEYN: string;
    REMARK: string;
    PARENTID?: number;
    IMAGE?: (File | Partial<GoodImage>)[];
    GOODS?: number[];
};

// Initial form values
const initFormValues: FormGoodsGroupValues = {
    GROUPNAME: "",
    GROUPNAME_EN: "",
    GROUPNAME_KO: "",
    GROUPNAME_VI: "",
    THUMBURL: "",
    USEYN: "",
    REMARK: "",
    PARENTID: undefined,
    IMAGE: [],
};

export const GoodsGroupDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const [dataSource, setDataSource] = useState<GoodGroup[]>([]);
    const [goodsSource, setGoodsSource] = useState<Good[]>([]);

    const { open, item, readonly, closeDialog } = useGoodsGroupDialog();
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

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | Partial<GoodImage>)[];
    }>({
        IMAGE: [],
    });

    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imageFileInputRef],
            ]),
        []
    );

    const [form] = Form.useForm<FormGoodsGroupValues>();

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
                const response = await GoodService.fetchGoodsGroup({
                    COMID: 95,
                    PLACEID: 102,
                    GPTYPE: "S",
                });

                setDataSource(response?.RESULT_DATA);

                if (item) {
                    const goodsResponse = await CommonService.getGoodsList({
                        COMID: currentCompany?.COMID || 0,
                        PLACEID: currentPlace?.PLACEID || 0,
                        USEYN: "",
                        SELLFLAG: "",
                        REFID: item.REFID,
                    });

                    const unspecifiedGoodsResponse =
                        await CommonService.getGoodsList({
                            COMID: currentCompany?.COMID || 0,
                            PLACEID: currentPlace?.PLACEID || 0,
                            USEYN: "",
                            SELLFLAG: "",
                            REFID: -1,
                        });

                    setGoodsSource([
                        ...(goodsResponse?.RESULT_DATA ?? []),
                        ...(unspecifiedGoodsResponse?.RESULT_DATA ?? []),
                    ]);

                    setUploadedImages({
                        IMAGE: item.THUMBURL ? [{ URL: item.THUMBURL }] : [],
                    });

                    form.setFieldsValue({
                        GROUPNAME: item.GROUPNAME || "",
                        GROUPNAME_EN: translateContentByLocale(
                            item.GROUPNAME,
                            "en_US"
                        ),
                        GROUPNAME_KO: translateContentByLocale(
                            item.GROUPNAME,
                            "ko_KR"
                        ),
                        GROUPNAME_VI: translateContentByLocale(
                            item.GROUPNAME,
                            "vi_VN"
                        ),
                        THUMBURL: item.THUMBURL || "",
                        USEYN: item.USEYN || "",
                        REMARK: item.REMARK || "",
                        PARENTID:
                            item.LEVEL && item.PARENTID
                                ? item.PARENTID
                                : undefined,
                        IMAGE: item.THUMBURL ? [{ URL: item.THUMBURL }] : [],
                        GOODS: goodsResponse?.RESULT_DATA?.map(
                            (item) => item.GOODSID
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
    }, [currentCompany, currentPlace, form, item, openNotification]);

    const onValuesChange = (
        changedValues: Partial<FormGoodsGroupValues>,
        allValues: FormGoodsGroupValues
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
                let responseImage;

                if (values.IMAGE?.[0] instanceof File) {
                    responseImage = await FileService.fileUpload({
                        FILES: values.IMAGE,
                        uploadConfig: {
                            folderId: "G",
                            module: "GOODSGROUP",
                            imageId: item.GROUPID,
                        },
                    });
                }

                const addGoodsToGroupList = goodsSource?.filter(
                    (item) =>
                        item.REFID == -1 && values.GOODS?.includes(item.GOODSID)
                );
                const removeGoodsFromGroupList = goodsSource?.filter(
                    (item) =>
                        item.REFID != -1 &&
                        !values.GOODS?.includes(item.GOODSID)
                );

                const updateGoodList = [
                    ...addGoodsToGroupList.map((data: Good) => ({
                        COMID: data.COMID,
                        PLACEID: data.PLACEID,
                        GOODSID: data.GOODSID,
                        REFID: item.REFID,
                        ORDERSEQ: data.ORDERSEQ,
                        NAME: data.NAME,
                        DANGA: data.DANGA,
                        SELLPRICE: data.SELLPRICE,
                        GINFO: data.GINFO,
                        SELLFLAG: data.SELLFLAG,
                        USEYN: data.USEYN,
                        GTYPE: data.GTYPE,
                        THUMURL: data.THUMURL,
                        THUMPATH: data.THUMPATH,
                        STOCKS: data.STOCKS,
                        SIZE: data.SIZE,
                        SIZEPERPRICE: data.SIZEPERPRICE,
                        COUNTRY: data.COUNTRY,
                        GSHORTINFO: data.GSHORTINFO,
                        GSHOWSTART: data.GSHOWSTART,
                        GSHOWEND: data.GSHOWEND,
                        BARCODE: data.BARCODE,
                        QRCODE: data.QRCODE,
                        GOODSYN: data.GOODSYN,
                        STAMPADD: data.STAMPADD,
                        DISCOUNTPER: data.DISCOUNTPER,
                        TOTSELLPRICE: data.TOTSELLPRICE,
                        VODURL: data.VODURL,
                        MODID: data.MODID,
                        OUTBINDINGURL: data.OUTBINDINGURL,
                        LIVEPRICE: data.LIVEPRICE,
                        CRTID: userInfo?.USERID ?? "",
                    })),
                    ...removeGoodsFromGroupList.map((data: Good) => ({
                        COMID: data.COMID,
                        PLACEID: data.PLACEID,
                        GOODSID: data.GOODSID,
                        REFID: -1,
                        ORDERSEQ: data.ORDERSEQ,
                        NAME: data.NAME,
                        DANGA: data.DANGA,
                        SELLPRICE: data.SELLPRICE,
                        GINFO: data.GINFO,
                        SELLFLAG: data.SELLFLAG,
                        USEYN: data.USEYN,
                        GTYPE: data.GTYPE,
                        THUMURL: data.THUMURL,
                        THUMPATH: data.THUMPATH,
                        STOCKS: data.STOCKS,
                        SIZE: data.SIZE,
                        SIZEPERPRICE: data.SIZEPERPRICE,
                        COUNTRY: data.COUNTRY,
                        GSHORTINFO: data.GSHORTINFO,
                        GSHOWSTART: data.GSHOWSTART,
                        GSHOWEND: data.GSHOWEND,
                        BARCODE: data.BARCODE,
                        QRCODE: data.QRCODE,
                        GOODSYN: data.GOODSYN,
                        STAMPADD: data.STAMPADD,
                        DISCOUNTPER: data.DISCOUNTPER,
                        TOTSELLPRICE: data.TOTSELLPRICE,
                        VODURL: data.VODURL,
                        MODID: data.MODID,
                        OUTBINDINGURL: data.OUTBINDINGURL,
                        LIVEPRICE: data.LIVEPRICE,
                        CRTID: userInfo?.USERID ?? "",
                    })),
                ];

                if (updateGoodList.length)
                    await GoodService.updateGood(updateGoodList);

                await GoodService.updateGoodsGroup([
                    {
                        COMID: "95",
                        PLACEID: "102",
                        GROUPID: item.GROUPID,
                        GROUPCD: item.GROUPCD,
                        ORDERSEQ: item.ORDERSEQ,
                        REFID: item.REFID,
                        GROUPNAME: JSON.stringify({
                            en_US: values.GROUPNAME_EN,
                            ko_KR: values.GROUPNAME_KO,
                            vi_VN: values.GROUPNAME_VI,
                        }),
                        LEVEL: item.LEVEL,
                        REMARK: values.REMARK,
                        ISBRENCH: item.ISBRENCH,
                        USEYN: values.USEYN,
                        GPTYPE: item.GPTYPE,
                        VIEWTYPE: item.VIEWTYPE,
                        VIEWAREA: item.VIEWAREA,
                        THUMB: responseImage?.[0]?.URL ?? item.THUMB,
                    },
                ]);
            } else {
                await GoodService.insertGoodsGroup([
                    {
                        COMID: "95",
                        PLACEID: "102",
                        GROUPID: "",
                        GROUPCD: "000000000000",
                        ORDERSEQ: 0,
                        REFID: "",
                        GROUPNAME: JSON.stringify({
                            en_US: values.GROUPNAME_EN,
                            ko_KR: values.GROUPNAME_KO,
                            vi_VN: values.GROUPNAME_VI,
                        }),
                        LEVEL: values.PARENTID ? 1 : 0,
                        REMARK: values.REMARK,
                        ISBRENCH: "Y",
                        USEYN: values.USEYN,
                        GPTYPE: "S",
                        VIEWTYPE: "A",
                        VIEWAREA: "B",
                        GOODSCNTPERROW: "2",
                        PARENTID: values.PARENTID ?? 0,
                    },
                ]);
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

            await GoodService.deleteGoodsGroup([
                {
                    COMID: item?.COMID ?? "",
                    PLACEID: item?.PLACEID ?? "",
                    REFID: item?.REFID ?? "",
                },
            ]);

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
                name: "GROUPNAME_EN",
                label: "GOODS_GR_GRID_1_GROUPNAME-EN",
                type: "input",
                required: true,
                placeholder: "GOODS_GR_GRID_1_GROUPNAME-EN",
                colSpan: 24,
            },
            {
                name: "GROUPNAME_KO",
                label: "GOODS_GR_GRID_1_GROUPNAME-KO",
                type: "input",
                required: true,
                placeholder: "GOODS_GR_GRID_1_GROUPNAME-KO",
                colSpan: 24,
            },
            {
                name: "GROUPNAME_VI",
                label: "GOODS_GR_GRID_1_GROUPNAME-VI",
                type: "input",
                required: true,
                placeholder: "GOODS_GR_GRID_1_GROUPNAME-VI",
                colSpan: 24,
            },
            {
                name: "USEYN",
                label: "GOODS_GR_GRID_1_USEYN",
                type: "select",
                required: true,
                placeholder: "GOODS_GR_GRID_1_USEYN",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "REMARK",
                label: "GOODS_GR_GRID_1_REMARK",
                type: "input",
                required: false,
                placeholder: "GOODS_GR_GRID_1_REMARK",
                colSpan: 12,
            },
            {
                name: "PARENTID",
                label: "CATEGORY_PARENT",
                type: "select",
                hidden: !!item,
                required: false,
                placeholder: "CATEGORY_PARENT",
                colSpan: 24,
                options: dataSource
                    ?.filter((item: any) => item.LEVEL == 0)
                    ?.map((item: any) => ({
                        value: item.GROUPID,
                        label: (
                            <span>
                                <ImageAntd
                                    src={item.THUMBURL}
                                    preview={false}
                                    alt=""
                                    style={{
                                        width: 20,
                                        height: 20,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                        marginRight: 8,
                                    }}
                                    fallback="data:image/png;base64,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"
                                />
                                {translateContent(item.GROUPNAME)}
                            </span>
                        ),
                    })),
            },
            {
                name: "IMAGE",
                label: "CATEGORY_GRID_IMAGE",
                type: "upload",
                hidden: !item,
                colSpan: 24,
                edit: true,
                accept: "image/*",
            },
            {
                name: "GOODS",
                label: "GOODS_GR_GRID_2_TITLE",
                type: "select",
                hidden: !item,
                required: false,
                mode: "multiple",
                placeholder: "GOODS_LIST",
                colSpan: 24,
                options: goodsSource?.map((item: any) => ({
                    value: item.GOODSID,
                    label: (
                        <span>
                            <ImageAntd
                                src={item.THUMURL}
                                preview={false}
                                alt=""
                                style={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    marginRight: 8,
                                }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                            />
                            {translateContent(item.NAME)}
                        </span>
                    ),
                })),
            },
        ],
        [tCommon, item, dataSource, goodsSource]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "GoodsGroup",
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
                                        disabled={!!item?.children?.length}
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
        </>
    );
};
