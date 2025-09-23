import { driverNode } from '@/constants/systemconstant';
import { useAppSelector } from '@/redux/reduxhooks';
import { updateDriverLocation } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import * as Location from 'expo-location';
import { ref, update } from "firebase/database";
import { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { showToast } from './common';
export const LoctionProvier = ({ children }: any) => {
    const { userId } = useAppSelector(state => state.System);
    const userRef = ref(db, `${driverNode}/${userId}`);
    const dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            if (userId) {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    showToast('Permission to access location was denied');
                    return;
                }
                const subscriber = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        distanceInterval: 5, // Update every 5 meters
                    },
                    (newLocation) => {
                        const { latitude, longitude } = newLocation.coords;
                        updateLocation(latitude, longitude);
                        dispatch(updateDriverLocation({ driverLat: latitude, driverLng: longitude }));
                    }
                );

                // Clean up the subscription
                return () => {
                    if (subscriber) {
                        subscriber.remove();
                    }
                };
            }

        })();
    }, [userId]);
    const updateLocation = (lat: number, long: number) => {
        update(userRef, {
            lat: lat.toFixed(6),
            lng: long.toFixed(6)
        })
            .then(() => {
                console.log('position updated');
            })
            .catch((error) => {
                console.log("position update failed:");
            });
    };
    return children;
}