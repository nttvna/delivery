import IconButton from '@/components/iconButton';
import { LATITUDE_DELTA, LONGITUDE_DEFAULT } from '@/constants/systemconstant';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function CameScreen() {
    const { currentOrder } = useAppSelector(state => state.System);
    const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
    const insets = useSafeAreaInsets(); // Get the safe area insets
    useEffect(() => {
        if (currentOrder) {
            setUserLocation({ latitude: currentOrder?.deliveryLat, longitude: currentOrder?.deliveryLng });
        }
    }, [currentOrder?.Id]);
    const makeCall = () => {
        // Ensure the phone number is properly formatted (e.g., no spaces or dashes)
        const url = `tel:${currentOrder?.customerphone}`;

        // Open the phone app with the number pre-filled
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };
    const doConfirm = () => {
        router.replace('/finish');
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
                }}>FINISH DELIVERY</Text>

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
                    <View style={styles.markerContainer}>
                        <Text style={{ color: '#333', backgroundColor: 'yellow' }}>{'FINISH'}</Text>
                        <MaterialIcons name={'storefront'} size={40} color="#e9220cff" />
                    </View>
                </Marker>
            </MapView>}
            <View style={{ gap: 16, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 16, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32, paddingHorizontal: 15, paddingVertical: 10 }}>
                    <View style={{ flexGrow: 1, gap: 8 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.customername}</Text>
                        <Text style={{ color: '#333' }}>{currentOrder?.customerphone}</Text>
                    </View>
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
                {currentOrder?.instructionsDeliver && <View style={{ gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{'Delivery instruction'}</Text>
                    <Text style={{ color: '#333' }}>{currentOrder?.instructionsDeliver}</Text>
                </View>}
                <View style={{ gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{'Restaurant'}</Text>
                    <Text style={{ color: '#333' }}>{currentOrder?.restaurantname}</Text>
                </View>
                {currentOrder && currentOrder.ordertextinfoforappObject && currentOrder.ordertextinfoforappObject.Items.map((item, index) => (
                    <View style={styles.itemContainer} key={index}>
                        <Text style={{
                            color: '#333',
                            fontWeight: 'bold'
                        }}>{item.Quantity}{' x '}</Text>
                        <View style={{ flexGrow: 1 }}>
                            <View>
                                <Text style={{
                                    color: '#333',
                                    fontWeight: 'bold'
                                }}>{item.Name}</Text>
                            </View>
                            {item.AdditionalInfo && item.AdditionalInfo !== '' && <Text style={{
                                color: '#333',
                                fontWeight: 'bold'
                            }}>{item.AdditionalInfo}</Text>}
                        </View>
                    </View>
                ))}
                <View style={{ gap: 8, flexDirection: 'row' }}>
                    <View style={{ flexGrow: 1 }}>
                        <Text style={{ color: '#3c8dbc', fontWeight: 'bold' }}>{'CONFIRM DELIVERY'}</Text>
                    </View>
                    <IconButton
                        text=''
                        icon='keyboard-double-arrow-right'
                        onPress={doConfirm}
                        bgColor={'transparent'}
                        size='sm'
                        width={80}
                        iconSize={40}
                        iconColor='#3c8dbc'
                    />
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        width: '70%',
                        backgroundColor: '#c4c7c5',
                        paddingVertical: 18,
                        marginBottom: 12
                    }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'FINISH'}</Text>
                </View>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        minWidth: 80,
        alignItems: 'center',
    },
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
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingLeft: 24,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5'
    },
});