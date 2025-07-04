import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const handleLogout = async (navigation) => {
  try {
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    navigation.replace('RoleSelect');
  } catch (error) {
    console.log('Logout error:', error);
    Alert.alert('Error', 'Failed to logout. Please try again.');
  }
};

const SideDrawer = ({ animation, closeDrawer }) => {
  const navigation = useNavigation();
  const [recruiter, setRecruiter] = useState({
    fullName: 'Loading...',
    profileImage: 'https://via.placeholder.com/70',
  });

  useEffect(() => {
    const fetchRecruiter = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/recruiters/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch recruiter profile');
        const data = await response.json();
        setRecruiter({
          fullName: data.fullName || 'Recruiter',
          profileImage: data.profileImage || 'https://via.placeholder.com/70',
        });
      } catch (err) {
        console.error('Error fetching recruiter:', err);
      }
    };

    fetchRecruiter();
  }, []);

  const handleNavigate = (screen, skipClose = false) => {
    navigation.navigate(screen);
    if (!skipClose && closeDrawer) {
      closeDrawer();
    }
  };

  return (
    <Animated.View style={[styles.drawer, { transform: [{ translateX: animation }] }]}>
      <View style={styles.drawerContent}>
        <TouchableOpacity onPress={closeDrawer} style={styles.backArrow}>
  <MaterialIcons name="arrow-back" size={24} color="#333" />
</TouchableOpacity>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: recruiter.profileImage }} style={styles.profileImage} />
          <Text style={styles.profileName}>{recruiter.fullName}</Text>
        </View>

        {/* Menu Items */}
        <TouchableOpacity onPress={() => handleNavigate('Home-R')} style={styles.menuRow}>
          <Text style={styles.item}>Home</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleNavigate('RecruiterProfile')} style={styles.menuRow}>
          <Text style={styles.item}>Profile</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('') } style={styles.menuRow}>
          <Text style={styles.item}>AI Tool Assist</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() =>navigation.navigate('Setting')} style={styles.menuRow}>
          <Text style={styles.item}>Settings</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#555" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity onPress={() => handleLogout(navigation)} style={styles.menuRow}>
          <Text style={[styles.item, { color: '#E53935' }]}>Logout</Text>
          <MaterialIcons name="logout" size={18} color="#E53935" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  drawerContent: {
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  item: {
    fontSize: 16,
    color: '#333',
  },
  backArrow: {
  position: 'absolute',
  top: 20,
  left: 15,
  zIndex: 10,
  padding: 5,
},

});

export default SideDrawer;
