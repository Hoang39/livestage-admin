import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    Good,
    GoodImage,
    GoodOptions,
    GoodVariations,
} from "@/interfaces/goods";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    InputNumber,
    Modal,
    Table,
    Flex,
    Popconfirm,
} from "antd";
import { useTranslation } from "react-i18next";
import Cropper from "react-easy-crop";
import { useAppStore } from "@/hooks/useAppStore";
import { GoodService } from "@/app/services/good";
import { FileService } from "@/app/services/file";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { TranslateService } from "@/app/services/translate";
import { Field, useRenderForm } from "@/hooks/useRenderForm";

export const useGoodsDialog = dialogStore<Good>();
interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormGoodsValues = {
    NAME: string;
    DANGA: number;
    SELLPRICE: number;
    DISCOUNTPER: number;
    TOTSELLPRICE: number;
    GTYPE: string;
    SELLFLAG: string;
    USEYN: string;
    GINFO: string;
    THUMURL?: string;
    IMAGES?: (File | GoodImage)[];
    DES_IMAGES?: (File | GoodImage)[];
    OPTIONS: any;
};

// Initial form values
const initFormValues: FormGoodsValues = {
    NAME: "",
    DANGA: 0,
    SELLPRICE: 0,
    DISCOUNTPER: 0,
    TOTSELLPRICE: 0,
    GTYPE: "",
    SELLFLAG: "",
    USEYN: "",
    GINFO: "",
    THUMURL: "",
    IMAGES: [],
    DES_IMAGES: [],
    OPTIONS: [],
};

export const GoodsDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Goods");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const { open, item, readonly, closeDialog } = useGoodsDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [isCropModalVisible, setIsCropModalVisible] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<{
        url: string;
        fieldName: any;
        file: File;
    } | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [forcedReload, setForcedReload] = useState(true);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const imagesFileInputRef = useRef<HTMLInputElement>(null);
    const desImagesFileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGES: (File | GoodImage)[];
        DES_IMAGES: (File | GoodImage)[];
    }>({
        IMAGES: [],
        DES_IMAGES: [],
    });

    const [variations, setVariations] = useState<GoodVariations[]>([]);
    const [variationStock, setVariationStock] = useState<
        { OPTIONGOODSID: number; STOCKS: number }[]
    >([]);

    const [deleteImages, setDeleteImages] = useState<GoodImage[]>([]);

    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGES", imagesFileInputRef],
                ["DES_IMAGES", desImagesFileInputRef],
            ]),
        []
    );

    const [form] = Form.useForm<FormGoodsValues>();

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
                    const response = await GoodService.getGoodsImage({
                        COMID: currentCompany?.COMID ?? 0,
                        PLACEID: currentPlace?.PLACEID ?? 0,
                        GOODSID: item.GOODSID,
                    });

                    const rows = getDataFromPayloadRestful(response);

                    setUploadedImages({
                        IMAGES: rows?.filter(
                            (row: { THUMYN: string }) => row.THUMYN == "Y"
                        ),
                        DES_IMAGES: rows?.filter(
                            (row: { THUMYN: string }) => row.THUMYN == "N"
                        ),
                    });

                    const optionsResponse = await GoodService.fetchGoodsOption({
                        COMID: currentCompany?.COMID ?? 0,
                        PLACEID: currentPlace?.PLACEID ?? 0,
                        GOODSID: item.GOODSID,
                    });

                    const options = getDataFromPayloadRestful(optionsResponse);

                    const optionsWithAttb = await Promise.all(
                        options.map(async (option: GoodOptions) => {
                            const subOptions =
                                await GoodService.fetchGoodsOptionAttribute({
                                    COMID: currentCompany?.COMID ?? 0,
                                    PLACEID: currentPlace?.PLACEID ?? 0,
                                    GOODSID: item.GOODSID,
                                    OPTIONCD: option.OPTIONCD,
                                });

                            return {
                                ...option,
                                subOptions:
                                    getDataFromPayloadRestful(subOptions),
                            };
                        })
                    );

                    const variationsResponse =
                        await GoodService.fetchVariations({
                            COMID: currentCompany?.COMID ?? 0,
                            PLACEID: currentPlace?.PLACEID ?? 0,
                            GOODSID: item.GOODSID,
                        });

                    const variationsList =
                        getDataFromPayloadRestful(variationsResponse);

                    setVariations(
                        variationsList?.length > 1
                            ? variationsList.filter(
                                  (variation: any) => variation?.OPTIONSCODE
                              )
                            : variationsList
                    );

                    form.setFieldsValue({
                        NAME: translateContent(item.NAME) || "",
                        DANGA: item.DANGA || 0,
                        SELLPRICE: item.SELLPRICE || 0,
                        DISCOUNTPER: item.DISCOUNTPER || 0,
                        TOTSELLPRICE: item.TOTSELLPRICE || 0,
                        GTYPE: item.GTYPE || "",
                        SELLFLAG: item.SELLFLAG || "",
                        USEYN: item.USEYN || "",
                        GINFO: translateContent(item.GINFO) || "",
                        THUMURL: item.THUMURL || "",
                        IMAGES: rows?.filter(
                            (row: { THUMYN: string }) => row.THUMYN == "Y"
                        ),
                        DES_IMAGES: rows?.filter(
                            (row: { THUMYN: string }) => row.THUMYN == "N"
                        ),
                        OPTIONS:
                            optionsWithAttb?.map((option: GoodOptions) => ({
                                ...option,
                                optionsName: option.OPTIONNAME,
                                subOptions: option?.subOptions?.map(
                                    (subOption: any) => ({
                                        ...subOption,
                                        attributeName: subOption.ATTBNAME,
                                        optionPrice: subOption.ADDTIONALPRICE,
                                    })
                                ),
                            })) || [],
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
    }, [
        item,
        form,
        currentCompany,
        currentPlace,
        forcedReload,
        openNotification,
    ]);

    const onValuesChange = (
        changedValues: Partial<FormGoodsValues>,
        allValues: FormGoodsValues
    ) => {
        if (changedValues.IMAGES || changedValues.DES_IMAGES) {
            setUploadedImages({
                IMAGES: allValues.IMAGES || [],
                DES_IMAGES: allValues.DES_IMAGES || [],
            });
        }

        if (changedValues.SELLPRICE || changedValues.DISCOUNTPER) {
            const sellPrice = form.getFieldValue("SELLPRICE") || 0;
            const discountPer = form.getFieldValue("DISCOUNTPER") || 0;
            const totalSellPrice = Math.round(
                sellPrice * (1 - discountPer / 100)
            );
            form.setFieldValue("TOTSELLPRICE", totalSellPrice);
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            setUploadedImages({
                IMAGES: [],
                DES_IMAGES: [],
            });
            setVariations([]);
            setVariationStock([]);
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

    const imageUpload = async (data: any, formData: any) => {
        const payload = await FileService.multiFileUpload(formData);

        let imageData: any = [];
        let thumImageData: any = [];

        if (payload && payload.length > 0) {
            payload.map((imgInfo) => {
                imgInfo.GOODSID = data?.GOODSID || 0;
                imgInfo.COMID = currentPlace?.COMID || 0;
                imgInfo.PLACEID = currentPlace?.PLACEID || 0;
                imgInfo.ORDERSEQ = 20;
                if ("Y" == imgInfo.THUMYN) {
                    thumImageData.push(imgInfo);
                } else {
                    imageData.push(imgInfo);
                }
            });
        }

        return { data, thumImageData, imageData };
    };

    const handleSaveLog = async (
        thumImageData: any,
        imageData: any,
        id: number
    ) => {
        if (thumImageData?.length)
            await GoodService.addGoodImages(
                thumImageData.map((data: any) => ({
                    COMID: currentCompany?.COMID,
                    PLACEID: currentPlace?.PLACEID,
                    URL: data.URL,
                    PATH: data.PATH,
                    ORDERSEQ: data.ORDERSEQ,
                    THUMYN: data.THUMYN,
                    GOODSID: id,
                }))
            );
        if (imageData?.length)
            await GoodService.addGoodImages(
                imageData.map((data: any) => ({
                    COMID: currentCompany?.COMID,
                    PLACEID: currentPlace?.PLACEID,
                    URL: data.URL,
                    PATH: data.PATH,
                    ORDERSEQ: data.ORDERSEQ,
                    THUMYN: data.THUMYN,
                    GOODSID: id,
                }))
            );

        await GoodService.addGoodLogs({
            COMID: currentCompany?.COMID || 0,
            PLACEID: currentPlace?.PLACEID || 0,
            GOODSID: id,
        });
    };

    const saveLiveGoods = async (data: any) => {
        try {
            const imageResponse = await GoodService.getGoodsImage({
                COMID: currentCompany?.COMID ?? 0,
                PLACEID: currentPlace?.PLACEID ?? 0,
                GOODSID: data.GOODSID,
            });

            const optionsResponse = await GoodService.fetchGoodsOption({
                COMID: currentCompany?.COMID ?? 0,
                PLACEID: currentPlace?.PLACEID ?? 0,
                GOODSID: data.GOODSID,
            });

            const options = getDataFromPayloadRestful(optionsResponse);

            const optionsWithAttb = await Promise.all(
                options.map(async (option: GoodOptions) => {
                    const subOptions =
                        await GoodService.fetchGoodsOptionAttribute({
                            COMID: currentCompany?.COMID ?? 0,
                            PLACEID: currentPlace?.PLACEID ?? 0,
                            GOODSID: data.GOODSID,
                            OPTIONCD: option.OPTIONCD,
                        });

                    return {
                        ...option,
                        OPTIONATTR: getDataFromPayloadRestful(subOptions),
                    };
                })
            );

            const variationsResponse = await GoodService.fetchVariations({
                COMID: currentCompany?.COMID ?? 0,
                PLACEID: currentPlace?.PLACEID ?? 0,
                GOODSID: data.GOODSID,
            });

            await GoodService.sendLive([
                {
                    ...data,
                    DISCOUNTPRICE: data.TOTSELLPRICE,
                    THUMURL: data.THUMURL?.startsWith("https://")
                        ? data.THUMURL
                        : __PHOTO_PATH__ + data.THUMURL,
                    OPTIONS: optionsWithAttb,
                    OPTGOODS: getDataFromPayloadRestful(variationsResponse),
                    IMAGES: getDataFromPayloadRestful(imageResponse),
                    MODID: userInfo?.USERID,
                    rowStatus: "U",
                },
            ]);
        } catch (error) {
            console.error("saveLiveGoods: ", error);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            const { thumImageData, imageData } = await imageUpload(values, {
                FOLDER_FLAG: "G",
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                THUMFILES: values.IMAGES?.filter(
                    (item) => item instanceof File
                ),
                FILES: values.DES_IMAGES?.filter(
                    (item) => item instanceof File
                ),
            });

            console.log({ thumImageData, imageData });

            if (deleteImages.length) {
                await Promise.all(
                    deleteImages.map((item) => {
                        FileService.deleteFile({
                            ...item,
                            IMAGE_URL: item.URL,
                            IMAGE_TYPE: "G",
                        });
                        return;
                    })
                );

                setDeleteImages([]);
            }

            const [nameResponse, ginfoResponse] = await Promise.all([
                TranslateService.translateText({
                    textToTranslate: values.NAME ?? "",
                    cacheYN: "N",
                    targetLang: "vi",
                }),
                values.GINFO
                    ? TranslateService.translateText({
                          textToTranslate: values.GINFO ?? "",
                          cacheYN: "N",
                          targetLang: "vi",
                      })
                    : Promise.resolve(""),
            ]);

            const nameWithLocale = `${nameResponse.RESULT_DATA[0].ORIGINAL_LANG}::${nameResponse.RESULT_DATA[0].ORIGINAL_TEXT}`;
            const ginfoWithLocale = values.GINFO
                ? `${ginfoResponse.RESULT_DATA[0].ORIGINAL_LANG}::${ginfoResponse.RESULT_DATA[0].ORIGINAL_TEXT}`
                : "";

            if (item) {
                const goodImages = await GoodService.getGoodsImage({
                    COMID: currentCompany?.COMID ?? 0,
                    PLACEID: currentPlace?.PLACEID ?? 0,
                    GOODSID: item.GOODSID,
                });

                const rows = getDataFromPayloadRestful(goodImages);

                const thumImg = rows?.find((img: any) => {
                    return img?.THUMYN === "Y";
                });

                await GoodService.updateGood([
                    {
                        GOODSID: item.GOODSID,
                        COMID: currentCompany?.COMID || 0,
                        PLACEID: currentPlace?.PLACEID || 0,
                        REFID: item.REFID,
                        NAME: nameWithLocale,
                        DANGA: values.DANGA,
                        SELLPRICE: values.SELLPRICE,
                        GINFO: ginfoWithLocale,
                        SELLFLAG: values.SELLFLAG,
                        USEYN: values.USEYN,
                        GTYPE: values.GTYPE,
                        THUMURL: thumImg?.URL || thumImageData?.[0]?.URL || "",
                        THUMPATH:
                            thumImg?.PATH || thumImageData?.[0]?.PATH || "",
                        SIZE: "",
                        SIZEPERPRICE: "",
                        COUNTRY: "",
                        GSHORTINFO: "",
                        GSHOWSTART: item.GSHOWSTART,
                        GSHOWEND: item.GSHOWEND,
                        BARCODE: "",
                        QRCODE: "",
                        GOODSYN: "Y",
                        STAMPADD: 0,
                        DISCOUNTPER: values.DISCOUNTPER,
                        TOTSELLPRICE: values.TOTSELLPRICE,
                        VODURL: "",
                        CRTID: userInfo?.USERID ?? "",
                        OUTBINDINGURL: "",
                        LIVEPRICE: 0,
                        STOCKS: 0,
                    },
                ]);

                await handleSaveLog(thumImageData, imageData, item.GOODSID);

                await saveLiveGoods({
                    ...item,
                    NAME: nameWithLocale,
                    DANGA: values.DANGA,
                    SELLPRICE: values.SELLPRICE,
                    GINFO: ginfoWithLocale,
                    SELLFLAG: values.SELLFLAG,
                    USEYN: values.USEYN,
                    GTYPE: values.GTYPE,
                    THUMURL: thumImg?.URL || "",
                    THUMPATH: thumImg?.PATH || "",
                    DISCOUNTPER: values.DISCOUNTPER,
                    TOTSELLPRICE: values.TOTSELLPRICE,
                    CRTID: userInfo?.USERID ?? "",
                });
            } else {
                const response = await GoodService.addGood({
                    COMID: currentCompany?.COMID || 0,
                    PLACEID: currentPlace?.PLACEID || 0,
                    REFID: "-1",
                    ORDERSEQ: -1,
                    NAME: nameWithLocale,
                    DANGA: values.DANGA,
                    SELLPRICE: values.SELLPRICE,
                    GINFO: ginfoWithLocale,
                    SELLFLAG: values.SELLFLAG,
                    USEYN: values.USEYN,
                    GTYPE: values.GTYPE,
                    THUMURL: thumImageData?.[0]?.URL || "",
                    THUMPATH: thumImageData?.[0]?.PATH || "",
                    STOCKS: 0,
                    SIZE: "",
                    SIZEPERPRICE: "",
                    COUNTRY: "",
                    GSHORTINFO: "",
                    GSHOWSTART: "",
                    GSHOWEND: "",
                    BARCODE: "",
                    QRCODE: "",
                    GOODSYN: "Y",
                    STAMPADD: 0,
                    DISCOUNTPER: values.DISCOUNTPER,
                    TOTSELLPRICE: values.TOTSELLPRICE,
                    VODURL: "",
                    CRTID: userInfo?.USERID ?? "",
                    OUTBINDINGURL: "",
                    LIVEPRICE: 0,
                });

                const goods_id =
                    getDataFromPayloadRestful(response)?.[0].V_GOODS_ID;

                await handleSaveLog(thumImageData, imageData, goods_id);
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

            const images = form.getFieldValue("IMAGES");
            const desImages = form.getFieldValue("DES_IMAGES");

            const deleteImagesArr = [
                ...images,
                ...desImages,
                ...deleteImages,
            ].filter((item: any) => !(item instanceof File));

            if (deleteImagesArr.length) {
                await Promise.all(
                    deleteImagesArr.map((item) => {
                        FileService.deleteFile({
                            ...item,
                            IMAGE_URL: item.URL,
                            IMAGE_TYPE: "G",
                        });
                        return;
                    })
                );

                setDeleteImages([]);
            }

            const options = form.getFieldValue("OPTIONS");

            const deleteAttbs = options
                .flatMap((item: { subOptions: any }) => item?.subOptions)
                .filter((option: any) => option?.ATTBCD);

            if (deleteAttbs?.length) {
                await GoodService.deleteGoodsOptionAttribute(
                    deleteAttbs?.map((item: any) => ({
                        COMID: item.COMID,
                        PLACEID: item.PLACEID,
                        GOODSID: item.GOODSID,
                        OPTIONCD: item.OPTIONCD,
                        ATTBCD: item.ATTBCD,
                    }))
                );
            }

            const deleteOptionArr = options.filter(
                (option: any) => option?.OPTIONCD
            );

            if (deleteOptionArr?.length) {
                await GoodService.deleteGoodsOption(
                    deleteOptionArr?.map((item: any) => ({
                        COMID: item.COMID,
                        PLACEID: item.PLACEID,
                        GOODSID: item.GOODSID,
                        OPTIONCD: item.OPTIONCD,
                    }))
                );
            }

            await GoodService.deleteGood({
                COMID: item?.COMID ?? 0,
                PLACEID: item?.PLACEID ?? 0,
                GOODSID: item?.GOODSID ?? 0,
            });

            await GoodService.addGoodLogs({
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                GOODSID: item?.GOODSID ?? 0,
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
    }, [
        currentCompany,
        currentPlace,
        deleteImages,
        form,
        handleClose,
        item,
        openNotification,
        tCommon,
    ]);

    const handleAddItem = useCallback(
        (add: any, name: string) => {
            if (name == "OPTIONS") {
                const options = form.getFieldValue("OPTIONS");

                if (options.length == 2) {
                    openNotification(
                        "error",
                        t("GOODS_SAVE_ATT_ERROR"),
                        undefined,
                        {
                            showProgress: true,
                            pauseOnHover: true,
                        }
                    );
                    return;
                }
            }

            add?.();
        },
        [form, openNotification, t]
    );

    const handleSaveOptions = useCallback(
        async (payload: any) => {
            try {
                const optionsItem = form.getFieldValue("OPTIONS")[payload];

                let optionId = -1;

                if (!optionsItem?.OPTIONCD) {
                    const insertGoodsResponse =
                        await GoodService.insertGoodsOption([
                            {
                                COMID: currentCompany?.COMID || 0,
                                PLACEID: currentPlace?.PLACEID || 0,
                                GOODSID: item?.GOODSID ?? 0,
                                OPTIONNAME: optionsItem.optionsName,
                                ORDERSEQ: 0,
                                OPTTYPE: "R",
                                USEYN: "Y",
                                MULTISELECTYN: "N",
                                REQUIREDYN: "N",
                            },
                        ]);
                    optionId =
                        insertGoodsResponse?.RESULT_DATA?.[0]?.V_OPTIONCD ?? -1;
                }

                if (
                    optionsItem?.OPTIONCD &&
                    optionsItem?.OPTIONNAME != optionsItem?.optionsName
                ) {
                    await GoodService.updateGoodsOption([
                        {
                            COMID: optionsItem.COMID,
                            PLACEID: optionsItem.PLACEID,
                            GOODSID: optionsItem.GOODSID,
                            OPTIONCD: optionsItem.OPTIONCD,
                            OPTIONNAME: optionsItem.optionsName,
                            ORDERSEQ: optionsItem.ORDERSEQ,
                            OPTTYPE: optionsItem.OPTTYPE,
                            USEYN: optionsItem.USEYN,
                            MULTISELECTYN: optionsItem.MULTISELECTYN,
                            REQUIREDYN: optionsItem.REQUIREDYN,
                        },
                    ]);
                }

                const attbOptionListToAdd = optionsItem?.subOptions?.filter(
                    (item: any) =>
                        !item?.ATTBCD &&
                        item?.attributeName &&
                        item?.optionPrice
                );

                if (attbOptionListToAdd?.length) {
                    await GoodService.insertGoodsOptionAttribute(
                        attbOptionListToAdd?.map((data: any) => ({
                            COMID: currentCompany?.COMID || 0,
                            PLACEID: currentPlace?.PLACEID || 0,
                            GOODSID: item?.GOODSID ?? 0,
                            OPTIONCD: optionsItem.OPTIONCD ?? optionId,
                            ATTBNAME: data.attributeName,
                            ORDERSEQ: 0,
                            ATTBVALUE: 0,
                            ADDTIONALPRICE: data.optionPrice,
                            STOCKS: 0,
                        }))
                    );
                }

                const attbOptionListToUpdate = optionsItem?.subOptions?.filter(
                    (item: any) =>
                        item?.ATTBCD &&
                        item?.attributeName &&
                        item?.optionPrice &&
                        (item?.attributeName != item?.ATTBNAME ||
                            item?.optionPrice != item?.ADDTIONALPRICE)
                );

                if (attbOptionListToUpdate?.length) {
                    await GoodService.updateGoodsOptionAttribute(
                        attbOptionListToUpdate?.map((item: any) => ({
                            COMID: item.COMID,
                            PLACEID: item.PLACEID,
                            GOODSID: item.GOODSID,
                            OPTIONCD: item.OPTIONCD,
                            ATTBCD: item.ATTBCD,
                            ATTBNAME: item.attributeName,
                            ORDERSEQ: item.ORDERSEQ,
                            ATTBVALUE: item.ATTBVALUE,
                            ADDTIONALPRICE: item.optionPrice,
                            STOCKS: item.STOCKS,
                        }))
                    );
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
        [
            currentCompany,
            currentPlace,
            form,
            item,
            openNotification,
            tCommon,
            forcedReload,
        ]
    );

    const handleDeleteOptions = useCallback(
        async (name: number, _parent?: any, config?: any) => {
            try {
                const options = form.getFieldValue("OPTIONS");
                const deletedOption = options[name];

                const deleteAttbs = deletedOption?.subOptions?.filter(
                    (item: any) => item?.ATTBCD
                );

                if (deleteAttbs?.length) {
                    await GoodService.deleteGoodsOptionAttribute(
                        deleteAttbs?.map((item: any) => ({
                            COMID: item.COMID,
                            PLACEID: item.PLACEID,
                            GOODSID: item.GOODSID,
                            OPTIONCD: item.OPTIONCD,
                            ATTBCD: item.ATTBCD,
                        }))
                    );
                }

                if (deletedOption.OPTIONCD) {
                    await GoodService.deleteGoodsOption([
                        {
                            COMID: deletedOption.COMID,
                            PLACEID: deletedOption.PLACEID,
                            GOODSID: deletedOption.GOODSID,
                            OPTIONCD: deletedOption.OPTIONCD,
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
                }

                config?.();
                setForcedReload(!forcedReload);
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

    const handleDeleteAttb = useCallback(
        async (name: number, parent?: any, config?: any) => {
            try {
                const options = form.getFieldValue("OPTIONS");
                const deletedOption = options[parent[0]][parent[1]][name];

                if (deletedOption?.OPTIONCD && deletedOption?.ATTBCD) {
                    await GoodService.deleteGoodsOptionAttribute([
                        {
                            COMID: deletedOption.COMID,
                            PLACEID: deletedOption.PLACEID,
                            GOODSID: deletedOption.GOODSID,
                            OPTIONCD: deletedOption.OPTIONCD,
                            ATTBCD: deletedOption.ATTBCD,
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
                }

                config?.();
                setForcedReload(!forcedReload);
            } catch (error) {
                openNotification("error", tCommon("delete-failed"), undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });
                console.error("handleDeleteAttb: ", error);
            }
        },
        [forcedReload, form, openNotification, tCommon]
    );

    const handleSaveVariation = useCallback(async () => {
        try {
            if (variationStock?.length) {
                await GoodService.updateVariations(variationStock);

                openNotification(
                    "success",
                    tCommon("update-successful"),
                    undefined,
                    {
                        showProgress: true,
                        pauseOnHover: true,
                    }
                );
            }
        } catch (error) {
            openNotification("error", tCommon("update-failed"), undefined, {
                showProgress: true,
                pauseOnHover: true,
            });

            console.error("handleSaveVariation error:", error);
        }
    }, [openNotification, tCommon, variationStock]);

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
                                ...form.getFieldValue(imageToCrop.fieldName),
                                croppedFile,
                            ],
                        });

                        form.setFieldValue(imageToCrop.fieldName, [
                            ...form.getFieldValue(imageToCrop.fieldName),
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
            setDeleteImages([...deleteImages, item]);
        }
    };

    const fields: Field[] = useMemo(
        () => [
            {
                name: "NAME",
                label: "GOODS_NAME",
                type: "input",
                required: true,
                placeholder: "GOODS_NAME",
                colSpan: 12,
            },
            {
                name: "DANGA",
                label: "GOODS_DANGA",
                type: "inputnumber",
                required: true,
                placeholder: "GOODS_DANGA",
                colSpan: 12,
                min: 0,
            },
            {
                name: "SELLPRICE",
                label: "GOODS_SELLPRICE",
                type: "inputnumber",
                required: true,
                placeholder: "GOODS_SELLPRICE",
                colSpan: 12,
                min: 0,
            },
            {
                name: "DISCOUNTPER",
                label: "GOODS_DISCOUNTPER",
                type: "inputnumber",
                required: true,
                placeholder: "GOODS_DISCOUNTPER",
                colSpan: 12,
                min: 0,
                max: 100,
                step: 1,
            },
            {
                name: "TOTSELLPRICE",
                label: "GOODS_TOTSELLPRICE",
                type: "display",
                colSpan: 12,
            },
            {
                name: "GTYPE",
                label: "GOODS_GTYPE",
                type: "select",
                required: true,
                placeholder: "GOODS_GTYPE",
                colSpan: 12,
                options: [
                    { value: "S", label: t("GOODS_GTYPE_O_S") },
                    { value: "E", label: t("GOODS_GTYPE_O_E") },
                ],
            },
            {
                name: "SELLFLAG",
                label: "GOODS_SELLFLAG",
                type: "select",
                required: true,
                placeholder: "GOODS_SELLFLAG",
                colSpan: 12,
                options: [
                    { value: "Y", label: t("GOODS_SELLFLAG_O_Y") },
                    { value: "N", label: t("GOODS_SELLFLAG_O_N") },
                ],
            },
            {
                name: "USEYN",
                label: "GOODS_USEYN",
                type: "select",
                required: true,
                placeholder: "GOODS_USEYN",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_Y") },
                    { value: "N", label: tCommon("CM_N") },
                ],
            },
            {
                name: "GINFO",
                label: "GOODS_GINFO",
                type: "textarea",
                placeholder: "GOODS_GINFO",
                colSpan: 24,
            },
            {
                name: "IMAGES",
                label: "GOODS_IMAGES",
                type: "upload",
                colSpan: 24,
                accept: "image/*",
            },
            {
                name: "DES_IMAGES",
                label: "GOODS_DES_IMAGES",
                type: "upload",
                colSpan: 24,
                accept: "image/*",
            },
            {
                name: "OPTIONS",
                label: "GOODS_OPTION",
                type: "options",
                colSpan: 24,
                hidden: !editMode,
                onSave: handleSaveOptions,
                onDelete: handleDeleteOptions,
                children: [
                    {
                        name: "optionsName",
                        label: "GOODS_OPTION_OPTIONNAME",
                        type: "input",
                        required: true,
                        placeholder: "GOODS_OPTION_OPTIONNAME",
                        colSpan: 18,
                    },
                    {
                        name: "subOptions",
                        label: "GOODS_ATTRIBUTE",
                        type: "options",
                        colSpan: 24,
                        onDelete: handleDeleteAttb,
                        children: [
                            {
                                name: "attributeName",
                                label: "GOODS_ATTRIBUTE_ATTBNAME",
                                type: "input",
                                required: true,
                                placeholder: "GOODS_ATTRIBUTE_ATTBNAME",
                                colSpan: 10,
                            },
                            {
                                name: "optionPrice",
                                label: "GOODS_ATTRIBUTE_ADDTIONALPRICE",
                                type: "inputnumber",
                                required: true,
                                placeholder: "GOODS_ATTRIBUTE_ADDTIONALPRICE",
                                colSpan: 10,
                                min: 0,
                            },
                        ],
                    },
                ],
            },
        ],
        [
            editMode,
            handleDeleteAttb,
            handleDeleteOptions,
            handleSaveOptions,
            t,
            tCommon,
        ]
    );

    const columns: any = [
        {
            title: t("GOODS_OPTIONGOODSID"),
            dataIndex: "OPTIONGOODSID",
            key: "OPTIONGOODSID",
        },
        {
            title: t("GOODS_OPTIONGOODSCODE"),
            dataIndex: "OPTIONGOODSCODE",
            key: "OPTIONGOODSCODE",
        },
        {
            title: t("GOODS_OPTIONSCODE"),
            dataIndex: "OPTIONSCODE",
            key: "OPTIONSCODE",
        },
        {
            title: t("GOODS_DANGA"),
            dataIndex: "DANGA",
            key: "DANGA",
        },
        {
            title: t("GOODS_SELLPRICE"),
            dataIndex: "SELLPRICE",
            key: "SELLPRICE",
        },
        {
            title: t("GOODS_TOTSELLPRICE"),
            dataIndex: "TOTSELLPRICE",
            key: "TOTSELLPRICE",
        },
        {
            title: t("GOODS_ATTRIBUTE_STOCKS"),
            dataIndex: "STOCKS",
            key: "STOCKS",
            fixed: "right",
            width: 50,
            render: (value: number, record: any) => (
                <InputNumber
                    min={0}
                    defaultValue={value ?? 0}
                    disabled={readonly}
                    style={{ width: "100%" }}
                    onChange={(e) => {
                        const existingItemIndex = variationStock.filter(
                            (item) => item.OPTIONGOODSID == record.OPTIONGOODSID
                        );

                        if (existingItemIndex?.length) {
                            setVariationStock(
                                variationStock?.map((item) =>
                                    item.OPTIONGOODSID == record.OPTIONGOODSID
                                        ? { ...item, STOCKS: e ?? 0 }
                                        : item
                                )
                            );
                        } else {
                            setVariationStock([
                                ...variationStock,
                                {
                                    OPTIONGOODSID: record.OPTIONGOODSID,
                                    STOCKS: e ?? 0,
                                },
                            ]);
                        }
                    }}
                />
            ),
        },
    ];

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Goods",
        fileInputRefs,
        uploadedImages,
        handleAdd: handleAddItem,
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

                    {item && (
                        <>
                            <Flex
                                align="center"
                                gap="middle"
                                justify="space-between"
                                style={{ marginTop: 16, fontWeight: 600 }}
                            >
                                {t("GOODS_OPTIONS_GOODS")}
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={handleSaveVariation}
                                    loading={isLoading}
                                >
                                    {tCommon("CM_SAVE")}
                                </Button>
                            </Flex>

                            <Table
                                dataSource={variations}
                                columns={columns}
                                pagination={false}
                                bordered
                                style={{ marginTop: 16 }}
                                scroll={{ x: "max-content" }}
                            />
                        </>
                    )}
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
