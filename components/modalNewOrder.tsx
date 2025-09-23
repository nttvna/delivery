import { orderNode, OrderNodeChild, OrderStatus } from '@/constants/systemconstant';
import { NewOrderModel } from '@/models/reduxmodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { addOrder } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import { equalTo, off, onChildAdded, orderByChild, query, ref } from 'firebase/database';
import { getDistance } from 'geolib';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
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
                console.log(orderData);
                const { restaurantLat, restaurantLng } = orderData;
                setNewOrder(orderData);
                const destination = {
                    latitude: restaurantLat,
                    longitude: restaurantLng,
                };
                console.log('destination');
                console.log(destination);
                const distInMeters = getDistance(
                    { latitude: driverLat, longitude: driverLng },
                    destination
                );
                const distInMiles = (distInMeters / 1609.34).toFixed(2); // 1609.34 meters per mile
                setDistance(distInMiles);
                dispatch(addOrder({ deliveryLat: orderData.deliveryLat, deliveryLng: orderData.deliveryLng, orderId: orderData.uid }));
                setModalVisible(true);
            }
        });

        // Clean up the listener when the component unmounts
        return () => {
            off(ordersRef, 'child_added', onNewOrder);
        };
    }, [userId]);
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
                            }}>Restaurant:</Text>
                        </View>
                        <View style={styles.columnright}>

                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.columnleft}>
                            <Text style={{
                                color: '#333',
                            }}>Restaurant:</Text>
                        </View>
                        <View style={styles.columnright}>

                        </View>
                    </View>
                </View>
            </View>
        </Modal>);
};
export default ModalNewOrder;

const styles = StyleSheet.create({
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
});
