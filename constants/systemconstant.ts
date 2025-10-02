export const baseUrl: string = "https://d-api.ringameal.com";
export const googleRouteUrl = (origin: string, destinationLatLng: string): string => `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destinationLatLng}&key=${GOOGLE_MAPS_API_KEY}&units=imperial&language=en`;
export const AccessToken: string = "96dLWEp3Sdh4hwjX20CcirshXvI39mTSZ0o2llXNnDQ2fwqMsRu27K43";
export const mainColor: string = '#10b981'
export const enum ToastType {
    _error = 'error',
    _success = 'success',
    _info = 'info'
}
export const LATITUDE_DELTA: number = 0.0922;
export const LONGITUDE_DEFAULT = 0.0421;
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBn3QNw0j5aVViWDmqzWDahtNhVFiIAJJg';
export const driverNode: string = 'delivers';
export const orderNode: string = 'orders';
export const OnFrontDistance: number = 0.0062;
export const enum DriverNodeChild {
    _workstatus = 'workstatus'
}
export const enum OrderNodeChild {
    _orderstatus = 'orderstatus',
    _restaurantName = 'restaurantname',
    _restaurantAddress = 'restaurantaddress',
    _restaurantPhone = 'restaurantphone',
    _orderTime = 'orderTime',
    _customerName = 'customername',
    _customerAddress = 'customeraddress',
    _customerPhone = 'customerphone',
    _deliveryLat = 'deliveryLat',
    _deliveryLng = 'deliveryLng',
    _deliverName = 'delivername',
    _deliveryTime = 'deliveryTime',
    _assignForUserid = 'assignforuserid',
    _instructionsRes = 'instructionsRes',
    _instructionsDeliver = 'instructionsDeliver',
    _infoFeedback = 'infofeedback',
    _ordertextinfoforapp = 'ordertextinfoforapp',
    _serviceFeeeForCustomer = 'serviceFeeeForCustomer',
    _tipForDeliverserviceFeeeForCustomer = 'tipForDeliver',
    _restaurantLat = 'restaurantLat',
    _restaurantLng = 'restaurantLng',
}
export const enum OrderStatus {
    _NEW = 'NEW',
    _PREPARE = 'PREPARE',
    _READY = 'READY',
    _FINISH = 'FINISH',
    _CANCELRESTAURANT = 'CANCELRESTAURANT',
    _CANCEL = 'CANCEL',
    _REFUSE = 'REFUSE',
    _ACCEPT = 'ACCEPT',
    _ONFRONT = 'ONFRONT',
    _CANCELPICKUP = 'CANCELPICKUP',
    _ONWAY = 'ONWAY',
    _CAME = 'CAME',
}
export const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};