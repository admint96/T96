import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import {API_URL} from '../../../../config';

const getPasswordStrength = (password) => {
  const rules = [/.{8,}/, /[A-Z]/, /[0-9]/];
  const score = rules.reduce((acc, regex) => acc + regex.test(password), 0);
  if (score <= 1) return { label: 'Weak', color: 'red', percent: 0.25 };
  if (score === 2) return { label: 'Medium', color: 'orange', percent: 0.5 };
  if (score === 3) return { label: 'Good', color: 'dodgerblue', percent: 0.75 };
  return { label: 'Strong', color: 'green', percent: 1 };
};

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const barWidth = new Animated.Value(strength.percent * 100);

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!currentPassword) {
      newErrors.current = 'Current password is required';
      valid = false;
    }

    if (!newPassword) {
      newErrors.new = 'New password is required';
      valid = false;
    } else {
      const rules = [
        { test: /.{8,}/, message: 'Must be at least 8 characters' },
        { test: /[A-Z]/, message: 'Must include an uppercase letter' },
        { test: /[0-9]/, message: 'Must include a number' },
      ];
      const failed = rules.filter(r => !r.test.test(newPassword));
      if (failed.length > 0) {
        newErrors.new = failed[0].message;
        valid = false;
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setErrors({ global: 'Session expired. Please log in again.' });
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.goBack();
      } else {
        setErrors({ global: data.message || 'Failed to change password' });
      }
    } catch (err) {
      setErrors({ global: 'Something went wrong. Try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.heading}>Change Password</Text>
            </View>

            {errors.global && <Text style={styles.errorText}>{errors.global}</Text>}

            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your current password"
                  placeholderTextColor={'#999'}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Icon name={showCurrent ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.current && <Text style={styles.errorText}>{errors.current}</Text>}
            </View>

            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter a new password"
                  placeholderTextColor={'#999'}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={text => {
                    setNewPassword(text);
                    Animated.timing(barWidth, {
                      toValue: getPasswordStrength(text).percent * 100,
                      duration: 300,
                      useNativeDriver: false,
                    }).start();
                  }}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Icon name={showNew ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.strengthBarContainer}>
                <Animated.View
                  style={[
                    styles.strengthBar,
                    {
                      width: barWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                Strength: {strength.label}
              </Text>
              {errors.new && <Text style={styles.errorText}>{errors.new}</Text>}
            </View>

           
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your new password"
                  placeholderTextColor={'#999'}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon name={showConfirm ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
            </View>

            
            <TouchableOpacity
              style={styles.button}
              onPress={handleChangePassword}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>

           
            <TouchableOpacity
              style={styles.passwordRow}
              onPress={() => navigation.navigate('ForgotPasswordScreen')}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  strengthBar: {
    height: 6,
    borderRadius: 4,
  },
  strengthText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  passwordRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});
