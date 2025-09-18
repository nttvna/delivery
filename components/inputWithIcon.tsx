import { MaterialIconsName } from '@/models/systemtype';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FC, useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
interface Props {
    icon?: MaterialIconsName;
    inputValue: string;
    placeHolder: string;
    keyboardType:
    | 'default'
    | 'numeric'
    | 'email-address'
    | 'number-pad'
    | 'phone-pad'
    | 'password';
    onChangeText: (val: string) => void,
    width?: number;
    height?: number;
}
const InputWithIcon: FC<Props> = ({
    icon,
    inputValue,
    placeHolder,
    keyboardType,
    onChangeText,
    width,
    height
}) => {
    const inputRef = useRef<TextInput>(null);
    const dynamicStyle = {
        ...(width && { width }),
        ...({ height: height ?? 50 }),
        ...(!icon && { paddingLeft: 8 }),
    };
    const clearContent = () => {
        onChangeText('');
        inputRef.current?.focus();
    }
    return (
        <View style={[styles.container, dynamicStyle]}>
            {icon && (<View style={styles.iconView}><MaterialIcons size={16} name={icon} color={'#0284c6'} /></View>)}
            <TextInput
                ref={inputRef}
                autoComplete='off'
                autoCorrect={false}
                onChangeText={onChangeText}
                value={inputValue}
                placeholder={placeHolder}
                keyboardType={keyboardType !== 'password' ? keyboardType : 'default'}
                secureTextEntry={keyboardType === 'password'}
                style={{ flexGrow: 1 }}
            />
            {inputValue && inputValue.length > 0 && <TouchableOpacity
                onPress={clearContent} style={styles.clearView}>
                <MaterialIcons size={20} name={'close'} color={'#333'} />
            </TouchableOpacity>}
        </View>
    );
};
export default InputWithIcon;
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    iconView: {
        paddingHorizontal: 8,
        justifyContent: 'center'
    },
    clearView: {
        position: 'relative',
        right: 5,
        padding: 4,
        justifyContent: 'center'
    },
});
