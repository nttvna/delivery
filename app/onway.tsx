import { googleRouteUrl } from '@/constants/systemconstant';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { addOrder } from '@/redux/systemSlice';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
export default function OnWayScreen() {
    const { currentOrder, driverLat, driverLng } = useAppSelector(state => state.System);
    const insets = useSafeAreaInsets(); // Get the safe area insets
    const [polylineCoordinates, setPolylineCoordinates] = useState<MapLocation[]>([]);
    const [error, setError] = useState<string>('');
    const dispatch = useDispatch();
    useEffect(() => {
        if (driverLat && driverLng) {
            fetchDirections();
        }
    }, [currentOrder?.Id, driverLat, driverLng]);
    const fetchDirections = async () => {
        if (!currentOrder) {
            setError('Missing location data');
            return;
        }
        setError('');
        const origin = `${driverLat},${driverLng}`;
        const destinationLatLng = `${currentOrder.restaurantLat},${currentOrder.restaurantLng}`;

        // Construct the API URL for directions
        const url = googleRouteUrl(origin, destinationLatLng);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                setError('Failed to fetch route. Please check your network or API key.');
                return;
            }
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                if (data.routes[0].legs && data.routes[0].legs.length > 0) {
                    const firstLeg = data.routes[0].legs[0];
                    dispatch(addOrder({
                        order: {
                            ...currentOrder,
                            distance: firstLeg.distance.text ?? '',
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
            setError('Failed to fetch route. Please check your network or API key.');
        };
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 10 }}>
                <View style={{ flexGrow: 1, gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantname}</Text>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.restaurantshortaddress}</Text>
                </View>
                <MaterialIcons name={'alt-route'} size={40} color="#333" />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {driverLat && driverLng && <MapView
                style={styles.map}
                initialRegion={{
                    latitude: driverLat,
                    longitude: driverLng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >
                <Marker coordinate={{ latitude: driverLat, longitude: driverLng }} title={'You are here'} pinColor="blue" >
                    <MaterialIcons name={'directions-car-filled'} size={40} color="#e9220cff" />
                </Marker>
                {currentOrder && (
                    <>
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
                    </>
                )}

            </MapView>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 16 }}>
                <View style={{ flexGrow: 1, gap: 8 }}>
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>{'DELIVERY'}</Text>
                    <Text style={{ color: '#333' }}>{currentOrder?.restaurantname}</Text>
                </View>
                <MaterialIcons name={'phone'} size={40} color="#333" />
            </View>
        </View>
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