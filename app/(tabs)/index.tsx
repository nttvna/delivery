import { driverNode, mainColor } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { useAppSelector } from '@/redux/reduxhooks';
import { db } from '@/scripts/firebaseConfig';
import * as Location from 'expo-location';
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const MapScreen = () => {
  const { userId } = useAppSelector(state => state.System);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const insets = useSafeAreaInsets(); // Get the safe area insets
  const [userStatus, setUserStatus] = useState<boolean | null>(null);
  const userRef = ref(db, `${driverNode}/${userId}`); // The path to the user's data
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access location was denied');
        return;
      }

      // Get initial location
      let initialLocation = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(initialRegion);
      // Start watching for location updates
      const subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5, // Update every 5 meters
        },
        (newLocation) => {
          updateLocation(newLocation.coords.latitude, newLocation.coords.longitude);
        }
      );

      // Clean up the subscription
      return () => {
        if (subscriber) {
          subscriber.remove();
        }
      };
    })();
  }, []);
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
  // Use useEffect to set up the real-time listener for the user data
  useEffect(() => {
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        // Read the entire node's data
        const data = snapshot.val();
        const { workstatus } = data;
        setUserStatus(workstatus);
      } else {
        showToast("No data found for this user.");
      }
    }, (error) => {
      showToast("Firebase read error:");
    });

    // Return the unsubscribe function to clean up the listener
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount
  const toggleSwitch = () => {
    if (userStatus !== null) {
      // Call update() on the user's reference with the updates object
      const newval: boolean = !userStatus;
      update(userRef, {
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
      {region ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          followsUserLocation={true}
        />
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