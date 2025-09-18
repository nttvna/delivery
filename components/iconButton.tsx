import { MaterialIconsName } from "@/models/systemtype";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FC } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface Props {
    icon?: MaterialIconsName;
    text: string;
    bgColor: string;
    onPress: () => void,
    isLoading: boolean;
    width?: number;
    height?: number;
    size: 'md' | 'sm';
    textColor?: string;
    iconColor?: string;
    iconSize?: number;
    paddingHorrizal?: number;
    borderColor?: string;
}
const IconButton: FC<Props> = ({
    icon,
    text,
    bgColor,
    onPress,
    isLoading = false,
    width,
    height,
    size,
    textColor,
    iconColor,
    iconSize,
    paddingHorrizal,
    borderColor
}) => {
    if (isLoading) {
        return (
            <View style={[styles.wrpButton, {
                paddingHorizontal: paddingHorrizal ?? 12,
                gap: 8,
                height: height ?? (size === 'md' ? 50 : 35),
                backgroundColor: bgColor,
                ...(borderColor ? { borderWidth: 1, borderColor: borderColor } : {}),
                ...(width ? { width: width } : {})
            }]}>
                <ActivityIndicator size={'small'} color={textColor ?? '#fff'} />
                <Text style={{ color: textColor ?? '#fff' }}>Please wait...</Text>
            </View>
        );
    }
    return (
        <TouchableOpacity onPress={onPress}
            style={[styles.wrpButton, {
                paddingHorizontal: paddingHorrizal ?? 12,
                height: height ?? (size === 'md' ? 50 : 35),
                backgroundColor: bgColor,
                ...(borderColor ? { borderWidth: 1, borderColor: borderColor } : {}),
                ...(width ? { width: width } : {}),
                ...(text.length > 0 ? { gap: 8 } : {})
            }]}>
            {icon && <MaterialIcons size={iconSize ?? 20} name={icon} color={iconColor ?? '#fff'} />}
            {text && text.length > 0 && <Text style={{ color: textColor ?? '#fff' }}>{text}</Text>}
        </TouchableOpacity>
    );
};
export default IconButton;
const styles = StyleSheet.create({
    wrpButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4

    },
});
