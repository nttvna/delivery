import { orderNode, OrderNodeChild, OrderStatus } from '@/constants/systemconstant';
import { useAppSelector } from '@/redux/reduxhooks';
import { db } from '@/scripts/firebaseConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { equalTo, off, onChildAdded, orderByChild, query, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
const ModalNewOrder = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newOrder, setNewOrder] = useState(null);
    const { userId } = useAppSelector(state => state.System);
    useEffect(() => {
        const ordersRef = query(
            ref(db, orderNode),
            orderByChild(OrderNodeChild._orderstatus),
            equalTo(OrderStatus._NEW)
        );
        // Listener for new orders
        const onNewOrder = onChildAdded(ordersRef, (snapshot) => {
            const orderData = snapshot.val();
            setNewOrder(orderData);
            console.log('orderData');
            console.log(orderData);
            setModalVisible(true);
            // Optional: Clean up the listener after the first new order to prevent multiple triggers
            // off(ordersRef, 'child_added', onNewOrder);
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
                    <View style={styles.modalHeader}>
                        <MaterialIcons size={25} name={'article'} color={'#333'} />
                        <Text style={{
                            color: '#333',
                            fontWeight: 'bold',
                        }}>NEW ORDER</Text>
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
