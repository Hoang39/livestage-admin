import liveApi from "@api/liveApi";
import ENDPOINTS from "@/api/EndPoints";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { redirect } from "react-router";
import { loginPath } from "@/configs/routeConfig";
import { generateUUID, getFolderPath } from "@/utils/handleImage";
import axios from "axios";
import beaconApi from "@/api/beaconApi";
import { liveParams } from "@/api/params";

const isDebug = import.meta.env.MODE !== "production";

export const FileService = {
    upload: (files: any) => {
        const promiseFileList = files.map((fileInfo: any) => {
            let { FILE, FILENAME, PATH, PATHORG, PATHURL, CATEGORY, ...REST } =
                fileInfo;

            return new Promise((resolve, reject) => {
                const data = {
                    JSON: JSON.stringify({
                        CATEGORY: CATEGORY,
                        KEYNAME: PATH,
                    }),
                };

                liveApi({
                    method: "POST",
                    url: ENDPOINTS.UPLOAD_FILE,
                    data: data,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        apiKey: __API_KEY__,
                    },
                })
                    .then((getLinkResponse: any) => {
                        const { UPLOAD_URL } =
                            getDataFromPayloadRestful(getLinkResponse);

                        if (!UPLOAD_URL) {
                            return Promise.reject(
                                new Error("UPLOAD_URL is not exist")
                            );
                        }
                        return axios({
                            method: "PUT",
                            url: UPLOAD_URL,
                            headers: {
                                "Content-Type": "image/jpeg",
                            },
                            data: FILE,
                        });
                    })
                    .then(() => {
                        resolve({
                            NEW_FILE_NAME: FILENAME,
                            ONLY_PATH: PATHORG,
                            ORG_FILE_NAME: FILE?.name || "file.name",
                            PATH: PATH,
                            SIZE: FILE?.size || 1000,
                            URL: PATHURL,
                            ...REST,
                        });
                    })
                    .catch((err: any) => {
                        if (isDebug) console.log("Upload error:", err);
                        if (err.response?.status === 401) {
                            redirect(loginPath); // Handle 401 manually if needed
                        }
                        reject(err);
                    });
            });
        });

        return Promise.all(promiseFileList);
    },

    textUpload: (files: any) => {
        const promiseFileList = files.map((fileInfo: any) => {
            let { FILE, FILENAME, PATH, PATHORG, PATHURL, ...REST } = fileInfo;

            return new Promise((resolve, reject) => {
                const data = {
                    JSON: JSON.stringify({
                        FILE_NAME: FILENAME,
                    }),
                };

                liveApi({
                    method: "POST",
                    url: ENDPOINTS.RESOURCE_FILE,
                    data: data,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        apiKey: __API_KEY__,
                    },
                })
                    .then((getLinkResponse: any) => {
                        const { UPLOAD_URL } =
                            getDataFromPayloadRestful(getLinkResponse);

                        if (!UPLOAD_URL) {
                            return Promise.reject(
                                new Error("UPLOAD_URL is not exist")
                            );
                        }
                        return axios({
                            method: "PUT",
                            url: UPLOAD_URL,
                            headers: {
                                "Content-Type": "text/html",
                            },
                            data: FILE,
                        });
                    })
                    .then(() => {
                        resolve({
                            NEW_FILE_NAME: FILENAME,
                            ONLY_PATH: PATHORG,
                            ORG_FILE_NAME: FILE?.name || "file.name",
                            PATH: PATHORG,
                            SIZE: FILE?.size || 1000,
                            URL: PATHURL,
                            ...REST,
                        });
                    })
                    .catch((err: any) => {
                        if (isDebug) console.log("Upload error:", err);
                        if (err.response?.status === 401) {
                            redirect(loginPath); // Handle 401 manually if needed
                        }
                        reject(err);
                    });
            });
        });

        return Promise.all(promiseFileList);
    },

    multiFileUpload: (goodsUpload: any) => {
        const {
            COMID = 0,
            PLACEID = 0,
            THUMFILES = [],
            FILES = [],
            FOLDER_FLAG,
        } = goodsUpload;
        const category = getFolderPath(FOLDER_FLAG);

        let listFile = (
            FOLDER_FLAG == "G"
                ? [
                      ...THUMFILES.map((file: any) => {
                          if (!(file instanceof File)) return null;

                          let fileName = `U_${COMID}_${PLACEID}_${new Date().getTime()}_${generateUUID()}.jpeg`;
                          let path = `${COMID}/${PLACEID}/${fileName}`;
                          let pathOrg = `/${COMID}/${PLACEID}/${fileName}`;
                          let pathUrl = `/${category}/${COMID}/${PLACEID}/${fileName}`;

                          return {
                              FILE: file,
                              FILENAME: fileName,
                              PATH: path,
                              PATHORG: pathOrg,
                              PATHURL: pathUrl,
                              CATEGORY: category,
                              THUMYN: "Y",
                          };
                      }),
                      ...FILES.map((file: any) => {
                          if (!(file instanceof File)) return null;

                          let fileName = `U_${COMID}_${PLACEID}_${new Date().getTime()}_${generateUUID()}.jpeg`;
                          let path = `${COMID}/${PLACEID}/${fileName}`;
                          let pathOrg = `/${COMID}/${PLACEID}/${fileName}`;
                          let pathUrl = `/${category}/${COMID}/${PLACEID}/${fileName}`;

                          return {
                              FILE: file,
                              FILENAME: fileName,
                              PATH: path,
                              PATHORG: pathOrg,
                              PATHURL: pathUrl,
                              CATEGORY: category,
                              THUMYN: "N",
                          };
                      }),
                  ]
                : FILES.map((file: any) => {
                      if (!(file instanceof File)) return null;

                      let fileName = `U_${COMID}_${PLACEID}_${new Date().getTime()}_${generateUUID()}.jpeg`;
                      let path = `${COMID}/${PLACEID}/${fileName}`;
                      let pathOrg = `/${COMID}/${PLACEID}/${fileName}`;
                      let pathUrl = `/${category}/${COMID}/${PLACEID}/${fileName}`;

                      return {
                          FILE: file,
                          FILENAME: fileName,
                          PATH: path,
                          PATHORG: pathOrg,
                          PATHURL: pathUrl,
                          CATEGORY: category,
                      };
                  })
        ).filter((file: any) => file);

        return FileService.upload(listFile);
    },

    fileUpload: (fileUpload: any) => {
        const { FILES = [], uploadConfig } = fileUpload;

        const imageId = uploadConfig?.imageId;

        const category = getFolderPath(uploadConfig?.folderId || "P");
        const MODULE = uploadConfig?.module || "CATEGORY";

        const listFile = FILES.map((file: any) => {
            if (!(file instanceof File)) return null;

            const fileType = file?.type?.split("/")[1] || "jpg";

            const fileName = `U_${MODULE}_${imageId}.` + fileType;
            const path = `${MODULE}/${fileName}`;
            const pathOrg = `/${MODULE}/${fileName}`;
            const pathUrl = `/${category}/${MODULE}/${fileName}`;

            return {
                FILE: file,
                FILENAME: fileName,
                PATH: path,
                PATHORG: pathOrg,
                PATHURL: pathUrl,
                CATEGORY: category,
            };
        });

        return FileService.upload(listFile);
    },

    deleteFile: (params: any) => {
        return beaconApi.delete<any, any>("files/v1/upload/delete/", {
            data: liveParams(params),
        });
    },

    urlFileUpload: (params: any) =>
        axios({
            method: "PUT",
            url: params.URL,
            headers: {
                "Content-Type": "image/jpeg",
            },
            data: params.FILE,
        }),
};
