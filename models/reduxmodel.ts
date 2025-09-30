import { MapLocation } from "./apimodel";

export interface NewOrderModel {
    Id: string;
    assignMode: number;
    assignforuserid: number;
    customeraddress: string;
    customeremail: string;
    customerid: number;
    customername: string;
    customerphone: string;
    deliverapprove: string;
    delivername: string;
    deliveryLat: number;
    deliveryLng: number;
    deliveryTime: string;
    distanceFromResToCus: string;
    durationFromResToCus: string;
    fee: number;
    feeForDeliver: number;
    infofeedback: string;
    instructionsDeliver: string;
    instructionsRes: string;
    orderTime: string;
    orderTimeOnServer: number;
    orderType: string;
    orderstatus: string;
    ordertextinfo: string;
    ordertextinfoforapp: string;
    ordertextinfofordeliver: string;
    paymentTypeId: number;
    restaurantId: number;
    restaurantLat: number;
    restaurantLng: number;
    restaurantaddress: string;
    restaurantname: string;
    restaurantphone: string;
    restaurantshortaddress: string;
    tipForDeliver: number;
    ordertextinfoforappObject: OrderDetail | null;
    distance: number;
    duration: string;
}
export interface OrderDetail {
    Items: Item[];
    SubTotal: string;
    Tax: string;
    Promotion: string;
    PromotionDetail: string;
    Total: string;
}
export interface Item {
    Name: string;
    AdditionalInfo: string;
    Quantity: number;
    Amount: string;
}
export interface SystemState {
    userId: string;
    driverLat: number | null;
    driverLng: number | null;
    currentOrder: NewOrderModel | null,
    workstatus: boolean;
    polylineCoordinates: MapLocation[];
}