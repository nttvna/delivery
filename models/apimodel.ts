export interface apiResponse {
    statusCode: number;
    messageCode: string;
    result: DeliverUserProfile[]
}
export interface loginResponse extends apiResponse {
    result: DeliverUserProfile[]
}
export interface DeliverUserProfile {
    Id: number;
    UserId: string;
    FullName: string;
    Phone: string;
    Email: string;
}