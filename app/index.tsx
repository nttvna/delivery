// LoginScreen.js
import IconButton from '@/components/iconButton';
import InputWithIcon from '@/components/inputWithIcon';
import { mainColor } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { login } from '@/redux/systemSlice';
import { app, auth } from '@/scripts/firebaseConfig'; // Your Firebase app instance
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    getCredentials();
  }, []);
  const getCredentials = async () => {
    try {
      const email = await SecureStore.getItemAsync('userEmail');
      const password = await SecureStore.getItemAsync('userPassword');
      if (email && password) {
        setEmail(email);
        setPassword(password);
        await handleLoginCredentials(email, password);
      } else {
        console.log('No credentials found.');
      }
    } catch (error) {
      console.error('Failed to get credentials:', error);
    }
  }
  const handleLoginCredentials = async (userEmail: string, userPassword: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;
      // Access the UID here
      const uid = user.uid;
      dispatch(login({ userId: user.uid, token: 'abc12345' }));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign-in error:', error);
    }

  };
  const handleLogin = async () => {
    if (!email) {
      showToast('Please enter Email');
      return;
    }
    if (!password) {
      showToast('Please enter Password');
      return;
    }
    const auth = getAuth(app);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Access the UID here
      const uid = user.uid;
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userPassword', password);
      dispatch(login({ userId: user.uid, token: 'abc12345' }));
      router.replace('/(tabs)');
      // You can now navigate to another screen or update your app state
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };
  const updateEmail = (val: string) => {
    setError('');
    setEmail(val);
  };
  const updatePassword = (val: string) => {
    setError('');
    setPassword(val);
  };
  return (
    <View style={styles.container}>
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 4,
        marginBottom: 32
      }}>
        <Image source={require('@/assets/images/applogo.png')} style={{ width: 120, height: 120, borderRadius: 8 }} />
        <Text style={{ color: '#888' }}>Fast, easy, best price</Text>
      </View>
      <InputWithIcon
        inputValue={email}
        placeHolder='Email address...'
        icon='mail-outline'
        keyboardType='email-address'
        onChangeText={updateEmail}
      />
      <InputWithIcon
        inputValue={password}
        placeHolder='Password...'
        icon='key'
        keyboardType='password'
        onChangeText={updatePassword}
      />
      {error.length > 0 && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}
      <View style={{ marginTop: 12, justifyContent: 'center', alignItems: 'center' }}>
      </View>
      <IconButton
        text='LOGIN'
        icon='login'
        onPress={handleLogin}
        bgColor={mainColor}
        size='md'
      />

      <View style={{ flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Text style={{ color: '#333', fontWeight: 'bold' }}>Copyright ©2019 Ring A Meal LLC. All rights reserved</Text>
        <Text style={{ color: mainColor }}>21.02.2019</Text>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Login;