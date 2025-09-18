import { mainColor } from '@/constants/systemconstant';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const insets = useSafeAreaInsets(); // Get the safe area insets

  useEffect(() => {
    // Location fetching code remains the same
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const toggleSwitch = () => setIsSwitchEnabled(previousState => !previousState);

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
          <Text style={{ color: '#fff' }}>{isSwitchEnabled ? 'Online' : 'Offline'}</Text>
          <Switch
            onValueChange={toggleSwitch}
            value={isSwitchEnabled}
            trackColor={{ false: '#767577', true: mainColor }}
            thumbColor={isSwitchEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor={'#3e3e3e'}
          />
        </View>
      </View>

      {/* Map View */}
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text>{errorMsg || 'Waiting for location...'}</Text>
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