import { driverNode, DriverNodeChild, GOOGLE_MAPS_API_KEY, mainColor } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { MapLocation } from '@/models/apimodel';
import { useAppSelector } from '@/redux/reduxhooks';
import { updateWorkStatus } from '@/redux/systemSlice';
import { db } from '@/scripts/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import { get, ref, update } from "firebase/database";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
interface LocationObject {
  latitude: number;
  longitude: number;
  // Add any other properties your location object might have (e.g., 'timestamp', 'altitude')
}
const MapScreen = () => {
  const { userId, currentOrder, driverLat, driverLng, workstatus } = useAppSelector(state => state.System);
  const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
  const insets = useSafeAreaInsets(); // Get the safe area insets
  const [polylineCoordinates, setPolylineCoordinates] = useState<MapLocation[]>([]);
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (driverLat && driverLng) {
      setUserLocation({ latitude: driverLat, longitude: driverLng });
    }
    if (currentOrder && driverLat && driverLng) {
      fetchDirections();
    }

  }, [currentOrder, driverLat, driverLng]);
  useEffect(() => {
    const fetchWorkStatus = async () => {
      try {
        const workStatusRef = ref(db, `${driverNode}/${userId}/${DriverNodeChild._workstatus}`);
        const snapshot = await get(workStatusRef);
        if (snapshot.exists()) {
          const status = snapshot.val();
          dispatch(updateWorkStatus({ workstatus: status }));
        } else {
          setError("No work status available");
          dispatch(updateWorkStatus({ workstatus: false }));
        }
      } catch (error) {
        setError("Error fetching work status:");
        dispatch(updateWorkStatus({ workstatus: false }));
      }
    };

    fetchWorkStatus();
  }, [userId, db]); // Reruns the effect if orderId or db changes
  const fetchDirections = async () => {
    if (!userLocation || !currentOrder) {
      setError('Missing location data');
      return;
    }
    setError('');
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const destinationLatLng = `${currentOrder.restaurantLat},${currentOrder.restaurantLng}`;

    // Construct the API URL for directions
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destinationLatLng}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length > 0) {
        // Decode the polyline string from the API response
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoordinates = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setPolylineCoordinates(routeCoordinates);
      } else {
        setError('No routes found.');
      }
    } catch (err) {
      setError('Failed to fetch route. Please check your network or API key.');
    };
  };
  const toggleSwitch = () => {
    if (workstatus !== null) {
      const driverRef = ref(db, `${driverNode}/${userId}`);
      const newval: boolean = !workstatus;
      update(driverRef, {
        workstatus: newval
      })
        .then(() => {
          dispatch(updateWorkStatus({ workstatus: newval }));
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
          <Text style={{ color: '#fff' }}>{workstatus ? 'Online' : 'Offline'}</Text>
          <Switch
            onValueChange={toggleSwitch}
            value={workstatus ?? false}
            trackColor={{ false: '#767577', true: mainColor }}
            thumbColor={workstatus ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor={'#3e3e3e'}
          />
        </View>
      </View>
      {!userLocation && <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      </View>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {userLocation && <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} title={'You are here'} pinColor="blue" >
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

export default MapScreen;