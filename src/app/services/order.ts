import beaconApi from "@api/beaconApi";
import { commonParams } from "@/api/params";
import ENDPOINTS from "@api/EndPoints";
import { Response } from "@/interfaces/common";
import {
    Order,
    OrderGoods,
    OrderGoodsReq,
    OrderReq,
    OrderUReq,
} from "@/interfaces/order";

const OrderService = {
    fetchOrder: (params: OrderReq) => {
        return beaconApi.post<OrderReq, Response<Order[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|ORDER.ORDER_S", params)
        );
    },

    fetchOrderGoods: (params: OrderGoodsReq) => {
        return beaconApi.post<OrderGoodsReq, Response<OrderGoods[]>>(
            ENDPOINTS.COMMON,
            commonParams("S|ORDER.ORDER_GOODS_S", params)
        );
    },

    saveOrder: (params: OrderUReq) => {
        return beaconApi.post<OrderUReq, any>(
            ENDPOINTS.SAVE_ORDER,
            commonParams("S|ORDER.ORDER_U2", params)
        );
    },
};

export { OrderService };
