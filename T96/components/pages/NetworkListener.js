import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const NetworkListener = () => {
  const [isConnected, setIsConnected] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 50,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const retryConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);

    if (state.isConnected) {
      Toast.show({
        type: 'success',
        text1: 'Connection Restored',
        position: 'top',
        visibilityTime: 2000,
        topOffset: 50,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Still No Internet',
        position: 'top',
        visibilityTime: 2000,
        topOffset: 50,
      });
    }
  };

  if (!isConnected) {
    return (
      <View style={styles.overlay}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png' }}
          style={styles.image}
        />
        <Text style={styles.text}>Network Connection Error</Text>
        <TouchableOpacity onPress={retryConnection} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#e11d48',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NetworkListener;
