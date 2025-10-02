import IconButton from '@/components/iconButton';
import { googleRouteUrl, LATITUDE_DELTA, OnFrontDistance, orderNode, OrderStatus } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { addOrder } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
export default function OnWayScreen() {
    const { currentOrder, driverLat, driverLng } = useAppSelector(state => state.System);
    const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
    const insets = useSafeAreaInsets(); // Get the safe area insets
    const [polylineCoordinates, setPolylineCoordinates] = useState<MapLocation[]>([]);
    const [error, setError] = useState<string>('');
    const { width, height } = Dimensions.get('window');
    const ASPECT_RATIO = width / height;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    const dispatch = useDispatch();
    useEffect(() => {
        if (driverLat && driverLng) {
            setUserLocation({ latitude: driverLat, longitude: driverLng });
        }
    }, [driverLat, driverLng]);
    useEffect(() => {
        if (userLocation && !isFetchingLocation) {
            fetchDirections();
        }
    }, [userLocation?.latitude, userLocation?.longitude]);
    useEffect(() => {
        if (currentOrder?.distance && currentOrder?.distance <= OnFrontDistance) {
            setOnFront();
        }
    }, [currentOrder?.distance]);
    const fetchDirections = async () => {
        if (!userLocation || !currentOrder) {
            return;
        }
        setIsFetchingLocation(true);
        setError('');
        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const destinationLatLng = `${currentOrder.restaurantLat},${currentOrder.restaurantLng}`;

        // Construct the API URL for directions
        const url = googleRouteUrl(origin, destinationLatLng);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                setError('Failed to fetch route. Please check your network or API key.');
                setIsFetchingLocation(false);
                return;
            }
            const data = await response.json();
            if (data && data.routes && data.routes.length > 0) {
                if (data.routes[0].legs && data.routes[0].legs.length > 0) {
                    const firstLeg = data.routes[0].legs[0];
                    const distanceInMiles = parseFloat(firstLeg.distance.text.replace(' mi', ''));
                    dispatch(addOrder({
                        order: {
                            ...currentOrder,
                            distance: distanceInMiles,
                            duration: firstLeg.duration.text ?? ''
                        }
                    }));
                    const points = polyline.decode(data.routes[0].overview_polyline.points);
                    const routeCoordinates = points.map(point => ({
                        latitude: point[0],
                        longitude: point[1],
                    }));
                    setPolylineCoordinates(routeCoordinates);
                }
                else {
                    const points = polyline.decode(data.routes[0].overview_polyline.points);
                    const routeCoordinates = points.map(point => ({
                        latitude: point[0],
                        longitude: point[1],
                    }));
                    setPolylineCoordinates(routeCoordinates);
                }
            } else {
                setError('No routes found.');
            }
        } catch (err) {
            console.log(err);
            setError('Failed to fetch route. Please check your network or API key.');
        } finally {
            setIsFetchingLocation(false);
        };
    };
    const makeCall = () => {
        // Ensure the phone number is properly formatted (e.g., no spaces or dashes)
        const url = `tel:${currentOrder?.restaurantphone}`;

        // Open the phone app with the number pre-filled
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };
    const setOnFront = () => {
        if (currentOrder) {
            const orderRef = ref(db, `${orderNode}/${currentOrder.Id}`);
            update(orderRef, {
                orderstatus: OrderStatus._ONFRONT
            })
                .then(() => {
                    router.replace('/onfront');
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
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
                }}>ON WAY</Text>

            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32, paddingHorizontal: 15, paddingVertical: 10 }}>
                <View style={{ flexGrow: 1, gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantname}</Text>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantshortaddress}</Text>
                </View>
                <View style={{ gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.distance}{' mi'}</Text>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.duration}</Text>
                </View>
                <MaterialIcons name={'alt-route'} size={40} color="#333" />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {userLocation && currentOrder && <MapView
                style={styles.map}
                initialRegion={{
                    latitude: (userLocation.latitude + currentOrder.restaurantLat) / 2,
                    longitude: (userLocation.longitude + currentOrder.restaurantLng) / 2,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }}
                showsUserLocation={false}
            >
                <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} title={'You are here'} pinColor="blue" >
                    <MaterialIcons name={'directions-car-filled'} size={40} color="#e9220cff" />
                </Marker>
                <Marker coordinate={{ latitude: currentOrder.restaurantLat, longitude: currentOrder.restaurantLng }} title={currentOrder.restaurantname} pinColor="blue" >
                    <MaterialIcons name={'storefront'} size={40} color="#e9220cff" />
                </Marker>
                {polylineCoordinates.length > 0 && (
                    <Polyline
                        coordinates={polylineCoordinates}
                        strokeColor="#0891b2"
                        strokeWidth={5}
                        lineCap="round"
                    />
                )}
            </MapView>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 16 }}>
                <View style={{ flexGrow: 1, gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantname}</Text>
                    <Text style={{ color: '#333', fontSize: 16 }}>{currentOrder?.restaurantphone}</Text>
                </View>
                <IconButton
                    text=''
                    icon='phone'
                    onPress={setOnFront}
                    bgColor={'transparent'}
                    size='md'
                    width={80}
                    iconSize={40}
                    iconColor='#333'
                />
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