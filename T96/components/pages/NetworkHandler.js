// NetworkHandler.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NetworkHandler = ({ children, fetchFunction }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected) {
      handleFetchWithTimeout();
    }
  }, [isConnected]);

  const handleFetchWithTimeout = () => {
    setLoading(true);
    setServerDown(false);

    let didFinish = false;

    // Set 10 second timeout
    const timeoutId = setTimeout(() => {
      if (!didFinish) {
        setLoading(false);
        setServerDown(true);
      }
    }, 10000);

    // Try fetchFunction immediately
    fetchFunction()
      .then(() => {
        if (!didFinish) {
          didFinish = true;
          clearTimeout(timeoutId);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log('Fetch failed:', err.message);
        if (!didFinish) {
          didFinish = true;
          clearTimeout(timeoutId);
          setLoading(false);
          setServerDown(true);
        }
      });
  };

  if (!isConnected) {
    return (
      <View style={styles.center}>
        <Ionicons name="wifi-outline" size={64} color="gray" />
        <Text style={styles.error}>📴 You're offline</Text>
        <TouchableOpacity onPress={handleFetchWithTimeout}>
          <Text style={styles.retry}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.message}>Loading Data...</Text>
      </View>
    );
  }

  if (serverDown) {
    return (
      <View style={styles.center}>
        <Ionicons name="server-outline" size={64} color="red" />
        <Text style={styles.error}>🔥 Server is down</Text>
        <TouchableOpacity onPress={handleFetchWithTimeout}>
          <Text style={styles.retry}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
  },
  retry: {
    marginTop: 12,
    fontSize: 16,
    color: '#3b82f6',
  },
});

export default NetworkHandler;
