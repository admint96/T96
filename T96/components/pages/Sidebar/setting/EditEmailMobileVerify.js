import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../../../config';

const EditEmailMobileVerify = ({ route, navigation }) => {
  const { type, currentValue, verified } = route.params;
  const [value, setValue] = useState(currentValue);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef([]);
   console.log('EditEmailMobileVerify mounted with type:', type, 'and currentValue:', currentValue);
  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verify/send-${type}-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: value }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('OTP Sent', `OTP sent to your ${type}`);
        setTimer(180);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (timer === 0) return;
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

const verifyOtp = async () => {
  const joinedOtp = otp.join('');
  if (joinedOtp.length !== 6) {
    Alert.alert('Error', 'Please enter a 6-digit OTP');
    return;
  }

  setLoading(true);
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Token being sent:', token);
       console.log('Verifying OTP:', joinedOtp, 'for', type, 'with value:', value);
    const res = await fetch(`${API_URL}/api/verify/verify-${type}-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ [type]: value, otp: joinedOtp }),
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);

    if (res.ok && data.success) {
      Alert.alert('Verified', `${type} successfully verified`);
      navigation.goBack();
    } else {
      Alert.alert('Invalid OTP', data.message || 'Verification failed');
    }
  } catch (err) {
    console.error('Verification error:', err);
    Alert.alert('Error', 'Network error');
  }
  setLoading(false);
};


  const handleOtpChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.label}>Edit {type === 'email' ? 'Email' : 'Mobile Number'}</Text>

      <View style={styles.rowInput}>
        <TextInput
          style={styles.inputInline}
          value={value}
          onChangeText={setValue}
          placeholder={type === 'email' ? 'Enter new email' : 'Enter phone number'}
          keyboardType={type === 'email' ? 'email-address' : 'phone-pad'}
        />
        <TouchableOpacity onPress={sendOtp} style={styles.otpButton} disabled={loading || timer > 0}>
          <Text style={styles.otpButtonText}>
            {timer > 0 ? `${Math.floor(timer / 60)}:${('0' + (timer % 60)).slice(-2)}` : 'Send OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.otpBoxContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={styles.otpInputBox}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={text => handleOtpChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity onPress={verifyOtp} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default EditEmailMobileVerify;

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff',
  },
  label: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 12,
  },
  rowInput: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  inputInline: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10, marginRight: 8,
  },
  otpButton: {
    backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10,
  },
  otpButtonText: {
    color: 'white', fontWeight: 'bold',
  },
  otpBoxContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20,
  },
  otpInputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 48,
    height: 48,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', textAlign: 'center',
  },
});
