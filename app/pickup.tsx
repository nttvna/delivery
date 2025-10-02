import IconButton from '@/components/iconButton';
import { orderNode, OrderStatus } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { db } from '@/scripts/firebaseConfig';
import { router } from 'expo-router';
import { ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function PickupScreen() {
    const { currentOrder } = useAppSelector(state => state.System);
    const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
    const insets = useSafeAreaInsets(); // Get the safe area insets
    useEffect(() => {
        if (currentOrder) {
            setUserLocation({ latitude: currentOrder?.restaurantLat, longitude: currentOrder?.restaurantLng });
        }
    }, [currentOrder?.Id]);
    const doNotReady = () => {
        router.replace('/onfront');
    };
    const cancelpickup = () => {
        if (currentOrder) {
            const orderRef = ref(db, `${orderNode}/${currentOrder.Id}`);
            update(orderRef, {
                orderstatus: OrderStatus._CANCELPICKUP
            })
                .then(() => {
                    router.replace('/(tabs)');
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
    };
    const doPickup = () => {
        if (currentOrder) {
            const orderRef = ref(db, `${orderNode}/${currentOrder.Id}`);
            update(orderRef, {
                orderstatus: OrderStatus._ONWAY
            })
                .then(() => {
                    router.replace('/(tabs)');
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
    };
    return (
        <View style={styles.container}>
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
                }}>PICK UP ORDER</Text>

            </View>
            <View style={{ gap: 12, paddingHorizontal: 18 }}>
                <Text style={{ color: '#333', fontWeight: 'bold', paddingVertical: 18 }}>{currentOrder?.restaurantname}</Text>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                    <View style={{ width: 80 }}>
                        <Text style={{ color: '#333' }}>{'Customer:'}</Text>
                    </View>
                    <View style={{ flexGrow: 1, gap: 8 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{currentOrder?.customername}</Text>
                    </View>
                </View>
                <View style={{ gap: 8, flexDirection: 'row' }}>
                    <View style={{ width: 80 }}>
                        <Text style={{ color: '#333' }}>{'Order No:'}</Text>
                    </View>
                    <View style={{ flexGrow: 1, gap: 8 }}>
                        <Text style={{ color: '#333', fontWeight: 'bold' }}>{'#'}{currentOrder?.Id}</Text>
                    </View>
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
            </View>
            <View style={{
                flexDirection: 'row',
                gap: 18,
                marginTop: 24,
                paddingRight: 18,
                justifyContent: 'flex-end',
                width: '100%',
            }}>
                <IconButton
                    text='CANCEL PICKUP'
                    onPress={cancelpickup}
                    bgColor={'#fff'}
                    borderColor='#e5e5e5'
                    textColor='#333'
                    size='md'
                    width={140}
                />
                <IconButton
                    text='PICK UP'
                    onPress={doPickup}
                    bgColor={'#843535ff'}
                    borderColor='#e5e5e5'
                    size='md'
                    width={140}
                />
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 32 }}>
                <TouchableOpacity onPress={doNotReady}
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        width: '70%',
                        backgroundColor: '#333',
                        paddingVertical: 18,
                        marginBottom: 12
                    }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'ORDER NOT READY ?'}</Text>
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
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingLeft: 24,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5'
    },
});