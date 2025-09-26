import { LocationProvier } from '@/hooks/locationProvier';
import { store } from '@/redux/store';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
export default function RootLayout() {
  return (
    <Provider store={store}>
      <LocationProvier>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
        <Toast />
      </LocationProvier>
    </Provider>
  );
}