import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import {API_URL} from '../../config';

const LoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const role = route.params?.role;

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password,
          role,
        }),
      });

      const data = await response.json();
      console.log('Login Response:', data);

      if (response.ok) {
        await AsyncStorage.setItem('token', String(data.token));
        await AsyncStorage.setItem('userId', String(data.user.id));
        await AsyncStorage.setItem('role', String(role));

        const targetRoute = role === 'jobSeeker' ? 'Home' : 'Home-R';

        navigation.reset({
          index: 0,
          routes: [
            {
              name: targetRoute,
              params: {
                user: data.user,
                token: data.token,
                userId: data.user.id,
              },
            },
          ],
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Please sign in to your registered account</Text>

      <TextInput
        placeholder="Username or Email"
        style={styles.input}
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          style={styles.passwordInput}
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon name={passwordVisible ? 'eye' : 'eye-slash'} size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>LOGIN</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
        <Text style={styles.forgotPassword}>
          Forgot your password? <Text style={styles.reset}>Reset here</Text>
        </Text>
      </TouchableOpacity>

  

      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => navigation.navigate('Register', { role })}
      >
        <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A1EFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#5A1EFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  reset: {
    color: '#5A1EFF',
    fontWeight: 'bold',
  },
  or: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 16,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 8,
    elevation: 2,
  },
  createAccountButton: {
    alignItems: 'center',
  },
  createAccountText: {
    color: '#5A1EFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LoginScreen;
