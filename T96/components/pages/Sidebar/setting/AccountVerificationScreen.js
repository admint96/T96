import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {API_URL} from '../../../../config';

const AccountSettingsScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found in AsyncStorage');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Fetched user data:', data);

      if (response.ok) {
        setEmail(data.email || '');
        setEmailVerified(data.emailVerified || false);
      } else {
        console.warn('Failed to fetch user:', data.message);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('[AccountSettingsScreen] Screen focused. Fetching user...');
      fetchUser();

      return () => {
        console.log('[AccountSettingsScreen] Screen unfocused.');
      };
    }, [])
  );

  const renderField = (label, value, verified, fieldType) => (
    <View style={styles.card} key={fieldType}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtext}>
        Recruiters will reach you on this email
      </Text>
      <View style={styles.row}>
        <Text style={styles.infoText}>{value}</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (!verified) {
              navigation.navigate('EditEmailMobileVerify', {
                type: fieldType,
                currentValue: value,
                verified: verified,
              });
            }
          }}
        >
          {verified ? (
            <View style={styles.verifyWrapper}>
              <Icon name="check-circle" size={22} color="green" />
            </View>
          ) : (
            <View style={styles.verifyWrapper}>
              <Text style={styles.verifyText}>Verify</Text>
              <Icon name="arrow-right" size={16} color="#007bff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} />
          </TouchableOpacity>
          <Text style={styles.heading}>Account</Text>
        </View>
        <View style={styles.hr} />

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            {renderField('Email', email, emailVerified, 'email')}

            <TouchableOpacity
              style={styles.passwordRow}
              onPress={() => navigation.navigate('ChangePasswordScreen')}
            >
              <Text style={styles.label}>Password</Text>
              <Text style={styles.linkText}>Change password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  hr: {
    height: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 15,
    marginBottom: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtext: {
    color: '#777',
    fontSize: 13,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
  },
  passwordRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  verifyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyText: {
    color: '#007bff',
    fontWeight: 'bold',
    marginRight: 4,
  },
});
