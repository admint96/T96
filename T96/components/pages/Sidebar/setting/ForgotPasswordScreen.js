import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {API_URL} from '../../../../config';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('OTP Sent', 'Check your email for the OTP.');
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while sending OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp) return Alert.alert('Error', 'Enter the OTP');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('OTP Verified', 'You can now reset your password');
        setStep(3);
      } else {
        Alert.alert('Error', data.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while verifying OTP');
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all password fields');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Password reset successfully');
        navigation.goBack();

      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while resetting password');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.description}>
          {step === 1 && 'Enter your email to receive an OTP'}
          {step === 2 && 'Enter the OTP sent to your email'}
          {step === 3 && 'Set your new password'}
        </Text>

        {step === 1 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={sendOtp}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={verifyOtp}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={resetPassword}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
});
