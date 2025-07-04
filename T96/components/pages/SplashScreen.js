import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      handleRedirect();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      console.log('Role from AsyncStorage:', role);

      if (role === 'jobSeeker') {
        navigation.replace('Home');
      } else if (role === 'recruiter') {
        navigation.replace('Home-R');
      } else {
        navigation.replace('RoleSelect');
      }
    } catch (error) {
      console.error('Token Error:', error);
      navigation.replace('RoleSelect');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/logo2.png')}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
