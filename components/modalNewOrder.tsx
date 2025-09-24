import { orderNode, OrderNodeChild, OrderStatus } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { NewOrderModel, OrderDetail } from '@/models/reduxmodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { addOrder, clearOrder } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import { equalTo, off, onChildAdded, orderByChild, query, ref, update } from 'firebase/database';
import { getDistance } from 'geolib';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import IconButton from './iconButton';
const ModalNewOrder = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newOrder, setNewOrder] = useState<NewOrderModel | null>(null);
    const { userId, driverLat, driverLng } = useAppSelector(state => state.System);
    const [distance, setDistance] = useState<string>('');
    const dispatch = useDispatch();
    useEffect(() => {
        const ordersRef = query(
            ref(db, orderNode),
            orderByChild(OrderNodeChild._orderstatus),
            equalTo(OrderStatus._NEW)
        );
        // Listener for new orders
        const onNewOrder = onChildAdded(ordersRef, (snapshot) => {
            const orderData = snapshot.val();
            if (orderData.assignforuserid = userId) {
                const { restaurantLat, restaurantLng, ordertextinfoforapp } = orderData;
                let orderInfoForApp: OrderDetail | null = null;

                try {
                    orderInfoForApp = JSON.parse(ordertextinfoforapp.replace(/'/g, '"'));
                } catch (e) {
                    console.error("Failed to parse ordertextinfoforapp:", e);
                }
                const orderObject = {
                    ...orderData,
                    Id: orderData.uid,
                    ordertextinfoforappObject: orderInfoForApp
                };
                console.log('orderObject');
                console.log(orderObject);
                setNewOrder(orderObject);
                const destinationRestaurant = {
                    latitude: restaurantLat,
                    longitude: restaurantLng,
                };
                const distDriverToRestaurantInMeters = getDistance(
                    { latitude: driverLat, longitude: driverLng },
                    destinationRestaurant
                );
                const distInMiles = ((distDriverToRestaurantInMeters) / 1609.34).toFixed(2); // 1609.34 meters per mile
                setDistance(distInMiles);
                setModalVisible(true);
            }
        });
        // Clean up the listener when the component unmounts
        return () => {
            off(ordersRef, 'child_added', onNewOrder);
        };
    }, [userId]);
    const acceptOrder = () => {
        if (newOrder) {
            const orderRef = ref(db, `${orderNode}/${newOrder.Id}`);
            update(orderRef, {
                orderstatus: OrderStatus._ACCEPT
            })
                .then(() => {
                    dispatch(addOrder({ order: newOrder }));
                    setModalVisible(false);
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
    };
    const cancelOrder = () => {
        if (newOrder) {
            const orderRef = ref(db, `${orderNode}/${newOrder.Id}`);
            update(orderRef, {
                assignforuserid: ''
            })
                .then(() => {
                    dispatch(clearOrder(undefined));
                    setModalVisible(false);
                })
                .catch((error) => {
                    showToast("update failed");
                });
        }
    };
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.row}>
                        <View style={styles.columnleft}>
                            <Text style={{
                                color: '#333',
                            }}> {distance}{' mi'}</Text>
                        </View>
                        <View style={styles.columnright}>
                            {newOrder?.ordertextinfoforappObject?.Total}
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
                                        {item.AdditionalInfo && <Text style={{
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
                    <View style={{ flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <IconButton
                            text='NO, THANKS'
                            onPress={cancelOrder}
                            bgColor={'#fff'}
                            borderColor='#e5e5e5'
                            size='md'
                        />
                        <IconButton
                            text='ACCEPT'
                            onPress={acceptOrder}
                            bgColor={'#fff'}
                            borderColor='#e5e5e5'
                            size='md'
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
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    modalHeader: { borderBottomColor: '#e5e5e5', borderBottomWidth: 1, paddingBottom: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', alignItems: 'center' },
    columnleft: {
        width: 150
    },
    columnright: {
        flexGrow: 1
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
