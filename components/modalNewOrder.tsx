import { googleRouteUrl, orderNode, OrderNodeChild, OrderStatus } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { NewOrderModel, OrderDetail } from '@/models/reduxmodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { addOrder, clearOrder, updatePolyline } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import polyline from '@mapbox/polyline';
import { useAudioPlayer } from 'expo-audio'; // Corrected import
import { router } from 'expo-router';
import { equalTo, off, onChildAdded, orderByChild, query, ref, update } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import IconButton from './iconButton';
const audioSource = require('@/assets/audio/notification.mp3');
const ModalNewOrder = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newOrder, setNewOrder] = useState<NewOrderModel | null>(null);
    const { userId, driverLat, driverLng, currentOrder } = useAppSelector(state => state.System);
    const dispatch = useDispatch();
    const player = useAudioPlayer(audioSource);
    const playSound = () => {
        console.log('Playing Sound...');
        try {
            player.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };
    useEffect(() => {
        const ordersRef = query(
            ref(db, orderNode),
            orderByChild(OrderNodeChild._orderstatus),
            equalTo(OrderStatus._NEW)
        );
        // Listener for new orders
        const onNewOrder = onChildAdded(ordersRef, async (snapshot) => {
            const orderData = snapshot.val();
            if (orderData.assignforuserid = userId) {
                const { ordertextinfoforapp } = orderData;
                let orderInfoForApp: OrderDetail | null = null;

                try {
                    orderInfoForApp = JSON.parse(ordertextinfoforapp.replace(/'/g, '"'));
                } catch (e) {
                    console.error("Failed to parse ordertextinfoforapp:", e);
                }
                const nodeId = snapshot.key;
                const orderObject = {
                    ...orderData,
                    Id: nodeId,
                    ordertextinfoforappObject: orderInfoForApp,
                    distance: 0,
                    duration: ''
                };
                setNewOrder(orderObject);
            }
        });
        // Clean up the listener when the component unmounts
        return () => {
            off(ordersRef, 'child_added', onNewOrder);
        };
    }, [userId]);
    useEffect(() => {
        if (newOrder && newOrder.restaurantLat && newOrder.restaurantLng) {
            getDirections(newOrder.restaurantLat, newOrder.restaurantLng);
        }
    }, [newOrder?.Id]);
    useEffect(() => {
        if (!currentOrder && newOrder && newOrder.distance && newOrder.duration) {
            dispatch(addOrder({ order: newOrder }));
            playSound();
            setModalVisible(true);
        }
    }, [currentOrder, newOrder?.distance, newOrder?.duration]);
    const getDirections = async (restaurantLat: number, restaurantLng: number) => {
        const origin = `${driverLat},${driverLng}`;
        const destinationLatLng = `${restaurantLat},${restaurantLng}`;
        // Construct the API URL using the provided variables
        const url = googleRouteUrl(origin, destinationLatLng);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            if (data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
                const firstLeg = data.routes[0].legs[0];
                const distanceInMiles = parseFloat(firstLeg.distance.text.replace(' mi', ''));
                const points = polyline.decode(data.routes[0].overview_polyline.points);
                const routeCoordinates = points.map(point => ({
                    latitude: point[0],
                    longitude: point[1],
                }));
                dispatch(updatePolyline({ polylineCoordinates: routeCoordinates }));
                setNewOrder(prevState => {
                    if (prevState === null) return null;
                    return {
                        ...prevState,
                        distance: distanceInMiles,
                        duration: firstLeg.duration.text ?? ''
                    };
                });

            } else {
                setNewOrder(prevState => {
                    if (prevState === null) return null;
                    return {
                        ...prevState,
                        distance: 0,
                        duration: 'N/A'
                    };
                });
            }

        } catch (err: any) {
            console.error('API call failed:', err);
        }
    };
    const acceptOrder = () => {
        if (newOrder) {
            const orderRef = ref(db, `${orderNode}/${newOrder.Id}`);
            update(orderRef, {
                orderstatus: OrderStatus._ACCEPT,
                assignforuserid: userId
            })
                .then(() => {
                    setModalVisible(false);
                    router.replace('/onway');
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
    };
    const cancelOrder = () => {
        if (newOrder) {
            dispatch(clearOrder(undefined));
            setModalVisible(false);
        }
    };
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.row}>
                        <View style={styles.columnleft}>
                            <Text style={{
                                color: '#333',
                            }}>{newOrder?.distance}{' mi'}</Text>
                        </View>
                        <View style={styles.columnright}>
                            <Text style={{
                                color: '#333',
                            }}>{newOrder?.duration}</Text>

                        </View>
                    </View>
                    {newOrder && newOrder.ordertextinfoforappObject && (
                        <>
                            {newOrder.ordertextinfoforappObject.Items.map((item, index) => (
                                <View style={styles.itemContainer} key={index}>
                                    <Text style={{
                                        color: '#333'
                                    }}>{item.Quantity}{' x '}</Text>
                                    <View style={{ flexGrow: 1 }}>
                                        <View>
                                            <Text style={{
                                                color: '#333'
                                            }}>{item.Name}</Text>
                                        </View>
                                        {item.AdditionalInfo && item.AdditionalInfo !== '' && <Text style={{
                                            color: '#333'
                                        }}>{item.AdditionalInfo}</Text>}
                                    </View>
                                </View>
                            ))}
                            <View style={styles.totalRow}>
                                <View style={styles.totalLeft}>
                                    <Text style={styles.labelSummaryText}>Sub Total:</Text>
                                </View>
                                <View style={styles.totalRight}>
                                    <Text style={styles.summaryText}>{newOrder.ordertextinfoforappObject.SubTotal}</Text>
                                </View>
                            </View>
                            <View style={styles.totalRow}>
                                <View style={styles.totalLeft}>
                                    <Text style={styles.labelSummaryText}>Tax:</Text>
                                </View>
                                <View style={styles.totalRight}>
                                    <Text style={styles.summaryText}>{newOrder.ordertextinfoforappObject.Tax}</Text>
                                </View>
                            </View>
                            {newOrder.ordertextinfoforappObject.Promotion && <View style={styles.totalRow}>
                                <View style={styles.totalLeft}>
                                    <Text style={styles.labelSummaryText}>Promotion:</Text>
                                </View>
                                <View style={styles.totalRight}>
                                    <Text style={styles.summaryText}>{newOrder.ordertextinfoforappObject.Promotion}</Text>
                                </View>
                            </View>}
                            <View style={styles.totalRow}>
                                <View style={styles.totalLeft}>
                                    <Text style={styles.labelSummaryText}>Total:</Text>
                                </View>
                                <View style={styles.totalRight}>
                                    <Text style={styles.summaryText}>{newOrder.ordertextinfoforappObject.Total}</Text>
                                </View>
                            </View>
                        </>
                    )}
                    <View style={{
                        flexDirection: 'row',
                        gap: 12,
                        marginTop: 24,
                        justifyContent: 'flex-end',
                        width: '100%',
                    }}>
                        <IconButton
                            text='NO, THANKS'
                            onPress={cancelOrder}
                            bgColor={'#fff'}
                            borderColor='#e5e5e5'
                            textColor='#333'
                            size='md'
                            width={120}
                        />
                        <IconButton
                            text='ACCEPT'
                            onPress={acceptOrder}
                            bgColor={'#843535ff'}
                            borderColor='#e5e5e5'
                            size='md'
                            width={100}
                        />
                    </View>
                </View>
            </View>
        </Modal >);
};
export default ModalNewOrder;

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5'
    },
    labelSummaryText: {
        textAlign: 'right',
        color: '#333'
    },
    summaryText: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#333'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 50,
        backgroundColor: 'transparent', // Semi-transparent black overlay
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    modalHeader: { borderBottomColor: '#e5e5e5', borderBottomWidth: 1, paddingBottom: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    row: { flexDirection: 'row', paddingVertical: 8 },
    columnleft: {
        width: 150
    },
    columnright: {
        flexGrow: 1,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
    },
    totalLeft: {
        flexGrow: 1
    },
    totalRight: {
        width: 80
    }
});

