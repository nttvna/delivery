import { MapLocation } from "./apimodel";

export interface NewOrderModel {
    Id: string;
    customeraddress: string;
    customername: string;
    customerphone: string;
    deliveryLat: number;
    deliveryLng: number;
    fee: number;
    feeForDeliver: number;
    instructionsDeliver: string;
    instructionsRes: string;
    orderTime: string;
    orderType: string;
    orderstatus: string;
    restaurantLat: number;
    restaurantLng: number;
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