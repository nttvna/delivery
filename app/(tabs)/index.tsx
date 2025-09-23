import { driverNode, DriverNodeChild, mainColor } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { useAppSelector } from '@/redux/reduxhooks';
import { db } from '@/scripts/firebaseConfig';
import * as Location from 'expo-location';
import { get, ref, update } from "firebase/database";
import { getDistance } from 'geolib';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type LocationObject = {
  latitude: number;
  longitude: number;
};
const MapScreen = () => {
  const { userId, currentOrder } = useAppSelector(state => state.System);
  const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
  const insets = useSafeAreaInsets(); // Get the safe area insets
  const [userStatus, setUserStatus] = useState<boolean | null>(null);
  const [distance, setDistance] = useState<string>('');
  useEffect(() => {
    (async () => {
      if (userId) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showToast('Permission to access location was denied');
          return;
        }
        // Get initial location
        let initialLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = initialLocation.coords;
        setUserLocation({ latitude, longitude });

        if (currentOrder) {
          const { restaurantLat, restaurantLng } = currentOrder;
          const destination = {
            latitude: restaurantLat,
            longitude: restaurantLng,
          };
          console.log('destination');
          console.log(destination);
          const distInMeters = getDistance(
            { latitude, longitude },
            destination
          );
          const distInMiles = (distInMeters / 1609.34).toFixed(2); // 1609.34 meters per mile
          setDistance(distInMiles);
        }

      }

    })();
  }, [userId]);
  useEffect(() => {
    const fetchWorkStatus = async () => {
      try {
        const workStatusRef = ref(db, `${driverNode}/${userId}/${DriverNodeChild._workstatus}`);
        const snapshot = await get(workStatusRef);
        if (snapshot.exists()) {
          const status = snapshot.val();
          setUserStatus(status);
          console.log("Work status fetched:", status);
        } else {
          console.log("No work status available for this order.");
          setUserStatus(false);
        }
      } catch (error) {
        console.error("Error fetching work status:", error);
        setUserStatus(false);
      }
    };

    fetchWorkStatus();
  }, [userId, db]); // Reruns the effect if orderId or db changes

  const toggleSwitch = () => {
    if (userStatus !== null) {
      const driverRef = ref(db, `${driverNode}/${userId}`);
      const newval: boolean = !userStatus;
      update(driverRef, {
        workstatus: newval
      })
        .then(() => {
          setUserStatus(newval);
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
        }}>Home</Text>
        <View style={{ flexGrow: 1, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#fff' }}>{userStatus ? 'Online' : 'Offline'}</Text>
          <Switch
            onValueChange={toggleSwitch}
            value={userStatus ?? false}
            trackColor={{ false: '#767577', true: mainColor }}
            thumbColor={userStatus ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor={'#3e3e3e'}
          />
        </View>
      </View>

      {/* Map View */}
      {userLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {distance && currentOrder && (
            <>
              <Marker coordinate={userLocation} title="Your Location" />
              <Marker coordinate={{ latitude: currentOrder.restaurantLat, longitude: currentOrder.restaurantLng }} title="Destination" pinColor="blue" />
              <Polyline
                coordinates={[userLocation, { latitude: currentOrder.restaurantLat, longitude: currentOrder.restaurantLng }]}
                strokeColor="#000"
                strokeWidth={4}
              />
            </>
          )}

        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{'Loading map...'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;