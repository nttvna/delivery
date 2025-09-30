import IconButton from '@/components/iconButton';
import { LATITUDE_DELTA, LONGITUDE_DEFAULT } from '@/constants/systemconstant';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function OnFrontScreen() {
    const { currentOrder } = useAppSelector(state => state.System);
    const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
    const insets = useSafeAreaInsets(); // Get the safe area insets
    useEffect(() => {
        if (currentOrder) {
            setUserLocation({ latitude: currentOrder?.restaurantLat, longitude: currentOrder?.restaurantLng });
        }
    }, [currentOrder?.Id]);
    const makeCall = () => {
        // Ensure the phone number is properly formatted (e.g., no spaces or dashes)
        const url = `tel:${currentOrder?.restaurantphone}`;

        // Open the phone app with the number pre-filled
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };
    return (
        <View style={styles.container}>
            {/* Header View with dynamic top padding */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 10,
                backgroundColor: 'green',
                paddingTop: insets.top
            }}>
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                }}>ON FRONT</Text>

            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32, paddingHorizontal: 15, paddingVertical: 10 }}>
                <View style={{ flexGrow: 1, gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantname}</Text>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantshortaddress}</Text>
                </View>
                <MaterialIcons name={'alt-route'} size={40} color="#333" />
            </View>
            {userLocation && <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DEFAULT,
                }}
            >
                <Marker coordinate={{ latitude: userLocation?.latitude, longitude: userLocation?.longitude }} title={currentOrder?.restaurantname} pinColor="blue" >
                    <View style={{ gap: 8 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{'ON FRONT'}</Text>
                        <MaterialIcons name={'storefront'} size={40} color="#e9220cff" />
                    </View>
                </Marker>
            </MapView>}
            <View style={{ gap: 16, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 16, alignItems: 'center' }}>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                    {currentOrder?.instructionsDeliver ? <View style={{ flexGrow: 1, gap: 8 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{'Pick up instruction'}</Text>
                        <Text style={{ color: '#333' }}>{currentOrder?.instructionsDeliver}</Text>
                    </View>
                        :
                        <View style={{ flexGrow: 1, gap: 8 }}>
                            <Text style={{ color: '#333', fontWeight: 'bold' }}>{'DELIVERY'}</Text>
                            <Text style={{ color: '#333', fontSize: 16 }}>{currentOrder?.restaurantname}</Text>
                        </View>
                    }
                    <IconButton
                        text=''
                        icon='phone'
                        onPress={makeCall}
                        bgColor={'transparent'}
                        size='sm'
                        width={80}
                        iconSize={40}
                        iconColor='#333'
                    />
                </View>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                    <View style={{ flexGrow: 1 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{'CONFIRM ORDER'}</Text>
                    </View>
                    <IconButton
                        text=''
                        icon='list-alt'
                        onPress={makeCall}
                        bgColor={'transparent'}
                        size='sm'
                        width={80}
                        iconSize={40}
                        iconColor='#3c8dbc'
                    />
                </View>
                <TouchableOpacity onPress={makeCall}
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        width: '80%',
                        backgroundColor: '#c4c7c5',
                        paddingVertical: 18,
                        marginBottom: 12
                    }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'CONFIRM ORDER'}</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#fff'
    },
    container: {
        flex: 1,
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    map: {
        flex: 1,
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        zIndex: 1,
    },
    errorText: {
        position: 'absolute',
        top: '50%',
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 5,
        color: '#c0392b',
        fontWeight: 'bold',
    },
});