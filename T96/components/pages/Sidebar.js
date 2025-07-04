import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {API_URL} from '../../config';

const Sidebar = ({ closeDrawer }) => {
  const navigation = useNavigation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (closeDrawer) {
          closeDrawer();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => {
        backHandler.remove();
      };
    }, [closeDrawer])
  );

  // Logout handler
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.replace('RoleSelect');
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Authentication Error', 'User not logged in.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/users/userdata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await response.json();

        setUser({
          ...userData,
          fullName: userData.fullName || 'User Name',
          qualification: (() => {
            const educationArray = userData.education || [];
            if (educationArray.length === 0) return 'Qualification not set';

            const priority = {
              'Doctorate': 4,
              'Post Graduate': 3,
              'Graduate/Diploma': 2,
              'Class XII': 1,
              'Class X': 0,
            };

            const highest = educationArray.reduce((prev, curr) => {
              const prevPriority = priority[prev.qualification] ?? -1;
              const currPriority = priority[curr.qualification] ?? -1;
              return currPriority > prevPriority ? curr : prev;
            });

            return highest.course || highest.qualification || 'Qualification not set';
          })(),
          profileImage: userData.profileImage || 'https://via.placeholder.com/60',
        });
      } catch (err) {
        console.log('User fetch error:', err.message);
        Alert.alert('Error', 'Could not load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const navigateAndClose = (screen) => {
    if (closeDrawer) closeDrawer();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 50);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const menuItems = [
    { title: 'Home', icon: 'home', screen: 'Home' },
    {
      title: 'Prepare',
      icon: 'school',
      submenu: [
        { label: 'Mock Interviews', screen: 'MockInterviews' },
        { label: 'Tutorials', screen: 'Tutorials' },
      ],
    },
    {
      title: 'Participate',
      icon: 'emoji-events',
      submenu: [
        { label: 'Contests', screen: 'Contests' },
        { label: 'All India NCAT', screen: 'NCAT' },
        { label: 'Young Turks', screen: 'YoungTurks' },
        { label: 'Campus Squad', screen: 'CampusSquad' },
        { label: 'Ring of Honour', screen: 'RingOfHonour' },
      ],
    },
    {
      title: 'Opportunities',
      icon: 'work',
      submenu: [
        { label: 'Search', screen: 'JobSearch' },
        { label: 'Applied Jobs', screen: 'appliedjobs' },
        { label: 'Recommended Jobs', screen: 'RecommendedJobs' },
        { label: 'Saved Jobs', screen: 'SavedJobs' },
      ],
    },
    {
      title: 'Profile Performance',
      icon: 'insights',
      submenu: [
        { label: 'Resume Score', screen: 'ResumeScore' },
        { label: 'Insights', screen: 'Insights' },
      ],
    },
    { title: 'Settings', icon: 'settings', screen: 'Setting' },
    { title: 'Feedback', icon: 'feedback', screen: 'Feedback' },
    { title: 'Help', icon: 'help', screen: 'Help' },
    { title: 'About Us', icon: 'info', screen: 'AboutUs' },
    { title: 'Logout', icon: 'logout', isLogout: true },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => {
          if (closeDrawer) closeDrawer();
          navigation.navigate('Home');
        }}
      >
        <MaterialIcons name="arrow-back" size={30} color="#6b21a8" />
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <Image source={{ uri: user?.profileImage }} style={styles.profilePic} />
        <Text style={styles.userName}>{user?.fullName}</Text>
        <Text style={styles.userDetail}>{user?.qualification}</Text>
        <TouchableOpacity onPress={() => navigateAndClose('Profile')}>
          <Text style={styles.updateProfile}>View & update profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {menuItems.map((item, index) => (
        <View key={index}>
          <TouchableOpacity
            style={[styles.menuItem, item.isLogout ? styles.logoutItem : null]}
            onPress={() => {
              if (item.isLogout) {
                handleLogout();
              } else if (item.submenu) {
                setExpandedMenu(expandedMenu === index ? null : index);
              } else {
                navigateAndClose(item.screen);
              }
            }}
          >
            <MaterialIcons
              name={item.icon}
              size={22}
              color={item.isLogout ? '#dc2626' : '#555'}
            />
            <Text style={[styles.menuText, item.isLogout && { color: '#dc2626' }]}>
              {item.title}
            </Text>
            {item.submenu && (
              <MaterialIcons
                name={expandedMenu === index ? 'expand-less' : 'expand-more'}
                size={22}
                color="#555"
              />
            )}
          </TouchableOpacity>

          {expandedMenu === index && item.submenu && (
            <View style={styles.subMenu}>
              {item.submenu.map((subItem, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  onPress={() => navigateAndClose(subItem.screen)}
                  style={styles.subMenuItem}
                >
                  <Text style={styles.subMenuText}>{subItem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
  },
  profileSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f1f1',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  userDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  updateProfile: {
    fontSize: 13,
    color: '#007bff',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    backgroundColor: '#fee2e2',
  },
  subMenu: {
    paddingLeft: 40,
    backgroundColor: '#fafafa',
  },
  subMenuItem: {
    paddingVertical: 8,
  },
  subMenuText: {
    fontSize: 14,
    color: '#555',
  },
});

export default Sidebar;
