import { ToastType } from "@/constants/systemconstant";
import Toast from "react-native-toast-message";

export function showToast(content: string, type: ToastType = ToastType._error) {
    Toast.show({
        type: type,
        text1: content,
        visibilityTime: 4000
    });
};
export function formatMoney(amount: number | undefined) {
    if (!amount) amount = 0;
    try {
        const formatter = new Intl.NumberFormat('en-Us', {
            style: 'currency',
            currency: 'USD'
        });
        return formatter.format(amount);
    } catch (error) {

    }
    return amount.toFixed(2);
};