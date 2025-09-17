import { ToastType } from "@/constants/systemconstant";
import Toast from "react-native-toast-message";

export function showToast(content: string, type: ToastType = ToastType._error) {
    Toast.show({
        type: type,
        text1: content,
        visibilityTime: 4000
    });
};