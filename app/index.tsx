// LoginScreen.js
import { useLoginMutation } from '@/api/account';
import IconButton from '@/components/iconButton';
import InputWithIcon from '@/components/inputWithIcon';
import { mainColor } from '@/constants/systemconstant';
import { showToast } from '@/hooks/common';
import { login } from '@/redux/systemSlice';
import { app } from '@/scripts/firebaseConfig'; // Your Firebase app instance
import { router, useNavigation } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [doLogin, { isLoading, isSuccess, isError }] = useLoginMutation();
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
      console.log('User UID:', uid);
      dispatch(login({ user: user.uid, token: 'abc12345' }));
      router.replace('/(tabs)');
      // You can now navigate to another screen or update your app state
    } catch (error) {
      console.error('Sign-in error:', error);
      // Handle specific errors (e.g., wrong password, user not found)
    }
    /*  doLogin({ token: AccessToken, strUserId: 'vs3oeDY30MPD1cJmd0REDms205s1' })
       .unwrap()
       .then(response => {
         const { statusCode, messageCode, result } = response;
         console.log('data');
         console.log(statusCode);
         console.log(messageCode);
         console.log(result);
 
       })
       .catch(err => {
         console.log('err');
         console.log(err);
       });
     // Hardcoded credentials for this example
     if (email === 'admin' && password === '123') {
       navigation.navigate('Home');
     } else {
       Alert.alert('Login Failed', 'Invalid username or password.');
     } */
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
        icon='key-outline'
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
        icon='log-in-outline'
        onPress={handleLogin}
        bgColor={mainColor}
        isLoading={isLoading}
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