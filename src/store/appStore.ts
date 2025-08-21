import { CommonService } from "@/app/services/common";
import { CompanyService } from "@/app/services/company";
import { CategoryService } from "@/app/services/category";
import { Company, Place } from "@/interfaces/business";
import { Category } from "@/interfaces/category";
import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { translateContent } from "@/utils/handleResponse";
import { VoteService } from "@/app/services/vote";

export type AppState = {
    isFetching: boolean;
    companyList: Company[];
    placeList: Place[];
    categoryList: Category[];
    currentCompany: Company | null;
    currentPlace: Place | null;
    userInfo?: any;
    voteList: any;
};

export type AppActions = {
    setUserInfo: (userInfo: any) => void;
    fetchCompanies: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetPlaces: (comId: number) => Promise<void>;
    fetchVoteConfig: () => Promise<void>;
    setCurrentCompany: (comId: number) => void;
    setCategories: () => void;
    setCurrentPlace: (placeId: number) => void;
    setVoteConfigList: () => void;
};

export type AppStore = AppState & AppActions;

export const initAppStore = (): AppState => {
    return {
        isFetching: true,
        companyList: [],
        placeList: [],
        categoryList: [],
        currentCompany: null,
        currentPlace: null,
        voteList: [],
    };
};

export const defaultInitAppState: AppState = {
    isFetching: false,
    companyList: [],
    placeList: [],
    categoryList: [],
    currentCompany: null,
    currentPlace: null,
    voteList: [],
};

export const createAppStore = (initState: AppState = defaultInitAppState) => {
    return createStore<AppStore>()(
        persist(
            (set, get) => ({
                ...initState,
                setUserInfo: (userInfo: any) => {
                    set({ userInfo });
                },
                fetchCompanies: async () => {
                    set({ isFetching: true });

                    const listRes = await CommonService.getCompanyList({
                        COMNAME: "",
                        USERID: "dev",
                    });

                    if (listRes.RESULT_DATA) {
                        set({
                            companyList: listRes.RESULT_DATA,
                            isFetching: false,
                        });

                        if (!get().currentCompany) {
                            get().setCurrentCompany(
                                listRes.RESULT_DATA[0]?.COMID
                            );
                        }
                    }
                },
                fetPlaces: async (comId: number) => {
                    set({ isFetching: true });

                    const listRes = await CompanyService.getPlaceList({
                        COMID: comId,
                    });

                    if (listRes.RESULT_DATA) {
                        set({
                            placeList: listRes.RESULT_DATA,
                            isFetching: false,
                        });
                        set({
                            currentPlace: listRes.RESULT_DATA[0],
                        });
                    }
                },
                setCurrentCompany(comId) {
                    const company = get().companyList.find(
                        (company) => company.COMID === comId
                    );

                    if (!company) return;

                    set({ currentCompany: company });

                    get().fetPlaces(comId);
                },
                setCurrentPlace(placeId) {
                    const place = get().placeList.find(
                        (place) => place.PLACEID === placeId
                    );

                    if (!place) return;

                    set({ currentPlace: place });
                },
                fetchCategories: async () => {
                    set({ isFetching: true });

                    const listRes = await CategoryService.getCategoryList({});

                    const categoryList = listRes.RESULT_DATA.map((item) => ({
                        ...item,
                        NAME: translateContent(item.NAME),
                    }));

                    if (listRes.RESULT_DATA) {
                        set({ categoryList: categoryList });
                    }
                },
                setCategories() {
                    const category = get().categoryList;

                    if (!category) return;

                    set({ categoryList: category });
                },
                fetchVoteConfig: async () => {
                    set({ isFetching: true });

                    const listRes = await VoteService.fetchConfigList();

                    const voteList = listRes.RESULT_DATA?.[0]?.ITEMS?.map(
                        (item: any) => ({
                            ...item,
                            id: item.MAX_DAILY_VOTE,
                            NAME: translateContent(item.NAME),
                        })
                    );

                    if (listRes.RESULT_DATA) {
                        set({ voteList: voteList });
                    }
                },
                setVoteConfigList() {
                    const vote = get().voteList;

                    if (!vote) return;

                    set({ voteList: vote });
                },
            }),
            {
                name: "app-store",
                storage: {
                    getItem: (name) => {
                        const str = localStorage.getItem(name);
                        return str ? JSON.parse(str) : null;
                    },
                    setItem: (name, value) => {
                        localStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name);
                    },
                },
            }
        )
    );
};
