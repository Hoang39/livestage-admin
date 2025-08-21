import { Company } from "@modules/Company";
import { Place } from "@modules/Place";
import { Goods } from "@modules/Goods";
import { Notification } from "@modules/Notification";
import { Banner } from "@modules/Banner";
import { Broadcast } from "@modules/Broadcast";
import { GoodsGroup } from "@/app/modules/Goods/GoodsGroup";
import { GoodsLog } from "@/app/modules/Goods/GoodsLog";
import { GoodsReview } from "@/app/modules/Goods/GoodsReview";
import { Schedule } from "@/app/modules/Notification/Schedule";
import { User } from "@/app/modules/Membership/User";
import { Membership } from "@/app/modules/Membership";
import { Order } from "@/app/modules/Order";
import { CommonCode } from "@/app/modules/Common/CommonCode";
import { Category } from "@/app/modules/Common/Category";
import { Policy } from "@/app/modules/Common/Policy";
import { AppTemplate } from "@/app/modules/Common/AppTemplate";
import { AuthUser } from "@/app/modules/Preferences/User";
import { PersonalSale } from "@/app/modules/Personal/PersonalSale";
import { GoodsSale } from "@/app/modules/Personal/GoodsSale";
import { StatisticProduct } from "@/app/modules/Personal/StatisticProduct";
import { StatisticReview } from "@/app/modules/Personal/StatisticReview";
import { ReportBroadcast } from "@/app/modules/Report/ReportBroadcast";
import { ReportGoods } from "@/app/modules/Report/ReportGoods";
import { ReportChat } from "@/app/modules/Report/ReportChat";
import { Event } from "@/app/modules/Event/Event";
import { PollEvent } from "@/app/modules/Event/PollEvent";
import { ABEvent } from "@/app/modules/Event/ABEvent";
import { Artist } from "@/app/modules/Artist/Artist";
import { CouponList } from "@/app/modules/Coupon/CouponList";
import { Coupon } from "@/app/modules/Coupon/Coupon";
import { VoteList } from "@/app/modules/Vote/VoteList";
import { CreateVote } from "@/app/modules/Vote/CreateVote";
import { HeartPackage } from "@/app/modules/Reward/HeartPackage";
import { HeartRecharge } from "@/app/modules/Reward/HeartRecharge";
import { Mission } from "@/app/modules/Reward/Mission";
import { Roulette } from "@/app/modules/Reward/Roulette";
import { Chat } from "@/app/modules/Chat/Chat";
import { ShopStatistic } from "@/app/modules/Statistic/Shop";
import { MemberStatistic } from "@/app/modules/Statistic/Member";
import { ArtistStatistic } from "@/app/modules/Statistic/Artist";

export interface RouteConfig {
    path: string;
    key: string;
    role?: string[];
    icon?: React.ReactNode;
    title: string;
    items?: RouteConfig[];
    element?: React.FC<any>;
    props?: Record<string, any>;
}

export const defaultPath = "/goods/list";
export const loginPath = "/auth/login";

export const routeConfig: RouteConfig[] = [
    {
        path: "goods",
        key: "goods",
        title: "Product",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Goods",
                role: [],
                element: Goods,
            },
            {
                path: "group",
                key: "group",
                title: "GoodsGroup",
                role: [],
                element: GoodsGroup,
            },
            {
                path: "review",
                key: "review",
                title: "GoodsReview",
                role: [],
                element: GoodsReview,
            },
            {
                path: "log",
                key: "log",
                title: "GoodsInfoLog",
                role: [],
                element: GoodsLog,
            },
        ],
    },
    {
        path: "notification",
        key: "notification",
        title: "Noti",
        role: [],
        items: [
            {
                path: "list",
                key: "notification-list",
                title: "Noti",
                role: [],
                element: Notification,
            },
            {
                path: "schedule",
                key: "schedule",
                title: "ScheduleSendNotification",
                role: [],
                element: Schedule,
            },
        ],
    },
    {
        path: "common",
        key: "common",
        title: "Common",
        role: [],
        items: [
            {
                path: "code",
                key: "code",
                title: "CommonCode",
                role: [],
                element: CommonCode,
            },
            {
                path: "category",
                key: "category",
                title: "Category",
                role: [],
                element: Category,
            },
            {
                path: "policy",
                key: "policy",
                title: "Policy",
                role: [],
                element: Policy,
            },
            {
                path: "appTemplate",
                key: "appTemplate",
                title: "AppTemplate",
                role: [],
                element: AppTemplate,
            },
        ],
    },
    {
        path: "membership",
        key: "membership",
        title: "Membership",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Membership",
                role: [],
                element: Membership,
            },
            {
                path: "user",
                key: "user",
                title: "User",
                role: [],
                element: User,
            },
        ],
    },
    {
        path: "order",
        key: "order",
        title: "Order",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Order",
                role: [],
                element: Order,
            },
        ],
    },
    {
        path: "personal",
        key: "personal",
        title: "PersonalManagement",
        role: [],
        items: [
            {
                path: "personal",
                key: "personal",
                title: "Personal",
                role: [],
                element: PersonalSale,
            },
            {
                path: "goods",
                key: "goods",
                title: "GoodsSale",
                role: [],
                element: GoodsSale,
            },
            {
                path: "statisticProduct",
                key: "statisticProduct",
                title: "StatisticsProduct",
                role: [],
                element: StatisticProduct,
            },
            {
                path: "statisticReview",
                key: "statisticReview",
                title: "StatisticsReview",
                role: [],
                element: StatisticReview,
            },
        ],
    },
    {
        path: "preference",
        key: "preference",
        title: "Preferences",
        role: [],
        items: [
            {
                path: "company",
                key: "company",
                title: "Company",
                role: [],
                element: Company,
            },
            {
                path: "place",
                key: "place",
                title: "Place",
                role: [],
                element: Place,
            },
            {
                path: "authUser",
                key: "authUser",
                title: "AuthUser",
                role: [],
                element: AuthUser,
            },
        ],
    },
    {
        path: "statistics",
        key: "statistics",
        title: "Statistics",
        role: [],
        items: [
            {
                path: "shop",
                key: "shop",
                title: "ShopStatics",
                role: [],
                element: ShopStatistic,
            },
            {
                path: "member",
                key: "member",
                title: "MembershipTicketStatics",
                role: [],
                element: MemberStatistic,
            },
            {
                path: "lipstar",
                key: "lipstar",
                title: "LipstarTicketStatics",
                role: [],
                element: ArtistStatistic,
            },
        ],
    },
    {
        path: "broadcast",
        key: "broadcast",
        title: "Broadcast",
        role: [],
        items: [
            {
                path: "list",
                key: "broadcast-list",
                title: "Broadcast",
                role: [],
                element: Broadcast,
            },
        ],
    },
    {
        path: "banner",
        key: "banner",
        title: "Banner",
        role: [],
        items: [
            {
                path: "list",
                key: "banner-list",
                title: "Banner",
                role: [],
                element: Banner,
                props: { role: "banner" },
            },
            {
                path: "sub-banner",
                key: "sub-banner-list",
                title: "SubBanner",
                role: [],
                element: Banner,
                props: { role: "sub-banner" },
            },
        ],
    },
    {
        path: "event",
        key: "event",
        title: "Event",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Event",
                role: [],
                element: Event,
            },
        ],
    },
    {
        path: "chat",
        key: "chat",
        title: "Chat",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Chat",
                role: [],
                element: Chat,
            },
        ],
    },
    {
        path: "report",
        key: "report",
        title: "Report",
        role: [],
        items: [
            {
                path: "broadcast",
                key: "broadcast",
                title: "ReportBroadcast",
                role: [],
                element: ReportBroadcast,
            },
            {
                path: "goods",
                key: "goods",
                title: "ReportGoods",
                role: [],
                element: ReportGoods,
            },
            {
                path: "chat",
                key: "chat",
                title: "ReportChat",
                role: [],
                element: ReportChat,
            },
        ],
    },
    {
        path: "user-event",
        key: "user-event",
        title: "UserEvent",
        role: [],
        items: [
            {
                path: "poll",
                key: "poll",
                title: "PollEvent",
                role: [],
                element: PollEvent,
            },
            {
                path: "ab",
                key: "ab",
                title: "ABEvent",
                role: [],
                element: ABEvent,
            },
        ],
    },
    {
        path: "artist",
        key: "artist",
        title: "ArtistManagement",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "Artist",
                role: [],
                element: Artist,
                props: { type: "A" },
            },
            {
                path: "group",
                key: "group",
                title: "ArtistGroup",
                role: [],
                element: Artist,
                props: { type: "G" },
            },
        ],
    },
    {
        path: "vote",
        key: "vote",
        title: "Vote",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "VoteList",
                role: [],
                element: VoteList,
            },
            {
                path: "create",
                key: "create",
                title: "CreateVote",
                role: [],
                element: CreateVote,
            },
        ],
    },
    {
        path: "reward",
        key: "reward",
        title: "Reward",
        role: [],
        items: [
            {
                path: "heart-package",
                key: "heart-package",
                title: "HeartPackage",
                role: [],
                element: HeartPackage,
            },
            {
                path: "heart-recharge",
                key: "heart-recharge",
                title: "HeartRecharge",
                role: [],
                element: HeartRecharge,
            },
            {
                path: "mission",
                key: "mission",
                title: "Mission",
                role: [],
                element: Mission,
            },
            {
                path: "roulette",
                key: "roulette",
                title: "Roulette",
                role: [],
                element: Roulette,
            },
        ],
    },
    {
        path: "coupon",
        key: "coupon",
        title: "CouponManagement",
        role: [],
        items: [
            {
                path: "list",
                key: "list",
                title: "CouponList",
                role: [],
                element: CouponList,
            },
            {
                path: "create",
                key: "create",
                title: "Coupon",
                role: [],
                element: Coupon,
            },
        ],
    },
];
