import { store } from '@/redux/store';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ title: 'Home' }} />
      </Stack>
      <Toast />
    </Provider>
  );
}