export const baseUrl: string = "https://d-api.ringameal.com";
export const AccessToken: string = "96dLWEp3Sdh4hwjX20CcirshXvI39mTSZ0o2llXNnDQ2fwqMsRu27K43";
export const mainColor: string = '#10b981'
export const enum ToastType {
    _error = 'error',
    _success = 'success',
    _info = 'info'
}
export const driverNode: string = 'delivers';
export const orderNode: string = 'orders';
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
    _ordertextinfoforapp = 'ordertextinfoforapp',
    _serviceFeeeForCustomer = 'serviceFeeeForCustomer',
    _serviceFeeeForCustomer = 'serviceFeeeForCustomer',
}
export const enum OrderStatus {
    _NEW = 'NEW',
    _PREPARE = 'PREPARE',
    _READY = 'READY',
    _FINISH = 'FINISH',
    _CANCELRESTAURANT = 'CANCELRESTAURANT',
    _CANCEL = 'CANCEL',
    _REFUSE = 'REFUSE',
}